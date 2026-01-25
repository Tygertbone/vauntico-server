'use client'

import { useState } from 'react'
import { Button } from './ui/Button'

// Extend Window interface for Paystack
declare global {
  interface Window {
    PaystackPop?: any;
  }
}

interface PaystackButtonProps {
  email: string;
  name: string;
  amount: number; // Amount in kobo/cents
  tier: string;
  billingCycle: 'monthly' | 'annual';
  onSuccess: (reference: string) => void;
  onClose: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
}

export function PaystackButton({
  email,
  name,
  amount,
  tier,
  billingCycle,
  onSuccess,
  onClose,
  disabled = false,
  children
}: PaystackButtonProps) {
  const [loading, setLoading] = useState(false);

  const initializePayment = () => {
    if (!window.PaystackPop) {
      alert('Paystack SDK not loaded. Please refresh the page.');
      return;
    }

    setLoading(true);

    const paystack = window.PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_your_key_here',
      email,
      amount, // Amount in kobo (multiply by 100 for NGN)
      currency: 'NGN',
      ref: 'VAU-' + Date.now() + '-' + Math.floor(Math.random() * 100000),
      metadata: {
        tier,
        billingCycle,
        custom_fields: [
          {
            display_name: 'Plan',
            variable_name: 'plan',
            value: tier
          },
          {
            display_name: 'Billing Cycle',
            variable_name: 'billing_cycle',
            value: billingCycle
          }
        ]
      },
      callback: (response: any) => {
        console.log('Payment successful:', response);
        setLoading(false);
        onSuccess(response.reference);
      },
      onClose: () => {
        console.log('Payment modal closed');
        setLoading(false);
        onClose();
      }
    });

    paystack.openIframe();
  };

  return (
    <Button
      variant="primary"
      size="lg"
      onClick={initializePayment}
      disabled={disabled || loading}
      className="w-full"
    >
      {loading ? 'Processing...' : children || 'Complete Payment with Paystack'}
    </Button>
  );
}
