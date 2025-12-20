import axios from 'axios';
import { logger } from '../utils/logger';
import { PaymentProvider } from '../utils/subscriptions';
import { ProofVault } from './ProofVault';
import { SlackService } from './SlackService';
import crypto from 'crypto';

export interface PaystackCustomer {
  customer_code: string;
  email: string;
  id: number;
}

export interface PaystackSubscription {
  subscription_code: string;
  email_token: string;
  id: number;
  status: string;
}

export interface PaystackPlan {
  id: number;
  name: string;
  amount: number;
  interval: string;
  plan_code?: string;
}

export class PaystackService {
  private static instance: PaystackService;
  private baseUrl = 'https://api.paystack.co';
  private secretKey: string;

  private constructor() {
    this.secretKey = process.env.PAYSTACK_SECRET_KEY || '';
    if (!this.secretKey) {
      logger.warn('Paystack secret key not configured - Paystack services disabled');
    }
  }

  static getInstance(): PaystackService {
    if (!PaystackService.instance) {
      PaystackService.instance = new PaystackService();
    }
    return PaystackService.instance;
  }

  /**
   * Create or retrieve a Paystack customer
   */
  async createOrGetCustomer(email: string, metadata?: any): Promise<PaystackCustomer> {
    try {
      // First try to get existing customer
      const existingCustomer = await this.getCustomerByEmail(email);
      if (existingCustomer) {
        return existingCustomer;
      }

      // Create new customer
      const response = await axios.post(
        `${this.baseUrl}/customer`,
        {
          email,
          metadata: metadata || {}
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      logger.info('Paystack customer created', {
        email,
        customerCode: response.data.data.customer_code
      });

      return response.data.data;
    } catch (error: any) {
      logger.error('Failed to create Paystack customer', {
        email,
        error: error.response?.data || error.message
      });
      throw new Error('Failed to create customer');
    }
  }

  /**
   * Get customer by email
   */
  async getCustomerByEmail(email: string): Promise<PaystackCustomer | null> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/customer`,
        {
          params: { email },
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
          },
        }
      );

      const customers = response.data.data;
      if (customers.length > 0) {
        return customers[0];
      }

      return null;
    } catch (error: any) {
      logger.error('Failed to get Paystack customer', {
        email,
        error: error.response?.data || error.message
      });
      return null;
    }
  }

  /**
   * Create a subscription plan
   */
  async createPlan(name: string, amountCents: number, interval: string = 'monthly'): Promise<PaystackPlan> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/plan`,
        {
          name,
          amount: amountCents, // Amount in cents/kobo
          interval,
          currency: 'NGN', // Default to NGN, can be changed based on region
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      logger.info('Paystack plan created', {
        name,
        amount: amountCents,
        planCode: response.data.data.plan_code
      });

      return response.data.data;
    } catch (error: any) {
      logger.error('Failed to create Paystack plan', {
        name,
        amount: amountCents,
        error: error.response?.data || error.message
      });
      throw new Error('Failed to create subscription plan');
    }
  }

  /**
   * Initialize subscription transaction
   */
  async initializeSubscription(
    customerCode: string,
    planCode: string,
    amount?: number,
    trialDays?: number
  ): Promise<{ authorization_url: string; reference: string }> {
    try {
      const payload: any = {
        customer: customerCode,
        plan: planCode,
      };

      if (amount) {
        payload.amount = amount;
      }

      if (trialDays && trialDays > 0) {
        payload.trial_period = trialDays;
      }

      const response = await axios.post(
        `${this.baseUrl}/transaction/initialize`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      logger.info('Paystack subscription initialized', {
        customerCode,
        planCode,
        reference: response.data.data.reference
      });

      return response.data.data;
    } catch (error: any) {
      logger.error('Failed to initialize Paystack subscription', {
        customerCode,
        planCode,
        error: error.response?.data || error.message
      });
      throw new Error('Failed to initialize subscription');
    }
  }

  /**
   * Verify payment transaction
   */
  async verifyPayment(reference: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
          },
        }
      );

      logger.info('Paystack payment verified', {
        reference,
        status: response.data.data.status,
        amount: response.data.data.amount
      });

      return response.data.data;
    } catch (error: any) {
      logger.error('Failed to verify Paystack payment', {
        reference,
        error: error.response?.data || error.message
      });
      throw new Error('Failed to verify payment');
    }
  }

  /**
   * Create subscription directly (alternative to transaction flow)
   */
  async createSubscription(customerCode: string, planCode: string, authorizationCode?: string): Promise<PaystackSubscription> {
    try {
      const payload: any = {
        customer: customerCode,
        plan: planCode,
      };

      if (authorizationCode) {
        payload.authorization = authorizationCode;
      }

      const response = await axios.post(
        `${this.baseUrl}/subscription`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      logger.info('Paystack subscription created', {
        customerCode,
        planCode,
        subscriptionCode: response.data.data.subscription_code
      });

      return response.data.data;
    } catch (error: any) {
      logger.error('Failed to create Paystack subscription', {
        customerCode,
        planCode,
        error: error.response?.data || error.message
      });
      throw new Error('Failed to create subscription');
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionCode: string): Promise<boolean> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/subscription/${subscriptionCode}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      logger.info('Paystack subscription cancelled', { subscriptionCode });

      return response.data.status;
    } catch (error: any) {
      logger.error('Failed to cancel Paystack subscription', {
        subscriptionCode,
        error: error.response?.data || error.message
      });
      throw new Error('Failed to cancel subscription');
    }
  }

  /**
   * Webhook verification
   */
  verifyWebhook(body: string, signature: string): boolean {
    try {
      const hash = crypto
        .createHmac('sha512', this.secretKey)
        .update(body)
        .digest('hex');

      return hash === signature;
    } catch (error) {
      logger.error('Webhook verification failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  /**
   * Handle webhook events
   */
  async handleWebhook(event: any): Promise<void> {
    try {
      const { event: eventType, data } = event;

      logger.info('Paystack webhook received', {
        eventType,
        reference: data.reference,
        subscriptionCode: data.subscription_code
      });

      switch (eventType) {
        case 'subscription.create':
          // Handle subscription creation
          await this.handleSubscriptionCreate(data);
          break;

        case 'subscription.disable':
          // Handle subscription cancellation
          await this.handleSubscriptionCancel(data);
          break;

        case 'charge.success':
          // Handle successful charge
          await this.handleChargeSuccess(data);
          break;

        case 'charge.fail':
          // Handle failed charge
          await this.handleChargeFail(data);
          break;

        default:
          logger.info('Unhandled Paystack webhook event', { eventType });
      }
    } catch (error) {
      logger.error('Failed to handle Paystack webhook', {
        event: event.event,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private async handleSubscriptionCreate(data: any): Promise<void> {
    // Implementation for handling subscription creation with Proof Vault and Slack alerts
    try {
      const { customer_code, plan, amount, subscription_code } = data;

      // Extract user information from customer metadata or lookup by customer_code
      // For now, using customer_code as a proxy for userId - in production you'd need proper mapping
      const userId = customer_code; // This needs to be replaced with actual userId lookup

      // Determine currency (Paystack defaults to NGN, but could be others)
      const currency = 'NGN'; // Default to NGN for now

      // Store proof in Proof Vault
      await ProofVault.storeProof(userId, subscription_code, currency, amount);

      // Send Slack alert
      await SlackService.sendAlert(`New subscription: ${userId} → ${subscription_code} (${amount} ${currency})`);

      logger.info('Subscription proof stored and alert sent', {
        userId,
        subscriptionCode: subscription_code,
        amount,
        currency
      });
    } catch (error) {
      logger.error('Error handling subscription create', {
        error: error instanceof Error ? error.message : 'Unknown error',
        data
      });

      // Send error alert to Slack
      try {
        await SlackService.sendAlert(`Payment failure: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } catch (alertError) {
        logger.error('Failed to send error alert to Slack', {
          error: alertError instanceof Error ? alertError.message : 'Unknown error'
        });
      }
    }
  }

  private async handleSubscriptionCancel(data: any): Promise<void> {
    // Implementation for handling subscription cancellation
    logger.info('Handling subscription cancel', data);
  }

  private async handleChargeSuccess(data: any): Promise<void> {
    // Implementation for handling successful charges
    logger.info('Handling charge success', data);
  }

  private async handleChargeFail(data: any): Promise<void> {
    // Implementation for handling failed charges
    logger.info('Handling charge failure', data);
  }
}

export const paystackService = PaystackService.getInstance();
