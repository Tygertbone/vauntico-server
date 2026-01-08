import { Resend } from 'resend';
import { pool } from '../db/pool';
import { logger } from '../utils/logger';
import { sendSlackAlert } from '../utils/slack-alerts';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailTemplateData {
  firstName?: string;
  upgradeUrl: string;
  unsubscribeUrl?: string;
  loginUrl?: string;
  [key: string]: any;
}

interface EmailCampaign {
  id: number;
  campaignName: string;
  campaignType: string;
  subjectTemplate: string;
  bodyTemplate: string;
  triggerEvent: string;
  delayDays: number;
  delayHours: number;
  targetUserType: string;
}

interface EmailSend {
  id: number;
  userId: number;
  campaignId: number;
  sentAt?: Date;
  status: string;
  metadata: Record<string, any>;
}

export class EmailCampaignService {
  /**
   * Renders email template with dynamic data
   */
  private renderTemplate(template: string, data: EmailTemplateData): string {
    let rendered = template;

    // Replace all {{variable}} patterns
    for (const [key, value] of Object.entries(data)) {
      const placeholder = `{{${key}}}`;
      rendered = rendered.replace(new RegExp(placeholder, 'g'), value?.toString() || '');
    }

    return rendered;
  }

  /**
   * Gets email template data for a user
   */
  private async getTemplateData(userId: number): Promise<EmailTemplateData> {
    try {
      const userResult = await pool.query(
        'SELECT email, first_name FROM users WHERE id = $1',
        [userId]
      );

      if (userResult.rows.length === 0) {
        throw new Error(`User ${userId} not found`);
      }

      const user = userResult.rows[0];

      // Generate upgrade URL with tracking parameters
      const baseUrl = process.env.FRONTEND_URL || 'https://vauntico.com';
      const upgradeUrl = `${baseUrl}/pricing?campaign=email&utm_source=email&utm_campaign=trial_nurture&utm_user=${userId}`;

      const loginUrl = `${baseUrl}/login`;
      const unsubscribeUrl = `${baseUrl}/unsubscribe?user=${userId}`;

      return {
        firstName: user.first_name || 'Creator',
        upgradeUrl,
        loginUrl,
        unsubscribeUrl,
      };
    } catch (error) {
      logger.error('Failed to get email template data', { userId, error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  }

  /**
   * Sends a campaign email to a user
   */
  async sendCampaignEmail(userId: number, campaign: EmailCampaign): Promise<boolean> {
    try {
      // Get user email and template data
      const userResult = await pool.query(
        'SELECT email FROM users WHERE id = $1',
        [userId]
      );

      if (userResult.rows.length === 0) {
        logger.warn('User not found for email campaign', { userId, campaignId: campaign.id });
        return false;
      }

      const userEmail = userResult.rows[0].email;
      const templateData = await this.getTemplateData(userId);

      // Render subject and body
      const subject = this.renderTemplate(campaign.subjectTemplate, templateData);
      const body = this.renderTemplate(campaign.bodyTemplate, templateData);

      // Add unsubscribe footer
      const fullBody = `${body}

---
This email was sent to you because you're a valued Vauntico member.
Don't want these emails? ${templateData.unsubscribeUrl ? `[Unsubscribe](${templateData.unsubscribeUrl})` : 'Contact us to unsubscribe'}

Vauntico - Ship 10x Faster with AI
${process.env.FRONTEND_URL || 'https://vauntico.com'}`;

      // Send email via Resend with tracking
      const emailData = {
        from: `${process.env.EMAIL_FROM_NAME || 'Vauntico'} <noreply@vauntico.com>`,
        to: userEmail,
        subject,
        text: fullBody,
        tags: [
          { name: 'campaign', value: campaign.campaignName },
          { name: 'campaign_type', value: campaign.campaignType },
          { name: 'user_id', value: userId.toString() },
        ],
      };

      const result = await resend.emails.send(emailData);

      // Record the send in database
      await pool.query(
        `INSERT INTO email_sends
         (user_id, campaign_id, sent_at, status, metadata)
         VALUES ($1, $2, NOW(), 'sent', $3)`,
        [userId, campaign.id, JSON.stringify({ messageId: result.data?.id })]
      );

      logger.info('Campaign email sent successfully', {
        userId,
        campaignId: campaign.id,
        campaignName: campaign.campaignName,
        emailId: result.data?.id
      });

      return true;
    } catch (error) {
      logger.error('Failed to send campaign email', {
        userId,
        campaignId: campaign.id,
        campaignName: campaign.campaignName,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      // Record failed send
      try {
        await pool.query(
          `INSERT INTO email_sends
           (user_id, campaign_id, sent_at, status, metadata)
           VALUES ($1, $2, NOW(), 'bounced', $3)`,
          [userId, campaign.id, JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' })]
        );
      } catch (dbError) {
        logger.error('Failed to log bounced email', { userId, campaignId: campaign.id, dbError });
      }

      return false;
    }
  }

  /**
   * Gets all active campaigns for a specific trigger event
   */
  async getActiveCampaigns(triggerEvent: string): Promise<EmailCampaign[]> {
    try {
      const result = await pool.query(
        'SELECT * FROM email_campaigns WHERE is_active = true AND trigger_event = $1 ORDER BY delay_days, delay_hours',
        [triggerEvent]
      );

      return result.rows;
    } catch (error) {
      logger.error('Failed to get active campaigns', { triggerEvent, error: error instanceof Error ? error.message : 'Unknown error' });
      return [];
    }
  }

  /**
   * Records a user's feature usage for potential upgrade triggers
   */
  async recordFeatureUsage(userId: number, featureName: string): Promise<void> {
    try {
      const result = await pool.query(
        `INSERT INTO user_feature_usage (user_id, feature_name, usage_count, last_used_at)
         VALUES ($1, $2, 1, NOW())
         ON CONFLICT (user_id, feature_name)
         DO UPDATE SET
           usage_count = user_feature_usage.usage_count + 1,
           last_used_at = NOW()
         WHERE user_feature_usage.user_id = $1 AND user_feature_usage.feature_name = $2`,
        [userId, featureName]
      );

      // Check if we should trigger an upgrade prompt
      const usageResult = await pool.query(
        'SELECT usage_count, threshold_triggered FROM user_feature_usage WHERE user_id = $1 AND feature_name = $2',
        [userId, featureName]
      );

      if (usageResult.rows.length > 0) {
        const usage = usageResult.rows[0];

        // Define thresholds for different features
        const thresholds: Record<string, number> = {
          'ai_generation': 45, // Trigger when approaching 50/month limit
          'vault_create': 2,   // Trigger when approaching 3 vault limit
          'collaborator_add': 100, // Not triggered by count for paid features
        };

        const threshold = thresholds[featureName];
        if (threshold && usage.usage_count >= threshold && !usage.threshold_triggered) {
          // Trigger upgrade email
          await this.triggerUpgradeEmail(userId, featureName, usage.usage_count);

          // Mark threshold as triggered
          await pool.query(
            'UPDATE user_feature_usage SET threshold_triggered = true WHERE user_id = $1 AND feature_name = $2',
            [userId, featureName]
          );
        }
      }
    } catch (error) {
      logger.error('Failed to record feature usage', {
        userId,
        featureName,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Triggers an upgrade email when user approaches limits
   */
  private async triggerUpgradeEmail(userId: number, featureName: string, usageCount: number): Promise<void> {
    try {
      // Create a custom upgrade email for limit approaching
      const campaign = {
        id: 0, // This won't be stored in database
        campaignName: `limit_approaching_${featureName}`,
        campaignType: 'upgrade_reminder',
        subjectTemplate: `You're approaching your Vauntico limit ⚠️`,
        bodyTemplate: `Hi {{firstName}},

You've used ${usageCount} ${featureName.replace('_', ' ')}s this month. You're getting close to the free tier limit!

Free tier limits:
• 50 AI generations/month
• 3 vaults
• 1 GB storage

Upgrade to Creator Pass for unlimited features: {{upgradeUrl}}

Don't let limits slow you down! ✨`,
        triggerEvent: 'limit_approaching',
        delayDays: 0,
        delayHours: 0,
        targetUserType: 'free',
      };

      await this.sendCampaignEmail(userId, campaign);

      logger.info('Limit approaching email sent', { userId, featureName, usageCount });

      // Send Slack alert for potential conversion opportunity
      await sendSlackAlert(
        `💰 Conversion Opportunity: User ${userId} approaching ${featureName} limit (${usageCount} used)`,
        'email-campaigns'
      );
    } catch (error) {
      logger.error('Failed to trigger upgrade email', {
        userId,
        featureName,
        usageCount,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Gets email delivery statistics for campaigns
   */
  async getCampaignStats(days: number = 30): Promise<any> {
    try {
      const result = await pool.query(
        `SELECT
          ec.campaign_name,
          ec.campaign_type,
          COUNT(es.id) as total_sends,
          COUNT(CASE WHEN es.status = 'sent' THEN 1 END) as sent,
          COUNT(CASE WHEN es.status = 'delivered' THEN 1 END) as delivered,
          COUNT(CASE WHEN es.status = 'opened' THEN 1 END) as opened,
          COUNT(CASE WHEN es.status = 'clicked' THEN 1 END) as clicked,
          COUNT(CASE WHEN es.status = 'bounced' THEN 1 END) as bounced,
          AVG(CASE WHEN es.opened_at IS NOT NULL THEN EXTRACT(EPOCH FROM (es.opened_at - es.sent_at))/3600 END) as avg_time_to_open_hours
         FROM email_campaigns ec
         LEFT JOIN email_sends es ON ec.id = es.campaign_id
         WHERE es.sent_at > NOW() - INTERVAL '${days} days'
         GROUP BY ec.id, ec.campaign_name, ec.campaign_type
         ORDER BY total_sends DESC`,
        [days]
      );

      return result.rows;
    } catch (error) {
      logger.error('Failed to get campaign stats', { days, error: error instanceof Error ? error.message : 'Unknown error' });
      return [];
    }
  }
}

export const emailCampaignService = new EmailCampaignService();
