import { useEffect, useState } from 'react';
import axios from 'axios';

export interface PlanPricing {
  usd?: number;
  zar?: number;
  ngn?: number;
  eur?: number;
}

export interface PlanData {
  name: string;
  description: string;
  features: string[];
  pricing: PlanPricing;
}

export interface PlansData {
  creator: PlanData;
  enterprise: PlanData;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
const CURRENCY_ABSTRACTION_ENABLED = process.env.NEXT_PUBLIC_CURRENCY_ABSTRACTION_ENABLED === 'true';

export function usePlans(): PlansData | null {
  const [plans, setPlans] = useState<PlansData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch if currency abstraction is enabled
    if (!CURRENCY_ABSTRACTION_ENABLED) {
      setLoading(false);
      return;
    }

    const fetchPlans = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/plans`);
        setPlans(response.data);
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch plans:', err);
        setError(err.message || 'Failed to fetch plans');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  if (!CURRENCY_ABSTRACTION_ENABLED) {
    // Fallback to static pricing if feature is disabled
    return {
      creator: {
        name: 'Creator Pass',
        description: 'Premium tier for creators',
        features: [
          'Unlimited AI generations',
          'Advanced analytics dashboard',
          'Custom branding',
          'Priority email support',
          'Unlimited vaults',
          'Team collaboration tools',
          'API access',
          'White-label options'
        ],
        pricing: {
          usd: 29,
          zar: 500,
          ngn: 47000,
          eur: 27
        }
      },
      enterprise: {
        name: 'Enterprise',
        description: 'Enterprise tier with full features',
        features: [
          'Everything in Creator Pass',
          'Dedicated account manager',
          'Custom integrations',
          'Advanced security features',
          'Compliance reporting',
          'Priority phone support',
          'Custom SLA',
          'On-premise deployment option'
        ],
        pricing: {
          usd: 99,
          zar: 1700,
          ngn: 160000,
          eur: 92
        }
      }
    };
  }

  return plans;
}

export function usePlansLoading(): boolean {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!CURRENCY_ABSTRACTION_ENABLED) {
      setLoading(false);
      return;
    }

    // Simulate network delay if API is enabled
    const timer = setTimeout(() => setLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);

  return loading;
}
