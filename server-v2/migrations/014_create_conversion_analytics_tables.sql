-- Migration: Create conversion analytics and optimization tables
-- Purpose: Implement data-driven conversion optimization and revenue intelligence
-- Date: 2025-01-05

-- User conversion funnel events
CREATE TABLE IF NOT EXISTS conversion_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- 'trial_started', 'feature_used', 'upgrade_prompt_shown', 'upgrade_clicked', 'payment_completed', 'trial_expired', 'cancelled'
    event_source VARCHAR(100), -- 'upgrade_prompt', 'usage_limit', 'feature_discovery', 'email_campaign', 'trial_warning'
    metadata JSONB, -- Event-specific data (feature_name, amount, prompt_variant, etc.)
    session_id VARCHAR(255),
    funnel_stage VARCHAR(30), -- 'awareness', 'interest', 'consideration', 'decision', 'action', 'retention'
    conversion_probability DECIMAL(5,4), -- ML score for conversion likelihood
    created_at TIMESTAMPTZ DEFAULT NOW(),

    INDEX idx_conversion_events_user (user_id, created_at DESC),
    INDEX idx_conversion_events_type (event_type),
    INDEX idx_conversion_events_source (event_source),
    INDEX idx_conversion_events_stage (funnel_stage),
    INDEX idx_conversion_events_probability (conversion_probability DESC)
);

-- A/B testing experiments for conversion optimization
CREATE TABLE IF NOT EXISTS ab_experiments (
    id SERIAL PRIMARY KEY,
    experiment_key VARCHAR(100) UNIQUE NOT NULL,
    experiment_name VARCHAR(255) NOT NULL,
    description TEXT,
    target_metric VARCHAR(50) NOT NULL, -- 'upgrade_click_rate', 'conversion_rate', 'trial_activation'
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
    variants JSONB NOT NULL, -- Array of variant configurations
    winner_variant VARCHAR(50), -- Determined winner
    sample_size INTEGER DEFAULT 0,
    statistical_significance DECIMAL(5,4),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,

    INDEX idx_ab_experiments_status (status),
    INDEX idx_ab_experiments_metric (target_metric)
);

-- Experiment user assignments
CREATE TABLE IF NOT EXISTS experiment_assignments (
    id SERIAL PRIMARY KEY,
    experiment_id INTEGER REFERENCES ab_experiments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    variant_name VARCHAR(50) NOT NULL,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(experiment_id, user_id),
    INDEX idx_experiment_assignments_user (user_id),
    INDEX idx_experiment_assignments_variant (variant_name)
);

-- User conversion scores and insights
CREATE TABLE IF NOT EXISTS user_conversion_scores (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    overall_conversion_score DECIMAL(5,4), -- 0-1 scale
    trial_likelihood DECIMAL(5,4),
    upgrade_intent DECIMAL(5,4),
    churn_risk DECIMAL(5,4),
    price_sensitivity VARCHAR(20), -- 'high', 'medium', 'low'
    preferred_features TEXT[], -- Array of features they engage with most
    engagement_patterns JSONB, -- Historical usage patterns for prediction
    segment_tags TEXT[], -- User segmentation tags
    last_calculated_at TIMESTAMPTZ DEFAULT NOW(),
    calculated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id),
    INDEX idx_conversion_scores_overall (overall_conversion_score DESC),
    INDEX idx_conversion_scores_upgrade (upgrade_intent DESC),
    INDEX idx_conversion_scores_churn (churn_risk)
);

-- Revenue attribution and analytics
CREATE TABLE IF NOT EXISTS revenue_attribution (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    revenue_type VARCHAR(30) NOT NULL, -- 'subscription', 'upgrade', 'addon', 'referral'
    amount_cents INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'usd',
    attribution_source VARCHAR(50), -- 'organic', 'email_campaign', 'upgrade_prompt', 'trial_expiry', 'usage_limit', 'referral'
    conversion_path JSONB, -- Array of touchpoints leading to conversion
    time_to_convert INTERVAL, -- Time from first contact to conversion
    lifecycle_value_cents INTEGER, -- Predicted customer lifetime value
    created_at TIMESTAMPTZ DEFAULT NOW(),

    INDEX idx_revenue_attribution_user (user_id),
    INDEX idx_revenue_attribution_source (attribution_source),
    INDEX idx_revenue_attribution_type (revenue_type),
    INDEX idx_revenue_attribution_amount (amount_cents)
);

-- Conversion behavioral triggers
CREATE TABLE IF NOT EXISTS conversion_triggers (
    id SERIAL PRIMARY KEY,
    trigger_key VARCHAR(100) UNIQUE NOT NULL,
    trigger_name VARCHAR(255) NOT NULL,
    trigger_type VARCHAR(30) NOT NULL, -- 'usage_limit', 'trial_warning', 'feature_discovery', 'engagement_boost', 'price_change'
    conditions JSONB NOT NULL, -- When to fire this trigger
    actions JSONB NOT NULL, -- What to do when triggered (show prompt, send email, offer discount)
    priority INTEGER DEFAULT 1, -- Execution priority (higher = more important)
    is_active BOOLEAN DEFAULT true,
    performance_metrics JSONB, -- CTR, conversion rate, etc.
    created_at TIMESTAMPTZ DEFAULT NOW(),

    INDEX idx_conversion_triggers_type (trigger_type),
    INDEX idx_conversion_triggers_active (is_active) WHERE is_active = true,
    INDEX idx_conversion_triggers_priority (priority DESC)
);

-- Insert initial conversion triggers
INSERT INTO conversion_triggers (trigger_key, trigger_name, trigger_type, conditions, actions, priority) VALUES
('usage_limit_ai_generation', 'AI Generation Limit Reached', 'usage_limit',
 '{"feature": "ai_generation", "threshold": 0.8, "recurring": true}',
 '{"type": "upgrade_prompt", "variant": "usage_limit", "urgency": "medium", "discount": 0.1}',
 9),

('trial_expiry_warning', 'Trial About to Expire', 'trial_warning',
 '{"days_remaining": 3, "no_payment_attempts": true}',
 '{"type": "email_campaign", "template": "trial_expiry_warning", "discount": 0.2}',
 10),

('high_engagement_free_user', 'Highly Engaged Free User', 'engagement_boost',
 '{"usage_score": 7, "account_age_days": 14, "never_upgraded": true}',
 '{"type": "personalized_offer", "variant": "engagement_based", "discount": 0.15}',
 8),

('feature_discovery_advanced', 'Advanced Feature Discovery', 'feature_discovery',
 '{"feature_used": "advanced_analytics", "is_free_tier": true}',
 '{"type": "upgrade_prompt", "variant": "feature_unlock", "highlight_feature": "analytics"}',
 7),

('churn_risk_detected', 'Churn Risk Intervention', 'engagement_boost',
 '{"churn_score": 0.7, "last_activity_days": 7, "subscription_active": true}',
 '{"type": "re_engagement_campaign", "offer": "pause_subscription", "discount": 0.25}',
 9);

-- Insert initial A/B testing experiments
INSERT INTO ab_experiments (experiment_key, experiment_name, target_metric, variants, sample_size) VALUES
('upgrade_prompt_positioning', 'Upgrade Prompt Positioning Test', 'upgrade_click_rate',
 '[{"name": "modal", "weight": 50, "config": {"position": "modal", "urgency": "medium"}},
   {"name": "banner", "weight": 50, "config": {"position": "banner", "urgency": "low"}}]',
 1000),

('pricing_display', 'Pricing Display Optimization', 'conversion_rate',
 '[{"name": "yearly_first", "weight": 50, "config": {"yearly_prominent": true, "savings_highlight": true}},
   {"name": "monthly_first", "weight": 50, "config": {"monthly_prominent": true}}]',
 1000),

('trial_extension', 'Trial Extension Offer', 'trial_activation',
 '[{"name": "no_extension", "weight": 70, "config": {"extension_days": 0}},
   {"name": "7_day_extension", "weight": 30, "config": {"extension_days": 7, "extension_condition": "engaged"}}]',
 2000);

COMMENT ON TABLE conversion_events IS 'User journey events through the conversion funnel';
COMMENT ON TABLE ab_experiments IS 'A/B testing experiments for conversion optimization';
COMMENT ON TABLE experiment_assignments IS 'Random user assignments to experiment variants';
COMMENT ON TABLE user_conversion_scores IS 'ML-powered conversion likelihood scores and user insights';
COMMENT ON TABLE revenue_attribution IS 'Revenue attribution and customer lifetime value tracking';
COMMENT ON TABLE conversion_triggers IS 'Behavioral triggers for personalized conversion campaigns';
