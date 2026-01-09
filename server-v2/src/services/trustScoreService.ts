interface TrustScore {
  score: number;
  factors: any;
  calculatedAt: Date;
  expiresAt: Date;
  creditsRemaining?: number;
  nextCalculationCost?: number;
  rateLimitRemaining?: number;
}

interface TrustScoreHistory {
  scores: TrustScore[];
  total: number;
  hasMore: boolean;
  creditsUsed?: number;
}

interface CalculationRequest {
  id: string;
  userId: string;
  tier: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  cost: number;
  startedAt: Date;
  estimatedTime?: number;
  completedAt?: Date;
  webhookUrl?: string;
}

interface QuotaCheck {
  allowed: boolean;
  message?: string;
  creditsRemaining?: number;
  rateLimitRemaining?: number;
}

// Mock database for Phase 2 demo
// In production, this would connect to actual database
class MockTrustScoreDatabase {
  private trustScores = new Map<string, TrustScore>();
  private calculations = new Map<string, CalculationRequest>();
  private userQuotas = new Map<string, { monthlyCalculations: number; creditsRemaining: number }>();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Mock user data for demo
    const mockUsers = [
      'user_001',
      'user_002', 
      'user_003',
      'user_004',
      'user_005'
    ];

    mockUsers.forEach(userId => {
      this.trustScores.set(userId, {
        score: Math.floor(Math.random() * 40) + 60, // Random score between 60-100
        factors: {
          content_quality: Math.floor(Math.random() * 20) + 80,
          engagement: Math.floor(Math.random() * 20) + 80,
          consistency: Math.floor(Math.random() * 20) + 80,
          follower_count: Math.floor(Math.random() * 1000) + 500,
          post_frequency: Math.floor(Math.random() * 5) + 1
        },
        calculatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time in last week
        expiresAt: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000), // Random expiry in next 30 days
        creditsRemaining: Math.floor(Math.random() * 10) + 5,
        nextCalculationCost: 1
      });

      this.userQuotas.set(userId, {
        monthlyCalculations: Math.floor(Math.random() * 5) + 1,
        creditsRemaining: Math.floor(Math.random() * 10) + 5
      });
    });
  }

  async getTrustScore(userId: string, tier: string): Promise<TrustScore | null> {
    // Simulate database query delay
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
    
    const score = this.trustScores.get(userId);
    if (!score) return null;

    // Add monetization context based on tier
    const tierBenefits = {
      basic: { maxDailyRequests: 100, costPerCalculation: 1 },
      pro: { maxDailyRequests: 1000, costPerCalculation: 0.5 },
      enterprise: { maxDailyRequests: 10000, costPerCalculation: 0.1 }
    };

    const benefits = tierBenefits[tier as keyof typeof tierBenefits] || tierBenefits.basic;

    return {
      ...score,
      rateLimitRemaining: benefits.maxDailyRequests - (Math.floor(Math.random() * 10) + 1),
      creditsRemaining: score.creditsRemaining || 0,
      nextCalculationCost: benefits.costPerCalculation
    };
  }

  async calculateTrustScore(userId: string, tier: string): Promise<CalculationRequest> {
    const calculationId = `calc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Check quota
    const quotaCheck = await this.checkCalculationQuota(userId, tier);
    if (!quotaCheck.allowed) {
      throw new Error(quotaCheck.message || 'Calculation quota exceeded');
    }

    const calculation: CalculationRequest = {
      id: calculationId,
      userId,
      tier,
      status: 'processing',
      cost: quotaCheck.creditsRemaining ? 1 : 0,
      startedAt: new Date(),
      estimatedTime: 30 + Math.random() * 60 // 30-90 seconds
    };

    this.calculations.set(calculationId, calculation);

    // Simulate async processing
    setTimeout(async () => {
      try {
        // Update calculation status to completed
        calculation.status = 'completed';
        calculation.completedAt = new Date();
        
        // Calculate new score (simple demo logic)
        const currentScore = this.trustScores.get(userId);
        if (!currentScore) {
          console.error(`No current score found for user ${userId}`);
          return;
        }
        const newScore = Math.floor(Math.random() * 20) + 70; // Random improvement

        // Update trust score
        this.trustScores.set(userId, {
          ...currentScore,
          score: newScore,
          calculatedAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          factors: {
            content_quality: Math.floor(Math.random() * 20) + 80,
            engagement: Math.floor(Math.random() * 20) + 80,
            consistency: Math.floor(Math.random() * 20) + 80,
            follower_count: Math.floor(Math.random() * 1000) + 500,
            post_frequency: Math.floor(Math.random() * 5) + 1
          }
        });

        console.log(`Trust score calculated for user ${userId}: ${currentScore.score} -> ${newScore}`);
        
      } catch (error) {
        calculation.status = 'failed';
        console.error('Calculation failed:', error);
      }
    }, (calculation.estimatedTime || 60) * 1000);

    return calculation;
  }

  async checkCalculationQuota(userId: string, tier: string): Promise<QuotaCheck> {
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const quota = this.userQuotas.get(userId);
    if (!quota) {
      return { allowed: false, message: 'User quota not found' };
    }

    const tierLimits = {
      basic: { maxCalculations: 5, maxCredits: 10 },
      pro: { maxCalculations: 50, maxCredits: 100 },
      enterprise: { maxCalculations: 500, maxCredits: 1000 }
    };

    const limits = tierLimits[tier as keyof typeof tierLimits] || tierLimits.basic;
    
    // Count calculations in current month
    const currentMonthCalculations = Array.from(this.calculations.values())
      .filter(calc => calc.userId === userId && 
                   calc.startedAt.getMonth() === new Date().getMonth() &&
                   calc.startedAt.getFullYear() === new Date().getFullYear())
      .length;

    if (currentMonthCalculations >= limits.maxCalculations || quota.creditsRemaining <= 0) {
      return { 
        allowed: false, 
        message: 'Monthly calculation quota exceeded',
        creditsRemaining: quota.creditsRemaining 
      };
    }

    return { 
      allowed: true, 
      creditsRemaining: quota.creditsRemaining,
      rateLimitRemaining: limits.maxCalculations - currentMonthCalculations
    };
  }

  async getTrustScoreHistory(
    userId: string, 
    tier: string, 
    limit: number, 
    offset: number
  ): Promise<TrustScoreHistory> {
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

    // Get user's score history (mock implementation)
    const allScores = Array.from(this.trustScores.entries())
      .filter(([id, score]) => id === userId)
      .map(([id, score]) => score);

    // Sort by calculated date (newest first)
    allScores.sort((a, b) => b.calculatedAt.getTime() - a.calculatedAt.getTime());

    const total = allScores.length;
    const startIndex = offset;
    const endIndex = Math.min(startIndex + limit, total);
    const scores = allScores.slice(startIndex, endIndex);
    const hasMore = endIndex < total;

    // Calculate credits used for history
    const creditsUsed = scores.length * (tier === 'basic' ? 1 : tier === 'pro' ? 0.5 : 0.1);

    return {
      scores,
      total,
      hasMore,
      creditsUsed
    };
  }
}

export class TrustScoreService {
  private static instance: MockTrustScoreDatabase;

  private static getInstance(): MockTrustScoreDatabase {
    if (!TrustScoreService.instance) {
      TrustScoreService.instance = new MockTrustScoreDatabase();
    }
    return TrustScoreService.instance;
  }

  static async getTrustScore(userId: string, tier: string): Promise<TrustScore | null> {
    return await TrustScoreService.getInstance().getTrustScore(userId, tier);
  }

  static async calculateTrustScore(userId: string, tier: string): Promise<CalculationRequest> {
    return await TrustScoreService.getInstance().calculateTrustScore(userId, tier);
  }

  static async checkCalculationQuota(userId: string, tier: string): Promise<QuotaCheck> {
    return await TrustScoreService.getInstance().checkCalculationQuota(userId, tier);
  }

  static async getTrustScoreHistory(
    userId: string,
    tier: string,
    limit: number,
    offset: number
  ): Promise<TrustScoreHistory> {
    return await TrustScoreService.getInstance().getTrustScoreHistory(userId, tier, limit, offset);
  }
}
