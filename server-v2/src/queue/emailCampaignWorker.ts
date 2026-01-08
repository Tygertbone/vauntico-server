import { pool } from '../db/pool';
import { logger } from '../utils/logger';
import { emailCampaignService } from '../services/emailCampaignService';
import { JobQueue, redis } from './upstash';

interface EmailJobData {
  userId: number;
  triggerEvent: string;
  delayDays?: number;
  delayHours?: number;
  campaignId?: number;
  context?: Record<string, any>;
}

interface SubscriptionEvent {
  userId: number;
  eventType: 'trial_start' | 'trial_end' | 'subscription_cancelled' | 'subscription_renewed';
  stripeSubscriptionId?: string;
  metadata?: Record<string, any>;
}

// Email Campaign Worker - handles all automated email sending
class EmailCampaignWorker {
  private jobQueue: JobQueue;
  private isProcessing: boolean = false;
  private scheduledJobs: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.jobQueue = new JobQueue('email-campaigns');

    // Start processing jobs
    this.startProcessing();

    logger.info('Email campaign worker initialized');
  }

  /**
   * Start background processing of email jobs
   */
  private async startProcessing(): Promise<void> {
    setInterval(async () => {
      if (this.isProcessing) return;

      try {
        this.isProcessing = true;
        await this.processNextJob();
      } catch (error) {
        logger.error('Email job processing error', {
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      } finally {
        this.isProcessing = false;
      }
    }, 5000); // Check every 5 seconds
  }

  /**
   * Process the next job in the queue
   */
  private async processNextJob(): Promise<void> {
    const job = await this.jobQueue.getNextJob();

    if (!job) return;

    const { userId, triggerEvent, campaignId, context = {} } = job.data as EmailJobData;

    try {
      if (campaignId) {
        // Send a specific campaign email
        const campaign = await this.getCampaignById(campaignId);
        if (!campaign) {
          throw new Error(`Campaign ${campaignId} not found`);
        }
        await emailCampaignService.sendCampaignEmail(userId, campaign);
      } else if (triggerEvent) {
        // Send all active campaigns for this trigger event
        const campaigns = await emailCampaignService.getActiveCampaigns(triggerEvent);
        for (const campaign of campaigns) {
          await emailCampaignService.sendCampaignEmail(userId, campaign);
        }
      }

      await this.jobQueue.completeJob(job.id);

      logger.info('Email campaign job processed successfully', {
        jobId: job.id,
        userId,
        triggerEvent,
        campaignId,
        context
      });
    } catch (error) {
      logger.error('Failed to process email campaign job', {
        jobId: job.id,
        userId,
        triggerEvent,
        campaignId,
        context,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      // For now, complete the job anyway to avoid infinite retries
      await this.jobQueue.completeJob(job.id);
    }
  }

  /**
   * Schedule emails for subscription events
   */
  async handleSubscriptionEvent(event: SubscriptionEvent): Promise<void> {
    const { userId, eventType, metadata = {} } = event;

    try {
      // Always record the event
      await this.recordSubscriptionEvent(userId, eventType, metadata);

      // Schedule appropriate email campaigns
      switch (eventType) {
        case 'trial_start':
          await this.scheduleTrialEmails(userId);
          break;
        case 'trial_end':
          await this.schedulePostTrialEmails(userId);
          break;
        case 'subscription_cancelled':
          await this.scheduleRetentionEmails(userId);
          break;
        case 'subscription_renewed':
          await this.scheduleRenewalEmails(userId);
          break;
      }

      logger.info('Subscription event processed for email campaigns', {
        userId,
        eventType,
        metadata
      });
    } catch (error) {
      logger.error('Failed to handle subscription event', {
        userId,
        eventType,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Schedule trial nurture emails
   */
  private async scheduleTrialEmails(userId: number): Promise<void> {
    const campaigns = await emailCampaignService.getActiveCampaigns('trial_start');

    for (const campaign of campaigns) {
      const delayMs = (campaign.delayDays * 24 * 60 * 60 * 1000) + (campaign.delayHours * 60 * 60 * 1000);
      const jobKey = `trial-${userId}-${campaign.campaignName}`;

      // Clear any existing job for this user/campaign
      if (this.scheduledJobs.has(jobKey)) {
        clearTimeout(this.scheduledJobs.get(jobKey)!);
      }

      // Schedule the job
      const timeout = setTimeout(async () => {
        try {
          await this.jobQueue.add(`trial-${campaign.campaignName}`, {
            userId,
            triggerEvent: 'trial_start',
            campaignId: campaign.id,
            context: { campaignName: campaign.campaignName }
          });
          this.scheduledJobs.delete(jobKey);
        } catch (error) {
          logger.error('Failed to schedule trial email', {
            userId,
            campaignId: campaign.id,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }, delayMs);

      this.scheduledJobs.set(jobKey, timeout);

      logger.info('Trial email scheduled', {
        userId,
        campaignId: campaign.id,
        campaignName: campaign.campaignName,
        delayMs
      });
    }
  }

  /**
   * Schedule post-trial retention emails
   */
  private async schedulePostTrialEmails(userId: number): Promise<void> {
    const campaigns = await emailCampaignService.getActiveCampaigns('trial_expired');

    for (const campaign of campaigns) {
      const delayMs = (campaign.delayDays * 24 * 60 * 60 * 1000) + (campaign.delayHours * 60 * 60 * 1000);
      const jobKey = `retention-${userId}-${campaign.campaignName}`;

      if (this.scheduledJobs.has(jobKey)) {
        clearTimeout(this.scheduledJobs.get(jobKey)!);
      }

      const timeout = setTimeout(async () => {
        try {
          await this.jobQueue.add(`retention-${campaign.campaignName}`, {
            userId,
            triggerEvent: 'trial_expired',
            campaignId: campaign.id,
            context: { reason: 'trial_expired' }
          });
          this.scheduledJobs.delete(jobKey);
        } catch (error) {
          logger.error('Failed to schedule retention email', {
            userId,
            campaignId: campaign.id,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }, delayMs);

      this.scheduledJobs.set(jobKey, timeout);

      logger.info('Post-trial email scheduled', {
        userId,
        campaignId: campaign.id,
        campaignName: campaign.campaignName,
        delayMs
      });
    }
  }

  /**
   * Schedule retention emails for cancelled subscriptions
   */
  private async scheduleRetentionEmails(userId: number): Promise<void> {
    const jobKey = `retention-${userId}-win-back`;

    if (this.scheduledJobs.has(jobKey)) {
      clearTimeout(this.scheduledJobs.get(jobKey)!);
    }

    // Schedule a win-back email after 7 days
    const timeout = setTimeout(async () => {
      try {
        await this.jobQueue.add('win-back-email', {
          userId,
          triggerEvent: 'subscription_cancelled',
          context: { reason: 'subscription_cancelled' }
        });
        this.scheduledJobs.delete(jobKey);
      } catch (error) {
        logger.error('Failed to schedule win-back email', {
          userId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }, 7 * 24 * 60 * 60 * 1000); // 7 days

    this.scheduledJobs.set(jobKey, timeout);

    logger.info('Retention email scheduled', { userId });
  }

  /**
   * Schedule renewal confirmation emails
   */
  private async scheduleRenewalEmails(userId: number): Promise<void> {
    const jobKey = `renewal-${userId}-thank-you`;

    if (this.scheduledJobs.has(jobKey)) {
      clearTimeout(this.scheduledJobs.get(jobKey)!);
    }

    const timeout = setTimeout(async () => {
      try {
        await this.jobQueue.add('renewal-thank-you', {
          userId,
          triggerEvent: 'subscription_renewed',
          context: { reason: 'subscription_renewed' }
        });
        this.scheduledJobs.delete(jobKey);
      } catch (error) {
        logger.error('Failed to schedule renewal email', {
          userId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }, 1000); // Send immediately (1 second delay)

    this.scheduledJobs.set(jobKey, timeout);

    logger.info('Renewal email scheduled', { userId });
  }

  /**
   * Record feature usage and potentially trigger upgrade emails
   */
  async recordFeatureUsage(userId: number, featureName: string): Promise<void> {
    try {
      await emailCampaignService.recordFeatureUsage(userId, featureName);

      logger.info('Feature usage recorded for email campaigns', {
        userId,
        featureName
      });
    } catch (error) {
      logger.error('Failed to record feature usage', {
        userId,
        featureName,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Queue a campaign email for sending (used by conversion triggers)
   */
  async queueCampaignEmail(userId: number, templateName: string, context: any = {}): Promise<void> {
    try {
      await this.jobQueue.add(`conversion-${templateName}`, {
        userId,
        triggerEvent: 'conversion_trigger',
        context: {
          template: templateName,
          ...context
        }
      });

      logger.info('Campaign email queued for conversion trigger', {
        userId,
        templateName,
        context
      });
    } catch (error) {
      logger.error('Failed to queue campaign email', {
        userId,
        templateName,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get campaign by ID (for scheduled emails)
   */
  private async getCampaignById(campaignId: number): Promise<any> {
    try {
      const result = await pool.query(
        'SELECT * FROM email_campaigns WHERE id = $1 AND is_active = true',
        [campaignId]
      );

      return result.rows[0] || null;
    } catch (error) {
      logger.error('Failed to get campaign by ID', { campaignId, error: error instanceof Error ? error.message : 'Unknown error' });
      return null;
    }
  }

  /**
   * Record subscription events in database
   */
  private async recordSubscriptionEvent(userId: number, eventType: string, metadata: Record<string, any>): Promise<void> {
    try {
      await pool.query(
        `INSERT INTO email_sends
         (user_id, campaign_id, sent_at, status, metadata)
         VALUES ($1, NULL, NOW(), $2, $3)`,
        [userId, `event_${eventType}`, JSON.stringify(metadata)]
      );

      logger.debug('Subscription event recorded', { userId, eventType });
    } catch (error) {
      logger.error('Failed to record subscription event', {
        userId,
        eventType,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      // Don't throw here - this is not critical for email sending
    }
  }

  /**
   * Clean up old jobs and optimize queue
   */
  async cleanup(): Promise<void> {
    try {
      // Clean up timed-out Redis keys (simulate BullMQ cleanup)
      const pattern = 'queue:email-campaigns:*';
      const keys = await redis.keys(pattern);

      for (const key of keys) {
        const ttl = await redis.ttl(key);
        if (ttl === -2) { // Key doesn't exist
          continue;
        }
        if (ttl === -1 || ttl > 24 * 60 * 60) { // No TTL or too long, set 24h TTL
          await redis.expire(key, 24 * 60 * 60);
        }
      }

      // Clean up scheduled job timeouts that are no longer needed
      for (const [key, timeout] of this.scheduledJobs) {
        // Check if the user still exists and trial is active
        if (key.includes('trial-') && !await this.isUserOnTrial(parseInt(key.split('-')[1]))) {
          clearTimeout(timeout);
          this.scheduledJobs.delete(key);
        }
      }

      logger.info('Email campaign worker cleanup completed');
    } catch (error) {
      logger.error('Failed to cleanup email campaign worker', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Check if user is still on trial (for cleanup)
   */
  private async isUserOnTrial(userId: number): Promise<boolean> {
    try {
      const result = await pool.query(`
        SELECT s.id FROM subscriptions s
        WHERE s.user_id = $1
        AND s.tier = 'creator_pass'
        AND s.status = 'trialing'
        AND s.current_period_end > NOW()
      `, [userId]);

      return result.rows.length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get worker stats
   */
  async getStats(): Promise<any> {
    try {
      const queueKeys = await redis.keys('queue:email-campaigns:*');
      const jobKeys = await redis.keys('queue:email-campaigns:jobs');

      return {
        scheduledJobs: this.scheduledJobs.size,
        queueKeys: queueKeys.length,
        waitingJobs: jobKeys.length,
        campaignStats: await emailCampaignService.getCampaignStats(30)
      };
    } catch (error) {
      logger.error('Failed to get email campaign worker stats', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  }

  /**
   * Graceful shutdown
   */
  async close(): Promise<void> {
    // Clear all scheduled timeouts
    for (const timeout of this.scheduledJobs.values()) {
      clearTimeout(timeout);
    }
    this.scheduledJobs.clear();

    logger.info('Email campaign worker closed');
  }
}

export const emailCampaignWorker = new EmailCampaignWorker();

// Clean up old jobs every 6 hours
setInterval(() => {
  emailCampaignWorker.cleanup();
}, 6 * 60 * 60 * 1000);
