import React from 'react';
import PricingCard from '../components/PricingCard';
import { usePlans } from '../hooks/usePlans';

const PlansPage = () => {
  const plans = usePlans();

  if (!plans) {
    // Show loading state
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
            <p className="text-xl text-gray-600">Loading pricing information...</p>
          </div>
          <div className="flex justify-center">
            <div className="animate-pulse flex space-x-4">
              <div className="rounded-lg bg-gray-200 p-6 w-80 h-96"></div>
              <div className="rounded-lg bg-gray-200 p-6 w-80 h-96"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-600 mb-4">
            Unlock the full potential of Vauntico with flexible pricing
          </p>
          <p className="text-sm text-gray-500">
            All prices shown in your local currency. Pricing is calculated in real-time.
          </p>
        </div>

        <div className="flex flex-col md:flex-row justify-center items-start gap-8 mb-12">
          <PricingCard
            name={plans.creator?.name || 'Creator Pass'}
            description={plans.creator?.description || 'Perfect for creators and small teams'}
            pricing={plans.creator?.pricing}
            features={plans.creator?.features}
          />

          <PricingCard
            name={plans.enterprise?.name || 'Enterprise'}
            description={plans.enterprise?.description || 'Full featured solution for growing businesses'}
            pricing={plans.enterprise?.pricing}
            features={plans.enterprise?.features}
          />
        </div>

        <div className="text-center">
          <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Currency Conversion Notice
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Prices are displayed in USD, ZAR, NGN, and EUR based on current exchange rates.
              Billing will be processed in your selected currency with Paystack integration.
            </p>
            <div className="text-xs text-gray-500">
              <p>All prices include 14-day free trial. No setup fees. Cancel anytime.</p>
              <p>Exchange rates are updated regularly to ensure fair pricing.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlansPage;
