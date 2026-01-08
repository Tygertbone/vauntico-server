-- Migration: Emergency Revenue Tables
-- Purpose: Add creator payment processing, verification, and content recovery capabilities
-- Date: 2025-01-06
-- Dependencies: Requires users table (001_create_schema.sql)

-- Creator Payment Requests Table
-- Handles international payment bridging and Paystack payout tracking
CREATE TABLE IF NOT EXISTS creator_payment_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    request_type VARCHAR(20) NOT NULL DEFAULT 'payout', -- 'payout', 'bridge', 'refund'
    amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'NGN',
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid', 'failed', 'cancelled')),
    payment_provider VARCHAR(20) NOT NULL DEFAULT 'paystack' CHECK (payment_provider IN ('paystack', 'stripe', 'paypal', 'wise')),
    external_transaction_id VARCHAR(255), -- External payment system reference
    paystack_reference VARCHAR(255), -- Paystack payout reference
    bank_account_details JSONB, -- Encrypted bank account info for payouts
    rejection_reason TEXT,
    processing_fee_cents INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    
    -- Constraints
    CONSTRAINT creator_payment_requests_amount_check CHECK (amount_cents > processing_fee_cents)
);

-- Creator Verifications Table
-- Stores platform verification data for trust score calculation
CREATE TABLE IF NOT EXISTS creator_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL CHECK (platform IN ('tiktok', 'instagram', 'youtube', 'twitter', 'linkedin')),
    platform_username VARCHAR(255) NOT NULL,
    platform_user_id VARCHAR(255), -- Platform's internal user ID
    verification_token VARCHAR(255), -- Temporary verification token
    verification_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'expired')),
    verification_data JSONB, -- Platform API response data
    followers_count INTEGER,
    engagement_rate DECIMAL(5,4), -- Engagement percentage
    content_quality_score DECIMAL(5,2), -- AI-calculated content quality
    trust_score_impact DECIMAL(5,2), -- Impact on overall trust score
    verification_method VARCHAR(20) DEFAULT 'api' CHECK (verification_method IN ('api', 'manual', 'document')),
    verified_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT creator_verifications_unique_platform UNIQUE(creator_id, platform),
    CONSTRAINT creator_verifications_impact_check CHECK (trust_score_impact >= -20 AND trust_score_impact <= 20)
);

-- Content Recovery Cases Table
-- Handles stolen content recovery with 30% success fee model
CREATE TABLE IF NOT EXISTS content_recovery_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content_owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Original content owner
    case_number VARCHAR(50) UNIQUE NOT NULL, -- Auto-generated case number
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    content_platform VARCHAR(50) NOT NULL, -- Where stolen content was hosted
    content_url TEXT,
    evidence_urls TEXT[], -- Array of evidence URLs
    status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed', 'rejected')),
    priority VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    recovery_method VARCHAR(20) CHECK (recovery_method IN ('dmca', 'legal', 'negotiation', 'technical')),
    success_fee_percentage DECIMAL(5,2) NOT NULL DEFAULT 30.00 CHECK (success_fee_percentage >= 0 AND success_fee_percentage <= 100),
    recovery_cost_cents INTEGER,
    actual_recovery_amount_cents INTEGER,
    assigned_investigator_id UUID REFERENCES users(id) ON DELETE SET NULL,
    resolution_notes TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT content_recovery_cases_fee_check CHECK (
        (recovery_cost_cents IS NULL) OR 
        (actual_recovery_amount_cents IS NULL) OR
        (actual_recovery_amount_cents >= (recovery_cost_cents * success_fee_percentage / 100))
    )
);

-- Indexes for Performance Optimization
-- Creator Payment Requests Indexes
CREATE INDEX IF NOT EXISTS idx_creator_payment_requests_creator_id ON creator_payment_requests(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_payment_requests_status ON creator_payment_requests(status);
CREATE INDEX IF NOT EXISTS idx_creator_payment_requests_created_at ON creator_payment_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_creator_payment_requests_provider ON creator_payment_requests(payment_provider);
CREATE INDEX IF NOT EXISTS idx_creator_payment_requests_paystack_ref ON creator_payment_requests(paystack_reference) WHERE paystack_reference IS NOT NULL;

-- Creator Verifications Indexes
CREATE INDEX IF NOT EXISTS idx_creator_verifications_creator_id ON creator_verifications(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_verifications_platform ON creator_verifications(platform);
CREATE INDEX IF NOT EXISTS idx_creator_verifications_status ON creator_verifications(verification_status);
CREATE INDEX IF NOT EXISTS idx_creator_verifications_created_at ON creator_verifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_creator_verifications_impact ON creator_verifications(trust_score_impact DESC) WHERE verification_status = 'verified';

-- Content Recovery Cases Indexes
CREATE INDEX IF NOT EXISTS idx_content_recovery_cases_user_id ON content_recovery_cases(user_id);
CREATE INDEX IF NOT EXISTS idx_content_recovery_cases_owner_id ON content_recovery_cases(content_owner_id);
CREATE INDEX IF NOT EXISTS idx_content_recovery_cases_status ON content_recovery_cases(status);
CREATE INDEX IF NOT EXISTS idx_content_recovery_cases_priority ON content_recovery_cases(priority);
CREATE INDEX IF NOT EXISTS idx_content_recovery_cases_created_at ON content_recovery_cases(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_recovery_cases_investigator ON content_recovery_cases(assigned_investigator_id) WHERE assigned_investigator_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_content_recovery_cases_case_number ON content_recovery_cases(case_number);

-- Functions and Triggers

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate unique case numbers for recovery cases
CREATE OR REPLACE FUNCTION generate_case_number()
RETURNS TEXT AS $$
DECLARE
    case_prefix TEXT := 'VRC'; -- Vauntico Recovery Case
    sequence_num INTEGER;
BEGIN
    -- Get next sequence number (simplified for free tier)
    SELECT COALESCE(MAX(CAST(SUBSTRING(case_number, 5) AS INTEGER)), 0) + 1 
    INTO sequence_num
    FROM content_recovery_cases 
    WHERE case_number LIKE 'VRC%';
    
    RETURN case_prefix || LPAD(sequence_num::TEXT, 8, '0');
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate case numbers
CREATE OR REPLACE FUNCTION set_case_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.case_number IS NULL THEN
        NEW.case_number := generate_case_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply case number trigger
CREATE TRIGGER set_content_recovery_case_number
    BEFORE INSERT ON content_recovery_cases
    FOR EACH ROW EXECUTE FUNCTION set_case_number();

-- Function to update user's trust score based on verification
CREATE OR REPLACE FUNCTION update_trust_score_on_verification()
RETURNS TRIGGER AS $$
DECLARE
    current_trust DECIMAL;
    new_trust DECIMAL;
BEGIN
    -- Get current trust score for the creator
    SELECT COALESCE(overall_score, 0) INTO current_trust
    FROM trust_scores 
    WHERE user_id = NEW.creator_id 
    ORDER BY calculated_at DESC 
    LIMIT 1;
    
    -- Calculate new trust score (clamp between 0 and 100)
    new_trust := LEAST(100, GREATEST(0, current_trust + COALESCE(NEW.trust_score_impact, 0)));
    
    -- Update or insert trust score
    INSERT INTO trust_scores (
        user_id, 
        overall_score, 
        consistency_score, 
        engagement_score, 
        revenue_score, 
        platform_health_score, 
        legacy_score, 
        calculated_at, 
        next_calculation,
        score_trend,
        previous_score
    ) VALUES (
        NEW.creator_id,
        new_trust,
        COALESCE((SELECT consistency_score FROM trust_scores WHERE user_id = NEW.creator_id ORDER BY calculated_at DESC LIMIT 1), 0),
        COALESCE((SELECT engagement_score FROM trust_scores WHERE user_id = NEW.creator_id ORDER BY calculated_at DESC LIMIT 1), 0),
        COALESCE((SELECT revenue_score FROM trust_scores WHERE user_id = NEW.creator_id ORDER BY calculated_at DESC LIMIT 1), 0),
        COALESCE((SELECT platform_health_score FROM trust_scores WHERE user_id = NEW.creator_id ORDER BY calculated_at DESC LIMIT 1), 0),
        COALESCE((SELECT legacy_score FROM trust_scores WHERE user_id = NEW.creator_id ORDER BY calculated_at DESC LIMIT 1), 0),
        NOW(),
        NOW() + INTERVAL '24 hours',
        CASE 
            WHEN new_trust > current_trust THEN 'up'
            WHEN new_trust < current_trust THEN 'down'
            ELSE 'stable'
        END,
        current_trust
    ) ON CONFLICT (user_id) DO UPDATE SET
        overall_score = EXCLUDED.overall_score,
        consistency_score = EXCLUDED.consistency_score,
        engagement_score = EXCLUDED.engagement_score,
        revenue_score = EXCLUDED.revenue_score,
        platform_health_score = EXCLUDED.platform_health_score,
        legacy_score = EXCLUDED.legacy_score,
        calculated_at = NOW(),
        next_calculation = NOW() + INTERVAL '24 hours',
        score_trend = EXCLUDED.score_trend,
        previous_score = EXCLUDED.previous_score;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trust score update trigger for verified verifications
CREATE TRIGGER update_trust_on_verification
    AFTER UPDATE ON creator_verifications
    FOR EACH ROW 
    WHEN (NEW.verification_status = 'verified' AND OLD.verification_status != 'verified')
    EXECUTE FUNCTION update_trust_score_on_verification();

-- Update timestamp triggers
CREATE TRIGGER update_creator_payment_requests_updated_at 
    BEFORE UPDATE ON creator_payment_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_creator_verifications_updated_at 
    BEFORE UPDATE ON creator_verifications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_recovery_cases_updated_at 
    BEFORE UPDATE ON content_recovery_cases 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Views for Common Queries

-- Creator verification summary view
CREATE OR REPLACE VIEW creator_verification_summary AS
SELECT 
    c.id as creator_id,
    c.email,
    COUNT(cv.id) as total_verifications,
    COUNT(CASE WHEN cv.verification_status = 'verified' THEN 1 END) as verified_count,
    COUNT(CASE WHEN cv.verification_status = 'pending' THEN 1 END) as pending_count,
    SUM(cv.trust_score_impact) as total_trust_impact,
    MAX(cv.verified_at) as last_verification_date,
    STRING_AGG(DISTINCT cv.platform, ', ' ORDER BY cv.platform') as verified_platforms
FROM users c
LEFT JOIN creator_verifications cv ON c.id = cv.creator_id
GROUP BY c.id, c.email;

-- Active recovery cases view
CREATE OR REPLACE VIEW active_recovery_cases AS
SELECT 
    crc.*,
    u.email as case_owner_email,
    COALESCE(u.first_name || ' ' || u.last_name, 'Unknown') as case_owner_name,
    investigator.email as investigator_email,
    COALESCE(investigator.first_name || ' ' || investigator.last_name, 'Unassigned') as investigator_name
FROM content_recovery_cases crc
JOIN users u ON crc.user_id = u.id
LEFT JOIN users investigator ON crc.assigned_investigator_id = investigator.id
WHERE crc.status IN ('open', 'investigating')
ORDER BY crc.priority DESC, crc.created_at ASC;

-- Payment request summary view
CREATE OR REPLACE VIEW payment_request_summary AS
SELECT 
    cpr.creator_id,
    c.email as creator_email,
    COUNT(cpr.id) as total_requests,
    COUNT(CASE WHEN cpr.status = 'pending' THEN 1 END) as pending_requests,
    COUNT(CASE WHEN cpr.status = 'paid' THEN 1 END) as paid_requests,
    SUM(CASE WHEN cpr.status = 'paid' THEN cpr.amount_cents ELSE 0 END) as total_paid_amount_cents,
    SUM(cpr.processing_fee_cents) as total_fees_cents,
    MAX(cpr.created_at) as last_request_date
FROM creator_payment_requests cpr
JOIN users c ON cpr.creator_id = c.id
GROUP BY cpr.creator_id, c.email;

-- Comments for documentation
COMMENT ON TABLE creator_payment_requests IS 'Handles international payment bridging and Paystack payouts for creators';
COMMENT ON TABLE creator_verifications IS 'Stores platform verification data that impacts creator trust scores';
COMMENT ON TABLE content_recovery_cases IS 'Manages stolen content recovery cases with 30% success fee model';

COMMENT ON COLUMN creator_payment_requests.amount_cents IS 'Amount in cents (multiply by 100 for Naira kobo equivalent)';
COMMENT ON COLUMN creator_verifications.trust_score_impact IS 'Impact on creator''s overall trust score (-20 to +20 points)';
COMMENT ON COLUMN content_recovery_cases.success_fee_percentage IS 'Percentage fee charged on successful recovery (default 30%)';
COMMENT ON COLUMN content_recovery_cases.case_number IS 'Auto-generated unique case number (VRCXXXXXXXX format)';

-- Verification of migration success
SELECT 'Migration 019: Emergency revenue tables created successfully' as status;

-- Row count verification (for testing)
SELECT 
    'creator_payment_requests' as table_name,
    COUNT(*) as row_count
FROM creator_payment_requests
UNION ALL
SELECT 
    'creator_verifications' as table_name,
    COUNT(*) as row_count
FROM creator_verifications
UNION ALL
SELECT 
    'content_recovery_cases' as table_name,
    COUNT(*) as row_count
FROM content_recovery_cases;
