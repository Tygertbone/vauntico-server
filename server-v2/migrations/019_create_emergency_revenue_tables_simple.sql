-- Migration: Emergency Revenue Tables (Simplified Version)
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
