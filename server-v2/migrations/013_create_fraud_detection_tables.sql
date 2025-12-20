-- Migration: Create fraud detection and chargeback protection tables
-- Purpose: Implement comprehensive payment fraud detection and chargeback defense
-- Date: 2025-01-05

-- Fraud detection patterns and rules
CREATE TABLE IF NOT EXISTS fraud_patterns (
    id SERIAL PRIMARY KEY,
    pattern_key VARCHAR(100) UNIQUE NOT NULL,
    pattern_type VARCHAR(50) NOT NULL, -- 'payment', 'account', 'usage', 'velocity'
    description TEXT NOT NULL,
    severity_score INTEGER NOT NULL CHECK (severity_score BETWEEN 1 AND 100),
    is_active BOOLEAN DEFAULT true,
    detection_logic JSONB NOT NULL, -- Rules for pattern detection
    false_positive_rate DECIMAL(5,4) DEFAULT 0.0000,
    threshold_value DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fraud risk scores for users
CREATE TABLE IF NOT EXISTS user_fraud_scores (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    overall_risk_score INTEGER NOT NULL CHECK (overall_risk_score BETWEEN 0 AND 100),
    payment_risk INTEGER DEFAULT 0 CHECK (payment_risk BETWEEN 0 AND 100),
    account_risk INTEGER DEFAULT 0 CHECK (account_risk BETWEEN 0 AND 100),
    usage_risk INTEGER DEFAULT 0 CHECK (usage_risk BETWEEN 0 AND 100),
    velocity_risk INTEGER DEFAULT 0 CHECK (velocity_risk BETWEEN 0 AND 100),
    last_calculated_at TIMESTAMPTZ DEFAULT NOW(),
    suspicious_flags_count INTEGER DEFAULT 0,
    requires_review BOOLEAN DEFAULT false,
    risk_level VARCHAR(20) DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id),
    INDEX idx_user_fraud_scores_risk_level (risk_level),
    INDEX idx_user_fraud_scores_overall (overall_risk_score DESC),
    INDEX idx_user_fraud_scores_review (requires_review) WHERE requires_review = true
);

-- Payment attempt logs with fraud indicators
CREATE TABLE IF NOT EXISTS payment_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    stripe_payment_intent_id VARCHAR(255),
    amount_cents INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'usd',
    status VARCHAR(50) NOT NULL, -- 'pending', 'succeeded', 'failed', 'disputed', 'refunded'
    fraud_score INTEGER CHECK (fraud_score BETWEEN 0 AND 100),
    fraud_signals JSONB, -- Fraud detection signals that triggered
    ip_address INET NOT NULL,
    user_agent TEXT,
    billing_details JSONB, -- Sanitized billing info for fraud analysis
    payment_method_digest VARCHAR(64), -- Hashed payment method fingerprint
    velocity_checks JSONB, -- Velocity analysis results
    geo_location JSONB, -- IP geolocation data
    device_fingerprint VARCHAR(255),
    is_chargeback BOOLEAN DEFAULT false,
    chargeback_reason TEXT,
    chargeback_date TIMESTAMPTZ,
    defense_actions_taken JSONB, -- What we did to prevent chargeback
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    INDEX idx_payment_attempts_user (user_id, created_at DESC),
    INDEX idx_payment_attempts_status (status),
    INDEX idx_payment_attempts_fraud (fraud_score DESC) WHERE fraud_score IS NOT NULL,
    INDEX idx_payment_attempts_chargeback (is_chargeback) WHERE is_chargeback = true,
    INDEX idx_payment_attempts_stripe (stripe_payment_intent_id)
);

-- Chargeback evidence vault for dispute defense
CREATE TABLE IF NOT EXISTS chargeback_evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_attempt_id UUID REFERENCES payment_attempts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    chargeback_id VARCHAR(255) NOT NULL,
    evidence_type VARCHAR(50) NOT NULL, -- 'user_agreement', 'login_proof', 'usage_log', 'ip_log', 'device_info'
    evidence_data JSONB NOT NULL,
    file_url TEXT, -- If evidence includes file uploads
    collected_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ, -- Evidence retention period

    INDEX idx_chargeback_evidence_payment (payment_attempt_id),
    INDEX idx_chargeback_evidence_user (user_id),
    INDEX idx_chargeback_evidence_chargeback (chargeback_id)
);

-- Fraud alerts and incidents
CREATE TABLE IF NOT EXISTS fraud_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    payment_attempt_id UUID REFERENCES payment_attempts(id) ON DELETE CASCADE,
    pattern_id INTEGER REFERENCES fraud_patterns(id) ON DELETE CASCADE,
    alert_message TEXT NOT NULL,
    alert_data JSONB,
    is_escalated BOOLEAN DEFAULT false,
    escalated_to VARCHAR(100),
    escalated_at TIMESTAMPTZ,
    resolution_status VARCHAR(30) DEFAULT 'open' CHECK (resolution_status IN ('open', 'investigating', 'resolved', 'closed')),
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    INDEX idx_fraud_alerts_type (alert_type),
    INDEX idx_fraud_alerts_severity (severity),
    INDEX idx_fraud_alerts_status (resolution_status),
    INDEX idx_fraud_alerts_user (user_id) WHERE user_id IS NOT NULL
);

-- Velocity tracking for fraud detection
CREATE TABLE IF NOT EXISTS velocity_counters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    counter_type VARCHAR(50) NOT NULL, -- 'payment_attempts', 'failed_payments', 'ip_changes', 'account_creations'
    counter_key VARCHAR(255) NOT NULL, -- IP, email domain, card bin, etc.
    count_value INTEGER NOT NULL DEFAULT 0,
    window_start TIMESTAMPTZ NOT NULL,
    window_end TIMESTAMPTZ NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, counter_type, counter_key, window_start),
    INDEX idx_velocity_counters_user (user_id, counter_type),
    INDEX idx_velocity_counters_window (counter_type, window_end)
);

-- Insert default fraud patterns
INSERT INTO fraud_patterns (pattern_key, pattern_type, description, severity_score, detection_logic, threshold_value) VALUES
('high_risk_ip', 'payment', 'Payment from known high-risk IP address', 85,
 '{"ipBlacklist": true, "sources": ["firehol-level1", "firehol-level2"]}', NULL),

('failed_payment_velocity', 'velocity', 'Multiple failed payment attempts in short time window', 70,
 '{"windowMinutes": 15, "maxAttempts": 3, "failureRate": 0.8}', 3),

('international_high_amount', 'payment', 'Large payment from international location for first-time user', 60,
 '{"minAmount": 5000, "internationalThreshold": true, "firstTimeMultiplier": 1.5}', 5000),

('card_bin_abuse', 'payment', 'Repeated use of cards from same BIN (bank identification number)', 75,
 '{"windowDays": 30, "maxCardsFromBin": 3, "differentUsers": true}', 3),

('account_creation_velocity', 'account', 'Rapid account creation from same IP or device', 65,
 '{"windowHours": 24, "maxAccounts": 5, "requireEmailVerification": true}', 5),

('payment_method_reuse', 'payment', 'Payment method used across multiple accounts', 80,
 '{"windowDays": 90, "maxAccountsPerMethod": 2, "differentBillingAddresses": true}', 2),

('unusual_geo_velocity', 'velocity', 'Payments from geographically distant locations in short time', 55,
 '{"maxDistanceKm": 2000, "windowHours": 24, "minLocations": 2}', 2000),

('device_fingerprint_mismatch', 'usage', 'Login from device that does not match established fingerprint patterns', 45,
 '{"knownDevices": true, "timeWindow": "30 days", "similarityThreshold": 0.3}', NULL);

COMMENT ON TABLE fraud_patterns IS 'Rules and patterns for detecting various types of payment fraud';
COMMENT ON TABLE user_fraud_scores IS 'Real-time fraud risk scores for users across multiple risk dimensions';
COMMENT ON TABLE payment_attempts IS 'Comprehensive log of all payment attempts with fraud analysis';
COMMENT ON TABLE chargeback_evidence IS 'Evidence vault for defending against chargeback disputes';
COMMENT ON TABLE fraud_alerts IS 'Fraud detection alerts and incident tracking';
COMMENT ON TABLE velocity_counters IS 'Time-window counters for velocity-based fraud detection';
