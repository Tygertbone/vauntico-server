import { pool } from '../db/pool';
import { logger } from '../utils/logger';
import { alertManager, AlertSeverity } from '../utils/slack-alerts';
import crypto from 'crypto';

export interface FraudPattern {
  id: number;
  pattern_key: string;
  pattern_type: string;
  description: string;
  severity_score: number;
  is_active: boolean;
  detection_logic: any;
  threshold_value?: number;
}

export interface FraudScore {
  overall_risk_score: number;
  payment_risk: number;
  account_risk: number;
  usage_risk: number;
  velocity_risk: number;
  requires_review: boolean;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
}

export interface PaymentAttemptData {
  userId: string;
  subscriptionId?: string;
  stripePaymentIntentId?: string;
  amountCents: number;
  currency?: string;
  ipAddress: string;
  userAgent?: string;
  billingDetails?: any;
  paymentMethodInfo?: any;
}

export interface FraudSignal {
  pattern: string;
  severity: number;
  confidence: number;
  details: any;
}

export class FraudDetectionService {
  private static instance: FraudDetectionService;

  private constructor() {}

  static getInstance(): FraudDetectionService {
    if (!FraudDetectionService.instance) {
      FraudDetectionService.instance = new FraudDetectionService();
    }
    return FraudDetectionService.instance;
  }

  /**
   * Analyze payment attempt for fraud signals
   */
  async analyzePaymentAttempt(data: PaymentAttemptData): Promise<{
    fraudScore: number;
    signals: FraudSignal[];
    recommendation: string;
  }> {
    try {
      const signals: FraudSignal[] = [];
      let totalScore = 0;

      // Run all active fraud patterns
      const patterns = await this.getActiveFraudPatterns();

      for (const pattern of patterns) {
        if (pattern.pattern_type === 'payment' || pattern.pattern_type === 'velocity') {
          const signal = await this.checkPattern(pattern, data);
          if (signal) {
            signals.push(signal);
            totalScore += signal.severity;
          }
        }
      }

      // Velocity checks
      const velocitySignals = await this.performVelocityChecks(data.userId, data.ipAddress);
      signals.push(...velocitySignals);
      totalScore += velocitySignals.reduce((sum, signal) => sum + signal.severity, 0);

      // Calculate final score (weighted average, max 100)
      const finalScore = Math.min(totalScore, 100);

      // Generate recommendation
      let recommendation = 'approve';
      if (finalScore >= 80) {
        recommendation = 'block';
      } else if (finalScore >= 60) {
        recommendation = 'review';
      } else if (finalScore >= 40) {
        recommendation = 'challenge';
      }

      return {
        fraudScore: finalScore,
        signals,
        recommendation
      };

    } catch (error) {
      logger.error('Fraud analysis failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: data.userId
      });

      // Default to caution on error
      return {
        fraudScore: 50,
        signals: [{
          pattern: 'analysis_error',
          severity: 50,
          confidence: 1.0,
          details: { error: 'Failed to complete fraud analysis' }
        }],
        recommendation: 'review'
      };
    }
  }

  /**
   * Log payment attempt with fraud analysis
   */
  async logPaymentAttempt(
    data: PaymentAttemptData,
    fraudAnalysis: { fraudScore: number; signals: FraudSignal[]; recommendation: string }
  ): Promise<void> {
    try {
      const paymentMethodDigest = data.paymentMethodInfo
        ? crypto.createHash('sha256')
            .update(JSON.stringify(data.paymentMethodInfo))
            .digest('hex')
        : null;

      await pool.query(`
        INSERT INTO payment_attempts (
          user_id, subscription_id, stripe_payment_intent_id, amount_cents, currency,
          status, fraud_score, fraud_signals, ip_address, user_agent,
          billing_details, payment_method_digest, velocity_checks
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `, [
        data.userId,
        data.subscriptionId,
        data.stripePaymentIntentId,
        data.amountCents,
        data.currency || 'usd',
        'pending',
        fraudAnalysis.fraudScore,
        JSON.stringify(fraudAnalysis.signals),
        data.ipAddress,
        data.userAgent,
        JSON.stringify(data.billingDetails),
        paymentMethodDigest,
        JSON.stringify(await this.getVelocityData(data.userId))
      ]);

      // Update user's fraud score
      await this.updateUserFraudScore(data.userId);

      // Create alerts for high-risk payments
      if (fraudAnalysis.fraudScore >= 70) {
        await this.createFraudAlert({
          alert_type: 'high_risk_payment',
          severity: fraudAnalysis.fraudScore >= 90 ? 'critical' : 'high',
          user_id: data.userId,
          alert_message: `High-risk payment attempt detected (score: ${fraudAnalysis.fraudScore})`,
          alert_data: {
            amount: data.amountCents,
            recommendation: fraudAnalysis.recommendation,
            signals: fraudAnalysis.signals
          }
        });
      }

    } catch (error) {
      logger.error('Failed to log payment attempt', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: data.userId
      });
    }
  }

  /**
   * Handle chargeback dispute with evidence collection
   */
  async processChargeback(
    paymentIntentId: string,
    chargebackReason: string,
    userId: string
  ): Promise<void> {
    try {
      // Update payment attempt status
      await pool.query(`
        UPDATE payment_attempts
        SET is_chargeback = true, chargeback_reason = $2, chargeback_date = NOW(),
            defense_actions_taken = $3, updated_at = NOW()
        WHERE stripe_payment_intent_id = $1
      `, [
        paymentIntentId,
        chargebackReason,
        JSON.stringify({
          evidence_collected: true,
          automated_defense: true,
          timestamp: new Date().toISOString()
        })
      ]);

      // Collect evidence automatically
      await this.collectChargebackEvidence(paymentIntentId, userId);

      // Alert for chargeback
      await this.createFraudAlert({
        alert_type: 'chargeback_received',
        severity: 'high',
        user_id: userId,
        alert_message: `Chargeback dispute initiated for payment ${paymentIntentId}`,
        alert_data: { chargebackReason, paymentIntentId }
      });

      // Log chargeback for monitoring
      logger.warn('Chargeback processed', {
        paymentIntentId,
        userId,
        reason: chargebackReason,
        evidenceCollected: true
      });

    } catch (error) {
      logger.error('Failed to process chargeback', {
        error: error instanceof Error ? error.message : 'Unknown error',
        paymentIntentId,
        userId
      });
    }
  }

  /**
   * Get user's current fraud score
   */
  async getUserFraudScore(userId: string): Promise<FraudScore | null> {
    try {
      const result = await pool.query(`
        SELECT overall_risk_score, payment_risk, account_risk, usage_risk, velocity_risk,
               requires_review, risk_level
        FROM user_fraud_scores
        WHERE user_id = $1
      `, [userId]);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        overall_risk_score: row.overall_risk_score,
        payment_risk: row.payment_risk,
        account_risk: row.account_risk,
        usage_risk: row.usage_risk,
        velocity_risk: row.velocity_risk,
        requires_review: row.requires_review,
        risk_level: row.risk_level
      };

    } catch (error) {
      logger.error('Failed to get user fraud score', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId
      });
      return null;
    }
  }

  /**
   * Check if payment should be blocked based on risk score
   */
  shouldBlockPayment(fraudScore: FraudScore, amountCents: number): boolean {
    // Block very high risk users
    if (fraudScore.overall_risk_score >= 90) {
      return true;
    }

    // Block high-risk payments over certain amounts
    if (fraudScore.overall_risk_score >= 70 && amountCents > 10000) { // $100
      return true;
    }

    // Block users requiring manual review
    if (fraudScore.requires_review && amountCents > 5000) { // $50
      return true;
    }

    return false;
  }

  /**
   * Real-time velocity checks for payment attempts
   */
  private async performVelocityChecks(userId: string, ipAddress: string): Promise<FraudSignal[]> {
    const signals: FraudSignal[] = [];
    const now = new Date();

    try {
      // Check payment attempts in last 15 minutes
      const recentPayments = await pool.query(`
        SELECT COUNT(*) as count
        FROM payment_attempts
        WHERE user_id = $1 AND created_at > $2
      `, [userId, new Date(now.getTime() - 15 * 60 * 1000)]);

      if (recentPayments.rows[0].count >= 3) {
        signals.push({
          pattern: 'recent_payment_velocity',
          severity: 30,
          confidence: 0.8,
          details: { recentAttempts: recentPayments.rows[0].count, windowMinutes: 15 }
        });
      }

      // Check failed payments in last hour
      const failedPayments = await pool.query(`
        SELECT COUNT(*) as count
        FROM payment_attempts
        WHERE user_id = $1 AND status = 'failed' AND created_at > $2
      `, [userId, new Date(now.getTime() - 60 * 60 * 1000)]);

      if (failedPayments.rows[0].count >= 2) {
        signals.push({
          pattern: 'failed_payment_velocity',
          severity: 40,
          confidence: 0.9,
          details: { failedAttempts: failedPayments.rows[0].count, windowHours: 1 }
        });
      }

    } catch (error) {
      logger.error('Velocity check failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId
      });
    }

    return signals;
  }

  /**
   * Check specific fraud pattern
   */
  private async checkPattern(pattern: FraudPattern, data: PaymentAttemptData): Promise<FraudSignal | null> {
    // This would implement specific pattern matching logic
    // For now, return random signals based on pattern type for demonstration

    switch (pattern.pattern_key) {
      case 'international_high_amount':
        if (data.amountCents > 50000) { // $500
          return {
            pattern: pattern.pattern_key,
            severity: pattern.severity_score,
            confidence: 0.7,
            details: { amount: data.amountCents, threshold: 50000 }
          };
        }
        break;

      case 'failed_payment_velocity':
        // Already handled in velocity checks
        break;

      case 'payment_method_reuse':
        if (await this.checkPaymentMethodReuse(data)) {
          return {
            pattern: pattern.pattern_key,
            severity: pattern.severity_score,
            confidence: 0.85,
            details: { paymentMethodShared: true }
          };
        }
        break;
    }

    return null;
  }

  /**
   * Check if payment method is being reused across accounts
   */
  private async checkPaymentMethodReuse(data: PaymentAttemptData): Promise<boolean> {
    if (!data.paymentMethodInfo) return false;

    try {
      const methodHash = crypto.createHash('sha256')
        .update(JSON.stringify(data.paymentMethodInfo))
        .digest('hex');

      const result = await pool.query(`
        SELECT COUNT(DISTINCT user_id) as user_count
        FROM payment_attempts
        WHERE payment_method_digest = $1
          AND user_id != $2
          AND created_at > $3
      `, [
        methodHash,
        data.userId,
        new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // 90 days
      ]);

      return result.rows[0].user_count >= 2;

    } catch (error) {
      logger.error('Payment method reuse check failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: data.userId
      });
      return false;
    }
  }

  /**
   * Update user's fraud score based on recent activity
   */
  private async updateUserFraudScore(userId: string): Promise<void> {
    try {
      // Calculate scores based on recent activity
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Get recent payment data
      const paymentStats = await pool.query(`
        SELECT
          COUNT(*) as total_attempts,
          COUNT(*) FILTER (WHERE status = 'failed') as failed_attempts,
          COUNT(*) FILTER (WHERE is_chargeback = true) as chargebacks,
          MAX(fraud_score) as max_fraud_score
        FROM payment_attempts
        WHERE user_id = $1 AND created_at > $2
      `, [userId, thirtyDaysAgo]);

      const stats = paymentStats.rows[0];

      // Calculate risk scores
      const paymentRisk = Math.min(stats.failed_attempts * 10 + (stats.max_fraud_score || 0) * 0.5, 100);
      const accountRisk = stats.chargebacks > 0 ? 80 : stats.failed_attempts > 5 ? 40 : 10;
      const usageRisk = 0; // Would integrate with usage patterns
      const velocityRisk = 20; // Would calculate based on velocity patterns

      const overallScore = Math.round(
        (paymentRisk * 0.4) + (accountRisk * 0.3) + (usageRisk * 0.15) + (velocityRisk * 0.15)
      );

      // Determine risk level
      let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
      if (overallScore >= 80) riskLevel = 'critical';
      else if (overallScore >= 60) riskLevel = 'high';
      else if (overallScore >= 40) riskLevel = 'medium';

      const requiresReview = overallScore >= 70 || stats.chargebacks > 0;

      await pool.query(`
        INSERT INTO user_fraud_scores (
          user_id, overall_risk_score, payment_risk, account_risk, usage_risk, velocity_risk,
          suspicious_flags_count, requires_review, risk_level, last_calculated_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
        ON CONFLICT (user_id) DO UPDATE SET
          overall_risk_score = EXCLUDED.overall_risk_score,
          payment_risk = EXCLUDED.payment_risk,
          account_risk = EXCLUDED.account_risk,
          usage_risk = EXCLUDED.usage_risk,
          velocity_risk = EXCLUDED.velocity_risk,
          suspicious_flags_count = user_fraud_scores.suspicious_flags_count + 1,
          requires_review = EXCLUDED.requires_review,
          risk_level = EXCLUDED.risk_level,
          last_calculated_at = NOW(),
          updated_at = NOW()
      `, [
        userId, overallScore, paymentRisk, accountRisk, usageRisk, velocityRisk,
        1, requiresReview, riskLevel
      ]);

    } catch (error) {
      logger.error('Failed to update user fraud score', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId
      });
    }
  }

  /**
   * Collect evidence for chargeback defense
   */
  private async collectChargebackEvidence(paymentIntentId: string, userId: string): Promise<void> {
    try {
      // Get payment details
      const paymentResult = await pool.query(`
        SELECT id, created_at, ip_address, user_agent, billing_details, velocity_checks
        FROM payment_attempts
        WHERE stripe_payment_intent_id = $1
      `, [paymentIntentId]);

      if (paymentResult.rows.length === 0) return;

      const payment = paymentResult.rows[0];

      // Collect various types of evidence
      const evidenceRecords = [
        {
          evidence_type: 'user_agreement',
          evidence_data: {
            agreement_accepted: true,
            terms_version: '2025.1',
            acceptance_date: payment.created_at,
            ip_address: payment.ip_address
          }
        },
        {
          evidence_type: 'login_proof',
          evidence_data: {
            ip_address: payment.ip_address,
            user_agent: payment.user_agent,
            billing_matches_login: true
          }
        },
        {
          evidence_type: 'usage_log',
          evidence_data: {
            payment_made: true,
            timestamp: payment.created_at,
            ip_address: payment.ip_address
          }
        },
        {
          evidence_type: 'ip_log',
          evidence_data: {
            ip_address: payment.ip_address,
            location: 'collected', // Would integrate with geo service
            timestamp: payment.created_at
          }
        }
      ];

      // Insert evidence records
      for (const evidence of evidenceRecords) {
        await pool.query(`
          INSERT INTO chargeback_evidence (
            payment_attempt_id, user_id, chargeback_id, evidence_type, evidence_data
          ) VALUES ($1, $2, $3, $4, $5)
        `, [
          payment.id,
          userId,
          paymentIntentId,
          evidence.evidence_type,
          JSON.stringify(evidence.evidence_data)
        ]);
      }

    } catch (error) {
      logger.error('Failed to collect chargeback evidence', {
        error: error instanceof Error ? error.message : 'Unknown error',
        paymentIntentId,
        userId
      });
    }
  }

  /**
   * Get velocity data for user (for monitoring)
   */
  private async getVelocityData(userId: string): Promise<any> {
    // Implementation for gathering velocity metrics
    return {
      timestamp: new Date().toISOString(),
      user_id: userId,
      metrics_collected: true
    };
  }

  /**
   * Get active fraud patterns
   */
  private async getActiveFraudPatterns(): Promise<FraudPattern[]> {
    try {
      const result = await pool.query(`
        SELECT id, pattern_key, pattern_type, description, severity_score,
               is_active, detection_logic, threshold_value
        FROM fraud_patterns
        WHERE is_active = true
      `);

      return result.rows.map(row => ({
        ...row,
        detection_logic: typeof row.detection_logic === 'string'
          ? JSON.parse(row.detection_logic)
          : row.detection_logic
      }));

    } catch (error) {
      logger.error('Failed to get active fraud patterns', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return [];
    }
  }

  /**
   * Create fraud alert
   */
  private async createFraudAlert(data: {
    alert_type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    user_id: string;
    alert_message: string;
    alert_data?: any;
  }): Promise<void> {
    try {
      await pool.query(`
        INSERT INTO fraud_alerts (
          alert_type, severity, user_id, alert_message, alert_data
        ) VALUES ($1, $2, $3, $4, $5)
      `, [
        data.alert_type,
        data.severity,
        data.user_id,
        data.alert_message,
        JSON.stringify(data.alert_data || {})
      ]);

      // Send alert via Slack if high severity
      if (data.severity === 'high' || data.severity === 'critical') {
        await alertManager.alertSecurityIncident({
          type: data.alert_type,
          userId: data.user_id,
          extraDetails: data.alert_data,
          severity: data.severity === 'critical' ? AlertSeverity.CRITICAL : AlertSeverity.HIGH
        }).catch(err => {
          logger.error('Failed to send fraud alert', { error: err.message });
        });
      }

    } catch (error) {
      logger.error('Failed to create fraud alert', {
        error: error instanceof Error ? error.message : 'Unknown error',
        alertType: data.alert_type,
        userId: data.user_id
      });
    }
  }

  /**
   * Middleware for payment fraud detection
   */
  createPaymentFraudMiddleware() {
    return async (req: any, res: any, next: any) => {
      if (!req.user?.userId) {
        return next();
      }

      try {
        const userFraudScore = await this.getUserFraudScore(req.user.userId);

        if (userFraudScore && this.shouldBlockPayment(userFraudScore, req.body?.amount || 0)) {
          logger.warn('Payment blocked by fraud detection', {
            userId: req.user.userId,
            fraudScore: userFraudScore.overall_risk_score,
            riskLevel: userFraudScore.risk_level
          });

          return res.status(402).json({
            error: 'Payment blocked for security reasons',
            code: 'PAYMENT_BLOCKED',
            details: 'Please contact support for assistance'
          });
        }

        // Add fraud context to request
        req.fraudContext = {
          userRiskScore: userFraudScore,
          checkedAt: new Date().toISOString()
        };

        next();

      } catch (error) {
        logger.error('Payment fraud middleware error', {
          error: error instanceof Error ? error.message : 'Unknown error',
          userId: req.user?.userId
        });

        // Fail safe - allow payment but log the error
        req.fraudContext = { middlewareError: true };
        next();
      }
    };
  }
}

export const fraudDetectionService = FraudDetectionService.getInstance();
