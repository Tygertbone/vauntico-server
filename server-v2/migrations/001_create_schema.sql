-- Vauntico Trust Score Database Schema v2
-- Optimized for Neon.tech 512MB free tier
-- All tables designed for maximum efficiency

-- Users table (main user data)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    subscription_tier VARCHAR(20) DEFAULT 'free',
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP WITH TIME ZONE
);

-- OAuth connections (encrypted storage for API credentials)
CREATE TABLE oauth_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL, -- 'google_analytics', 'youtube', 'stripe'
    access_token TEXT NOT NULL, -- Encrypted
    refresh_token TEXT, -- Encrypted (when available)
    token_expires_at TIMESTAMP WITH TIME ZONE,
    scope TEXT[], -- OAuth scopes granted
    connection_status VARCHAR(20) DEFAULT 'active', -- 'active', 'expired', 'revoked'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_sync TIMESTAMP WITH TIME ZONE,
    credentials_hash VARCHAR(255), -- For credential validation
    UNIQUE(user_id, platform)
);

-- Content items (posts, videos, etc.)
CREATE TABLE content_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL, -- 'youtube', 'substack', 'blog'
    external_id VARCHAR(255) NOT NULL, -- Platform-specific ID
    title TEXT,
    description TEXT,
    content_type VARCHAR(50), -- 'video', 'article', 'podcast'
    published_at TIMESTAMP WITH TIME ZONE,
    url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content metrics (performance data with UEI calculation)
CREATE TABLE content_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_item_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
    date_recorded DATE NOT NULL,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    watch_time_seconds INTEGER DEFAULT 0,
    subscribers_gained INTEGER DEFAULT 0,
    revenue_cents INTEGER DEFAULT 0, -- Revenue in cents
    uei_score DECIMAL(5,3), -- UEI = (Views × Engagement Rate) ÷ 1000, 0.000-999.999
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Composite unique constraint to prevent duplicate metrics per content per date
    UNIQUE(content_item_id, date_recorded)
);

-- Trust scores (5 components + overall score)
CREATE TABLE trust_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    overall_score DECIMAL(5,2) NOT NULL, -- 0.00-100.00
    consistency_score DECIMAL(5,2) DEFAULT 0, -- Max 20 points
    engagement_score DECIMAL(5,2) DEFAULT 0, -- Max 30 points
    revenue_score DECIMAL(5,2) DEFAULT 0, -- Max 15 points
    platform_health_score DECIMAL(5,2) DEFAULT 0, -- Max 20 points
    legacy_score DECIMAL(5,2) DEFAULT 0, -- Max 15 points
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    next_calculation TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
    data_period_start DATE, -- Start of scoring period
    data_period_end DATE, -- End of scoring period
    total_content_items INTEGER DEFAULT 0,
    total_views INTEGER DEFAULT 0,
    total_engagement INTEGER DEFAULT 0,
    score_trend VARCHAR(10), -- 'up', 'down', 'stable'
    previous_score DECIMAL(5,2)
);

-- Anomaly flags (8 detection rules)
CREATE TABLE anomaly_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content_item_id UUID REFERENCES content_items(id) ON DELETE CASCADE,
    anomaly_type VARCHAR(50) NOT NULL, -- 'sudden_drop', 'unusual_traffic', 'engagement_spike', etc.
    severity VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    description TEXT,
    detected_value DECIMAL(10,2),
    expected_value DECIMAL(10,2),
    confidence DECIMAL(5,4), -- AI confidence 0.0000-1.0000
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User stats cache (performance optimization for dashboard)
CREATE TABLE user_stats_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stat_type VARCHAR(50) NOT NULL, -- 'monthly_views', 'total_followers', 'revenue_trend'
    stat_period VARCHAR(20), -- 'lifetime', 'last_30_days', 'last_7_days'
    stat_value DECIMAL(15,2),
    stat_unit VARCHAR(20), -- 'count', 'currency', 'percentage'
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 hour'),
    UNIQUE(user_id, stat_type, stat_period)
);

-- OPTIMIZED INDEXES (minimal set for 512MB limit)
-- Users table indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = TRUE;

-- OAuth connections indexes
CREATE INDEX idx_oauth_user_platform ON oauth_connections(user_id, platform);
CREATE INDEX idx_oauth_status ON oauth_connections(connection_status);

-- Content items indexes (most frequently queried)
CREATE INDEX idx_content_user_platform ON content_items(user_id, platform);
CREATE INDEX idx_content_published_at ON content_items(published_at DESC);
CREATE INDEX idx_content_user_created ON content_items(user_id, created_at DESC);

-- Content metrics indexes (most critical for performance)
CREATE INDEX idx_metrics_content_date ON content_metrics(content_item_id, date_recorded DESC);
CREATE INDEX idx_metrics_date ON content_metrics(date_recorded DESC);
CREATE INDEX idx_metrics_uei ON content_metrics(uei_score DESC) WHERE uei_score IS NOT NULL;

-- Trust scores indexes
CREATE INDEX idx_trust_user_calculated ON trust_scores(user_id, calculated_at DESC);
CREATE INDEX idx_trust_overall_score ON trust_scores(overall_score DESC);
CREATE INDEX idx_trust_next_calc ON trust_scores(next_calculation);

-- Anomaly flags indexes
CREATE INDEX idx_anomalies_user_created ON anomaly_flags(user_id, created_at DESC);
CREATE INDEX idx_anomalies_unresolved ON anomaly_flags(is_resolved, created_at DESC) WHERE is_resolved = FALSE;

-- Stats cache indexes
CREATE INDEX idx_stats_user_type ON user_stats_cache(user_id, stat_type);
CREATE INDEX idx_stats_expires ON user_stats_cache(expires_at);

-- FUNCTIONS AND TRIGGERS

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_oauth_updated_at BEFORE UPDATE ON oauth_connections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON content_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_anomalies_updated_at BEFORE UPDATE ON anomaly_flags FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate UEI score on insert/update
CREATE OR REPLACE FUNCTION calculate_uei_score()
RETURNS TRIGGER AS $$
BEGIN
    -- UEI = (Views × Engagement Rate) ÷ 1000
    -- Engagement Rate = ((Likes + Comments + Shares) / Views) × 100
    -- Simplified: UEI = (Views × ((Likes + Comments + Shares) / NULLIF(Views, 0))) / 10
    IF NEW.views > 0 THEN
        NEW.uei_score = ROUND(
            (NEW.views::DECIMAL * (NEW.likes + NEW.comments + NEW.shares)::DECIMAL / NEW.views::DECIMAL) / 10,
            3
        );
    ELSE
        NEW.uei_score = 0;
    END IF;

    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply UEI calculation trigger
CREATE TRIGGER calculate_content_metrics_uei
    BEFORE INSERT OR UPDATE ON content_metrics
    FOR EACH ROW EXECUTE FUNCTION calculate_uei_score();

-- ARCHIVE STRATEGY: Quarterly data cleanup to stay within 512MB
-- Run via GitHub Actions cron job (separately managed)

-- Estimated storage per table (for monitoring):
-- users: ~5KB/user
-- oauth_connections: ~2KB/connection
-- content_items: ~3KB/item (with title/description)
-- content_metrics: ~200B/record (daily metrics)
-- trust_scores: ~150B/record
-- anomaly_flags: ~100B/record
-- user_stats_cache: ~50B/record

-- With 100 active creators:
-- ~500KB users, ~200KB oauth, ~150KB content items
-- ~600KB daily metrics (30 days), ~150KB trust scores
-- ~50KB anomalies, ~50KB cache
-- Total: ~1.7MB active data (well under 512MB limit)

-- Data retention: Keep last 6 months of content_metrics,
-- Archive older data or delete if not needed for trust scoring.
