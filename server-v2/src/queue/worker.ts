import { Redis } from '@upstash/redis';
import { logger } from '../utils/logger';

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Worker job processor - simple polling for job queues
export class JobWorker {
  private isRunning = false;
  private pollInterval = 5000; // Poll every 5 seconds

  constructor(private queueName: string = 'trust-score-jobs') {}

  // Start the worker
  async start(): Promise<void> {
    if (this.isRunning) return;

    this.isRunning = true;
    logger.info('Starting job worker', { queueName: this.queueName });

    const pollJobs = async () => {
      if (!this.isRunning) return;

      try {
        // Poll for jobs using RPOP (right pop)
        const job = await redis.rpop(this.queueName);

        if (job) {
          try {
            await this.processJob(JSON.parse(job));
            logger.info('Job processed successfully', { queueName: this.queueName });
          } catch (error) {
            logger.error('Job processing failed', {
              error: error instanceof Error ? error.message : 'Unknown error',
              queueName: this.queueName,
              jobData: job,
            });

            // Optionally retry failed jobs (not implemented yet)
            // await redis.lpush(`${this.queueName}:failed`, job);
          }
        }
      } catch (error) {
        logger.error('Job polling failed', {
          error: error instanceof Error ? error.message : 'Unknown error',
          queueName: this.queueName,
        });
      }

      // Continue polling
      setTimeout(pollJobs, this.pollInterval);
    };

    // Start polling
    pollJobs();
  }

  // Stop the worker
  async stop(): Promise<void> {
    this.isRunning = false;
    logger.info('Stopped job worker', { queueName: this.queueName });
  }

  // Process a job
  private async processJob(job: any): Promise<void> {
    // Basic job structure validation
    if (!job.type || !job.payload) {
      throw new Error('Invalid job structure');
    }

    switch (job.type) {
      case 'calculate-trust-score':
        await this.calculateTrustScore(job.payload);
        break;

      case 'sync-social-data':
        await this.syncSocialData(job.payload);
        break;

      default:
        logger.warn('Unknown job type', { jobType: job.type });
    }
  }

  // Job handlers (stubs for Phase 2)
  private async calculateTrustScore(payload: any): Promise<void> {
    logger.info('Processing trust score calculation', {
      userId: payload.userId,
      dataPeriod: payload.dataPeriod,
    });

    // TODO: Implement actual trust score calculation in Phase 2
    // - Fetch data from Neon PostgreSQL
    // - Calculate UEI scores using 5 component algorithm
    // - Apply scoring algorithm: 20% Consistency + 30% Engagement + 15% Revenue + 20% Platform Health + 15% Legacy
    // - Store results in trust_scores table

    logger.info('Trust score calculation completed (stub - Phase 2)', {
      userId: payload.userId,
    });
  }

  private async syncSocialData(payload: any): Promise<void> {
    logger.info('Processing social data sync', {
      userId: payload.userId,
      platforms: payload.platforms,
    });

    // TODO: Implement data fetching from platforms in Phase 3
    // - Connect to Google Analytics, YouTube, Stripe OAuth APIs
    // - Fetch metrics data and store in content_metrics table
    // - Trigger trust score calculation after sync

    logger.info('Social data sync completed (stub - Phase 3)', {
      userId: payload.userId,
    });
  }

  // Job queue health check
  async getHealthStatus(): Promise<{
    isHealthy: boolean;
    queueLength: number;
    isRunning: boolean;
    lastPollTime?: number;
  }> {
    try {
      const queueLength = await redis.llen(this.queueName);

      return {
        isHealthy: true,
        queueLength,
        isRunning: this.isRunning,
      };
    } catch (error) {
      return {
        isHealthy: false,
        queueLength: 0,
        isRunning: this.isRunning,
      };
    }
  }
}

// Workers registry - manage multiple workers if needed
const workers: Map<string, JobWorker> = new Map();

// Start default worker
export const startWorkers = async (): Promise<void> => {
  const defaultWorker = new JobWorker('trust-score-jobs');
  await defaultWorker.start();
  workers.set('default', defaultWorker);

  logger.info('All job workers started');
};

// Stop all workers
export const stopWorkers = async (): Promise<void> => {
  for (const [name, worker] of workers.entries()) {
    await worker.stop();
    logger.info('Worker stopped', { workerName: name });
  }

  workers.clear();
};

// Get worker status for health checks
export const getWorkersStatus = async (): Promise<any[]> => {
  const statuses = [];

  for (const [name, worker] of workers.entries()) {
    const status = await worker.getHealthStatus();
    statuses.push({
      name,
      ...status,
    });
  }

  return statuses;
};
