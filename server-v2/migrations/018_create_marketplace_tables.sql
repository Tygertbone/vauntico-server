-- Creator Marketplace Database Schema v1
-- Sprint 12: Marketplace Implementation
-- Tables for products, storefronts, orders, reviews, payouts, fraud detection, and analytics

-- Products table - Core marketplace products
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    trust_score_required DECIMAL(5,2) DEFAULT 60.00 CHECK (trust_score_required >= 0 AND trust_score_required <= 100),
    category VARCHAR(50),
    tags TEXT[], -- Array of tags for search/filtering
    images TEXT[], -- Array of image URLs
    media_urls TEXT[], -- Array for additional media (videos, etc.)
    is_active BOOLEAN DEFAULT TRUE,
    is_moderated BOOLEAN DEFAULT FALSE,
    moderation_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    moderation_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Storefronts table - Creator profile pages
CREATE TABLE storefronts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    profile_image_url TEXT,
    banner_image_url TEXT,
    social_links JSONB, -- {'twitter': 'url', 'youtube': 'url', etc.}
    trust_score DECIMAL(5,2), -- Cached trust score for performance
    total_sales INTEGER DEFAULT 0,
    total_revenue DECIMAL(10,2) DEFAULT 0,
    avg_rating DECIMAL(3,2), -- Average from reviews
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(creator_id)
);

-- Orders table - Purchase transactions
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'delivered', 'disputed', 'refunded', 'cancelled'
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    fee DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (fee >= 0), -- Platform fee
    escrow_amount DECIMAL(10,2) DEFAULT 0 CHECK (escrow_amount >= 0),
    escrow_status VARCHAR(20) DEFAULT 'none', -- 'none', 'held', 'released', 'disputed'
    escrow_release_deadline TIMESTAMP WITH TIME ZONE,
    paystack_reference VARCHAR(255) UNIQUE,
    payment_status VARCHAR(20) DEFAULT 'unpaid', -- 'unpaid', 'paid', 'failed', 'refunded'
    delivery_deadline TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table - Product feedback system
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    moderation_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'spam'
    moderator_notes TEXT,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, reviewer_id) -- One review per product per user
);

-- Payouts table - Creator earnings
CREATE TABLE payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    fee_amount DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (fee_amount >= 0),
    net_amount DECIMAL(10,2) NOT NULL CHECK (net_amount >= 0),
    scheduled_at TIMESTAMP WITH TIME ZONE,
    processed_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    paystack_transfer_id VARCHAR(255) UNIQUE,
    order_ids UUID[], -- Array of order IDs this payout covers
    payout_period_start DATE,
    payout_period_end DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fraud signals table - Suspicious activity tracking
CREATE TABLE fraud_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    signal_type VARCHAR(50) NOT NULL, -- 'abnormal_refund_rate', 'duplicate_listing', 'suspicious_velocity', etc.
    severity VARCHAR(20) DEFAULT 'low', -- 'low', 'medium', 'high', 'critical'
    description TEXT,
    signal_value DECIMAL(10,2),
    threshold_value DECIMAL(10,2),
    confidence DECIMAL(5,4), -- AI confidence score 0.0000-1.0000
    is_investigated BOOLEAN DEFAULT FALSE,
    investigated_at TIMESTAMP WITH TIME ZONE,
    investigation_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics events table - Marketplace analytics
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_name VARCHAR(100) NOT NULL,
    event_data JSONB, -- Flexible event data
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    location_data JSONB, -- Geo data for analytics
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_products_creator_active ON products(creator_id, is_active, created_at DESC);
CREATE INDEX idx_products_category_active ON products(category, is_active, created_at DESC);
CREATE INDEX idx_products_trust_required ON products(trust_score_required);
CREATE INDEX idx_products_tags ON products USING GIN(tags);
CREATE INDEX idx_products_moderation ON products(moderation_status, created_at DESC);

CREATE INDEX idx_storefronts_creator_active ON storefronts(creator_id, is_active);
CREATE INDEX idx_storefronts_trust_score ON storefronts(trust_score DESC);

CREATE INDEX idx_orders_product_status ON orders(product_id, status, created_at DESC);
CREATE INDEX idx_orders_buyer_created ON orders(buyer_id, created_at DESC);
CREATE INDEX idx_orders_paystack_ref ON orders(paystack_reference);
CREATE INDEX idx_orders_escrow_status ON orders(escrow_status, escrow_release_deadline);
CREATE INDEX idx_orders_delivery_deadline ON orders(delivery_deadline) WHERE status = 'paid';

CREATE INDEX idx_reviews_product_rating ON reviews(product_id, rating, created_at DESC);
CREATE INDEX idx_reviews_reviewer_created ON reviews(reviewer_id, created_at DESC);
CREATE INDEX idx_reviews_moderation ON reviews(moderation_status, created_at DESC);

CREATE INDEX idx_payouts_creator_status ON payouts(creator_id, status, scheduled_at DESC);
CREATE INDEX idx_payouts_scheduled ON payouts(scheduled_at) WHERE status = 'pending';

CREATE INDEX idx_fraud_signals_order_type ON fraud_signals(order_id, signal_type);
CREATE INDEX idx_fraud_signals_user_created ON fraud_signals(user_id, created_at DESC);
CREATE INDEX idx_fraud_signals_severity ON fraud_signals(severity, created_at DESC);
CREATE INDEX idx_fraud_signals_investigated ON fraud_signals(is_investigated, severity DESC) WHERE is_investigated = FALSE;

CREATE INDEX idx_analytics_events_name_created ON analytics_events(event_name, created_at DESC);
CREATE INDEX idx_analytics_events_user_created ON analytics_events(user_id, created_at DESC);
CREATE INDEX idx_analytics_events_session ON analytics_events(session_id, created_at DESC);

-- Triggers for updated_at timestamps
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_storefronts_updated_at BEFORE UPDATE ON storefronts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payouts_updated_at BEFORE UPDATE ON payouts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update product rating when reviews are added/updated
CREATE OR REPLACE FUNCTION update_product_average_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE products
    SET updated_at = NOW()
    WHERE id IN (
        SELECT product_id FROM reviews
        WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
        AND moderation_status = 'approved'
    );

    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

CREATE TRIGGER update_product_on_review_change
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_product_average_rating();

-- Function to update storefront stats when orders complete
CREATE OR REPLACE FUNCTION update_storefront_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'delivered' AND (OLD.status IS NULL OR OLD.status != 'delivered') THEN
        UPDATE storefronts
        SET total_sales = total_sales + 1,
            total_revenue = total_revenue + NEW.amount,
            updated_at = NOW()
        WHERE creator_id = (
            SELECT creator_id FROM products WHERE id = NEW.product_id
        );
    END IF;

    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_storefront_on_order_complete
    AFTER UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_storefront_stats();

-- Function to set escrow for orders based on trust score
CREATE OR REPLACE FUNCTION set_order_escrow()
RETURNS TRIGGER AS $$
DECLARE
    creator_trust_score DECIMAL(5,2);
BEGIN
    -- Get creator's trust score
    SELECT COALESCE(s.trust_score, ts.overall_score, 0) INTO creator_trust_score
    FROM products p
    LEFT JOIN storefronts s ON s.creator_id = p.creator_id
    LEFT JOIN trust_scores ts ON ts.user_id = p.creator_id AND ts.calculated_at >= NOW() - INTERVAL '24 hours'
    WHERE p.id = NEW.product_id
    ORDER BY ts.calculated_at DESC
    LIMIT 1;

    -- Set escrow for low-trust creators (below 70)
    IF creator_trust_score < 70 THEN
        NEW.escrow_status := 'held';
        NEW.escrow_release_deadline := NOW() + INTERVAL '7 days';
        NEW.escrow_amount := NEW.amount;
    END IF;

    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER set_order_escrow_on_create
    BEFORE INSERT ON orders
    FOR EACH ROW EXECUTE FUNCTION set_order_escrow();

-- Function to calculate platform fee based on trust score
CREATE OR REPLACE FUNCTION calculate_platform_fee(
    order_amount DECIMAL,
    creator_trust_score DECIMAL DEFAULT 0
) RETURNS DECIMAL AS $$
BEGIN
    -- Tiered fee structure: 5-15% based on trust score
    -- Higher trust score = lower fee
    IF creator_trust_score >= 90 THEN
        RETURN ROUND(order_amount * 0.05, 2); -- 5%
    ELSIF creator_trust_score >= 80 THEN
        RETURN ROUND(order_amount * 0.07, 2); -- 7%
    ELSIF creator_trust_score >= 70 THEN
        RETURN ROUND(order_amount * 0.10, 2); -- 10%
    ELSE
        RETURN ROUND(order_amount * 0.15, 2); -- 15%
    END IF;
END;
$$ language 'plpgsql';

-- Update the order fee when order is created
CREATE OR REPLACE FUNCTION set_order_fee()
RETURNS TRIGGER AS $$
DECLARE
    creator_trust_score DECIMAL(5,2);
BEGIN
    -- Get creator's trust score
    SELECT COALESCE(s.trust_score, ts.overall_score, 0) INTO creator_trust_score
    FROM products p
    LEFT JOIN storefronts s ON s.creator_id = p.creator_id
    LEFT JOIN trust_scores ts ON ts.user_id = p.creator_id AND ts.calculated_at >= NOW() - INTERVAL '24 hours'
    WHERE p.id = NEW.product_id
    ORDER BY ts.calculated_at DESC
    LIMIT 1;

    -- Calculate and set fee
    NEW.fee := calculate_platform_fee(NEW.amount, creator_trust_score);

    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER set_order_fee_on_create
    BEFORE INSERT ON orders
    FOR EACH ROW EXECUTE FUNCTION set_order_fee();

-- Add constraint that fee cannot exceed 20% of order amount
ALTER TABLE orders ADD CONSTRAINT check_fee_percentage CHECK (fee <= amount * 0.20);
