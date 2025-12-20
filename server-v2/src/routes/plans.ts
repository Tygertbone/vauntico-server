import { Router, Request, Response } from 'express';
import { logger } from '../utils/logger';

// Define currency exchange rates (these would typically come from an external API)
const EXCHANGE_RATES = {
  // Base: USD
  usd: 1.0,
  zar: 18.5,  // South African Rand
  ngn: 1650.0, // Nigerian Naira
  eur: 0.92,  // Euro
} as const;

// Plan configurations with base USD pricing
const PLAN_CONFIGS = {
  creator: {
    name: 'Creator Pass',
    description: 'Premium tier for creators',
    pricing: {
      usd: 29,
      // These will be calculated dynamically
    },
    features: [
      'Unlimited AI generations',
      'Advanced analytics dashboard',
      'Custom branding',
      'Priority email support',
      'Unlimited vaults',
      'Team collaboration tools',
      'API access',
      'White-label options'
    ]
  },
  enterprise: {
    name: 'Enterprise',
    description: 'Enterprise tier with full features',
    pricing: {
      usd: 99, // Note: Documentation says $100, but using 99 for consistency
    },
    features: [
      'Everything in Creator Pass',
      'Dedicated account manager',
      'Custom integrations',
      'Advanced security features',
      'Compliance reporting',
      'Priority phone support',
      'Custom SLA',
      'On-premise deployment option'
    ]
  }
} as const;

const router = Router();

// GET /api/plans - Returns pricing in multiple currencies
router.get('/', async (req: Request, res: Response) => {
  try {
    const plans: any = {};

    // Calculate pricing for each plan in all currencies
    for (const [planKey, planConfig] of Object.entries(PLAN_CONFIGS)) {
      plans[planKey] = {
        name: planConfig.name,
        description: planConfig.description,
        features: planConfig.features,
        pricing: {}
      };

      // Convert base USD price to all supported currencies
      for (const [currency, rate] of Object.entries(EXCHANGE_RATES)) {
        const usdPrice = planConfig.pricing.usd;
        plans[planKey].pricing[currency] = currency === 'usd'
          ? usdPrice // USD is the base
          : Math.round(usdPrice * rate); // Round for clean display
      }
    }

    logger.info('Plans data served', {
      planCount: Object.keys(plans).length,
      currencies: Object.keys(EXCHANGE_RATES)
    });

    res.json(plans);
  } catch (error) {
    logger.error('Failed to serve plans data', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    res.status(500).json({ error: 'Failed to retrieve plans data' });
  }
});

// GET /api/plans/currencies - Returns available currencies and exchange rates
router.get('/currencies', async (req: Request, res: Response) => {
  try {
    res.json({
      currencies: Object.keys(EXCHANGE_RATES),
      exchangeRates: EXCHANGE_RATES,
      lastUpdated: new Date().toISOString() // In production, this would be from a real API
    });
  } catch (error) {
    logger.error('Failed to serve currency data', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    res.status(500).json({ error: 'Failed to retrieve currency data' });
  }
});

// GET /api/plans/:plan - Returns specific plan details
router.get('/:plan', async (req: Request, res: Response) => {
  try {
    const { plan } = req.params;
    const planConfig = PLAN_CONFIGS[plan as keyof typeof PLAN_CONFIGS];

    if (!planConfig) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    // Calculate pricing for the specific plan
    const planData: any = {
      name: planConfig.name,
      description: planConfig.description,
      features: planConfig.features,
      pricing: {}
    };

    for (const [currency, rate] of Object.entries(EXCHANGE_RATES)) {
      const usdPrice = planConfig.pricing.usd;
      planData.pricing[currency] = currency === 'usd'
        ? usdPrice
        : Math.round(usdPrice * rate);
    }

    res.json(planData);
  } catch (error) {
    logger.error('Failed to serve plan data', {
      plan: req.params.plan,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    res.status(500).json({ error: 'Failed to retrieve plan data' });
  }
});

export default router;
