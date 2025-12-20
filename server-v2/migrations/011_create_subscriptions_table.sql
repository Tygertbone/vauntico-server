-- Vauntico Subscriptions Table
-- Foundation for revenue generation with premium feature gating

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stripe_customer_id VARCHAR(255), -- Stripe customer ID
    stripe_subscription_id VARCHAR(255), -- Stripe subscription ID
    tier VARCHAR(20) NOT NULL DEFAULT 'free', -- 'free', 'creator_pass', 'enterprise'
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'past_due', 'canceled', 'incomplete'
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    trial_start TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,
    -- Feature limits for tier verification
    vaults_limit INTEGER DEFAULT 3,
    ai_generations_limit INTEGER DEFAULT 50,
    storage_limit_gb INTEGER DEFAULT 1,
    team_members_limit INTEGER DEFAULT 1,
    UNIQUE(user_id) -- One subscription per user
);

-- Update the users table subscription_tier to sync with subscriptions table
-- This denormalization is for performance and backwards compatibility
CREATE OR REPLACE FUNCTION sync_user_subscription_tier()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the denormalized field in users table
    UPDATE users
    SET subscription_tier = NEW.tier,
        updated_at = NOW()
    WHERE id = NEW.user_id;

    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER sync_user_tier_on_subscription_change
    AFTER INSERT OR UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION sync_user_subscription_tier();

-- Premium feature usage tracking
CREATE TABLE feature_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    feature_key VARCHAR(100) NOT NULL, -- 'vaults_created', 'ai_generations_used', 'storage_used_gb'
    usage_count INTEGER DEFAULT 0,
    usage_limit INTEGER, -- NULL for unlimited premium features
    reset_period VARCHAR(20), -- 'monthly', 'daily', 'lifetime'
    last_reset TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, feature_key)
);

-- Indexes for performance
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_tier ON subscriptions(tier);
CREATE INDEX idx_subscriptions_current_period_end ON subscriptions(current_period_end);
CREATE INDEX idx_feature_usage_user_feature ON feature_usage(user_id, feature_key);

-- Function to check if user has premium access
CREATE OR REPLACE FUNCTION user_has_premium_access(user_uuid UUID, feature_key TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
    user_tier TEXT;
    is_premium BOOLEAN := FALSE;
BEGIN
    -- Get user's current tier
    SELECT COALESCE(subscription_tier, 'free') INTO user_tier
    FROM users WHERE id = user_uuid;

    -- Check if tier is premium
    IF user_tier IN ('creator_pass', 'enterprise') THEN
        is_premium := TRUE;
    END IF;

    -- If specific feature check requested and user is free tier
    IF feature_key IS NOT NULL AND NOT is_premium THEN
        -- Check feature usage limits for free tier restrictions
        CASE feature_key
            WHEN 'vaults_created' THEN
                -- Free tier limited to 3 vaults
                SELECT COUNT(*) <= 3 INTO is_premium
                FROM content_items
                WHERE user_id = user_uuid AND content_type = 'vault';
            WHEN 'ai_generations_used' THEN
                -- Free tier limited to 50 AI generations per month
                SELECT COALESCE(SUM(usage_count), 0) <= 50 INTO is_premium
                FROM feature_usage
                WHERE user_id = user_uuid
                  AND feature_key = 'ai_generations_used'
                  AND last_reset >= DATE_TRUNC('month', CURRENT_DATE);
            ELSE
                is_premium := TRUE; -- Allow other features for free tier
        END CASE;
    END IF;

    RETURN is_premium;
END;
$$ language 'plpgsql';

-- Function to increment feature usage
CREATE OR REPLACE FUNCTION increment_feature_usage(user_uuid UUID, feature_key TEXT, increment INTEGER DEFAULT 1)
RETURNS VOID AS $$
BEGIN
    INSERT INTO feature_usage (user_id, feature_key, usage_count)
    VALUES (user_uuid, feature_key, increment)
    ON CONFLICT (user_id, feature_key)
    DO UPDATE SET
        usage_count = feature_usage.usage_count + increment,
        updated_at = NOW();
END;
$$ language 'plpgsql';

-- Insert default subscription records for existing users
INSERT INTO subscriptions (user_id, tier)
SELECT id, COALESCE(subscription_tier, 'free')
FROM users
WHERE id NOT IN (SELECT user_id FROM subscriptions);

-- Update trigger for feature usage timestamps
CREATE TRIGGER update_feature_usage_updated_at BEFORE UPDATE ON feature_usage FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
