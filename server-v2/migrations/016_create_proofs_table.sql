-- Proof Vault MVP - Store subscription proofs with currency context
CREATE TABLE proofs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_code VARCHAR(100) NOT NULL, -- Paystack plan code or subscription identifier
    currency VARCHAR(3) NOT NULL DEFAULT 'NGN', -- USD, ZAR, NGN, EUR, etc.
    amount INTEGER NOT NULL, -- Amount in cents/kobo (smallest currency unit)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX idx_proofs_user_created ON proofs(user_id, created_at DESC);
CREATE INDEX idx_proofs_plan ON proofs(plan_code, created_at DESC);

-- RLS Policy (if tenant RLS is enabled)
-- ALTER TABLE proofs ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY proofs_user_access ON proofs FOR ALL USING (user_id = current_user_id());
