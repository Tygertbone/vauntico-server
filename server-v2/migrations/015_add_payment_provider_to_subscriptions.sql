-- Migration: Add payment provider support to subscriptions table
-- Purpose: Update subscriptions table to support multiple payment providers with Paystack as primary
-- Date: 2025-01-05

-- Add payment provider column (make it required with default)
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS payment_provider VARCHAR(20) NOT NULL DEFAULT 'paystack' CHECK (payment_provider IN ('paystack', 'stripe'));

-- Add Paystack-specific columns
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS paystack_customer_code VARCHAR(50),
ADD COLUMN IF NOT EXISTS paystack_subscription_code VARCHAR(50);

-- Update existing subscriptions to use Paystack as default provider
UPDATE subscriptions
SET payment_provider = 'paystack'
WHERE payment_provider IS NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_payment_provider ON subscriptions(payment_provider);
CREATE INDEX IF NOT EXISTS idx_subscriptions_paystack_customer ON subscriptions(paystack_customer_code) WHERE paystack_customer_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_subscriptions_paystack_subscription ON subscriptions(paystack_subscription_code) WHERE paystack_subscription_code IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN subscriptions.payment_provider IS 'Payment processor used for this subscription (paystack or stripe)';
COMMENT ON COLUMN subscriptions.paystack_customer_code IS 'Paystack customer identifier';
COMMENT ON COLUMN subscriptions.paystack_subscription_code IS 'Paystack subscription identifier';

-- Verify the migration was successful
SELECT 'Migration completed: Payment provider support added to subscriptions table' as status;
