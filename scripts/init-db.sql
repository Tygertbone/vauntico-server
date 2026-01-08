-- =============================================================================
-- VAUNTICO DATABASE INITIALIZATION SCRIPT
-- =============================================================================
-- Phase 1: Foundation - Test Data Seeding
-- Created: 2026-01-07
-- Purpose: Initialize PostgreSQL database with test data for development

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- CORE TABLES
-- =============================================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    subscription_status VARCHAR(50) DEFAULT 'none',
    subscription_tier VARCHAR(50) DEFAULT 'free',
    trial_ends_at TIMESTAMP WITH TIME ZONE
);

-- Subscriptions table (Stripe & Paystack)
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subscription_id VARCHAR(255) NOT NULL,
    provider VARCHAR(50) NOT NULL, -- 'stripe' or 'paystack'
    plan_type VARCHAR(50) NOT NULL, -- 'creator_pass' or 'enterprise'
    status VARCHAR(50) NOT NULL, -- 'active', 'cancelled', 'past_due'
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    amount_cents INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trust Scores table
CREATE TABLE IF NOT EXISTS trust_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    score_type VARCHAR(50) NOT NULL, -- 'overall', 'content', 'engagement'
    calculation_factors JSONB,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Score Insurance purchases
CREATE TABLE IF NOT EXISTS score_insurance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    insurance_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'active', 'expired', 'cancelled'
    coverage_amount INTEGER NOT NULL,
    premium_amount INTEGER NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trust Calculator usage
CREATE TABLE IF NOT EXISTS trust_calculator_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    calculation_type VARCHAR(50) NOT NULL, -- 'score', 'insurance', 'engagement'
    input_data JSONB,
    result_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- =============================================================================
-- PHASE 1 KPI TRACKING TABLES
-- =============================================================================

-- Monthly Revenue Tracking
CREATE TABLE IF NOT EXISTS monthly_revenue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    subscription_revenue_cents INTEGER DEFAULT 0,
    insurance_revenue_cents INTEGER DEFAULT 0,
    total_revenue_cents INTEGER DEFAULT 0,
    active_subscriptions INTEGER DEFAULT 0,
    new_subscriptions INTEGER DEFAULT 0,
    churned_subscriptions INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(year, month)
);

-- Feature Usage Tracking
CREATE TABLE IF NOT EXISTS feature_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    feature_name VARCHAR(100) NOT NULL,
    usage_count INTEGER DEFAULT 0,
    unique_users INTEGER DEFAULT 0,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(feature_name, date)
);

-- =============================================================================
-- TEST DATA SEEDING
-- =============================================================================

-- Insert test users
INSERT INTO users (email, password_hash, first_name, last_name, subscription_status, subscription_tier) VALUES
('test.creator@vauntico.com', '$2b$12$hashedpassword1', 'Test', 'Creator', 'active', 'creator_pass'),
('test.enterprise@vauntico.com', '$2b$12$hashedpassword2', 'Test', 'Enterprise', 'active', 'enterprise'),
('test.trial@vauntico.com', '$2b$12$hashedpassword3', 'Test', 'Trial', 'trial', 'free'),
('test.premium@vauntico.com', '$2b$12$hashedpassword4', 'Test', 'Premium', 'active', 'premium')
ON CONFLICT (email) DO NOTHING;

-- Get test user IDs for foreign key references
DO $$
DECLARE
    creator_user UUID;
    enterprise_user UUID;
    trial_user UUID;
    premium_user UUID;
BEGIN
    SELECT id INTO creator_user FROM users WHERE email = 'test.creator@vauntico.com';
    SELECT id INTO enterprise_user FROM users WHERE email = 'test.enterprise@vauntico.com';
    SELECT id INTO trial_user FROM users WHERE email = 'test.trial@vauntico.com';
    SELECT id INTO premium_user FROM users WHERE email = 'test.premium@vauntico.com';

    -- Insert test subscriptions
    INSERT INTO subscriptions (user_id, subscription_id, provider, plan_type, status, current_period_start, current_period_end, amount_cents)
    VALUES
        (creator_user, 'sub_test_creator_001', 'stripe', 'creator_pass', 'active', NOW() - INTERVAL '15 days', NOW() + INTERVAL '15 days', 9900),
        (enterprise_user, 'sub_test_enterprise_001', 'stripe', 'enterprise', 'active', NOW() - INTERVAL '10 days', NOW() + INTERVAL '20 days', 29900),
        (premium_user, 'sub_test_premium_001', 'paystack', 'creator_pass', 'active', NOW() - INTERVAL '5 days', NOW() + INTERVAL '25 days', 9900)
    ON CONFLICT DO NOTHING;

    -- Insert test trust scores
    INSERT INTO trust_scores (user_id, score, score_type, calculation_factors, expires_at)
    VALUES
        (creator_user, 85, 'overall', '{"content_quality": 90, "engagement": 80, "consistency": 85}', NOW() + INTERVAL '30 days'),
        (enterprise_user, 92, 'overall', '{"content_quality": 95, "engagement": 88, "consistency": 92}', NOW() + INTERVAL '30 days'),
        (trial_user, 75, 'overall', '{"content_quality": 70, "engagement": 75, "consistency": 80}', NOW() + INTERVAL '30 days')
    ON CONFLICT DO NOTHING;

    -- Insert test score insurance
    INSERT INTO score_insurance (user_id, insurance_id, status, coverage_amount, premium_amount, end_date)
    VALUES
        (creator_user, 'ins_test_001', 'active', 10000, 2900, NOW() + INTERVAL '30 days'),
        (enterprise_user, 'ins_test_002', 'active', 25000, 4900, NOW() + INTERVAL '60 days')
    ON CONFLICT DO NOTHING;

    -- Insert test trust calculator usage
    INSERT INTO trust_calculator_usage (user_id, calculation_type, input_data, result_data, ip_address)
    VALUES
        (creator_user, 'score', '{"followers": 1000, "posts": 50, "engagement_rate": 0.05}', '{"score": 85, "confidence": 0.92}', '127.0.0.1'),
        (enterprise_user, 'insurance', '{"current_score": 92, "desired_coverage": 25000}', '{"monthly_premium": 49, "coverage_amount": 25000}', '127.0.0.1'),
        (trial_user, 'engagement', '{"avg_likes": 50, "avg_comments": 10, "followers": 500}', '{"engagement_score": 75, "recommendations": ["Post more frequently"]}', '127.0.0.1')
    ON CONFLICT DO NOTHING;
END $$;

-- Insert Phase 1 KPI tracking data
INSERT INTO monthly_revenue (year, month, subscription_revenue_cents, insurance_revenue_cents, total_revenue_cents, active_subscriptions, new_subscriptions, churned_subscriptions)
VALUES
    (2026, 1, 39700, 7800, 47500, 3, 3, 0)
ON CONFLICT (year, month) DO NOTHING;

-- Insert feature usage tracking
INSERT INTO feature_usage (feature_name, usage_count, unique_users, date)
VALUES
    ('trust_calculator', 156, 45, CURRENT_DATE - INTERVAL '1 day'),
    ('score_insurance_purchase', 23, 12, CURRENT_DATE - INTERVAL '1 day'),
    ('subscription_upgrade', 8, 8, CURRENT_DATE - INTERVAL '1 day'),
    ('dashboard_view', 445, 67, CURRENT_DATE - INTERVAL '1 day')
ON CONFLICT (feature_name, date) DO NOTHING;

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_trust_scores_user_id ON trust_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_trust_scores_score ON trust_scores(score);
CREATE INDEX IF NOT EXISTS idx_score_insurance_user_id ON score_insurance(user_id);
CREATE INDEX IF NOT EXISTS idx_trust_calculator_usage_user_id ON trust_calculator_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_trust_calculator_usage_date ON trust_calculator_usage(created_at);
CREATE INDEX IF NOT EXISTS idx_monthly_revenue_year_month ON monthly_revenue(year, month);
CREATE INDEX IF NOT EXISTS idx_feature_usage_date ON feature_usage(date);

-- =============================================================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE users IS 'Core user accounts for Vauntico platform';
COMMENT ON TABLE subscriptions IS 'User subscriptions from Stripe and Paystack';
COMMENT ON TABLE trust_scores IS 'Calculated trust scores for users';
COMMENT ON TABLE score_insurance IS 'Insurance policies protecting trust scores';
COMMENT ON TABLE trust_calculator_usage IS 'Usage tracking for trust calculator tool';
COMMENT ON TABLE monthly_revenue IS 'Phase 1 KPI tracking for monthly revenue';
COMMENT ON TABLE feature_usage IS 'Feature usage tracking for platform analytics';