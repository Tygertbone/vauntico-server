-- Migration: Create security_events table
-- Purpose: Store security events for monitoring, analytics, and compliance
-- Date: 2025-01-05

CREATE TABLE IF NOT EXISTS security_events (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL, -- SecurityEventType enum values
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    ip_address INET NOT NULL,
    user_agent VARCHAR(500), -- Limit user agent length
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    payload JSONB, -- Store sanitized payload data
    details JSONB, -- Additional security event details
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Indexes for performance and analytics
    INDEX idx_security_events_type (type),
    INDEX idx_security_events_severity (severity),
    INDEX idx_security_events_ip (ip_address),
    INDEX idx_security_events_user_id (user_id),
    INDEX idx_security_events_created_at (created_at),
    INDEX idx_security_events_type_created_at (type, created_at),

    -- Composite index for common security queries
    INDEX idx_security_events_ip_type_time (ip_address, type, created_at)
);

-- Add table comment for documentation
COMMENT ON TABLE security_events IS 'Security event logs for monitoring, analytics, and compliance tracking';

-- Add column comments
COMMENT ON COLUMN security_events.type IS 'Type of security event (e.g., FAILED_AUTH, SUSPICIOUS_ACTIVITY)';
COMMENT ON COLUMN security_events.severity IS 'Severity level: low, medium, high, critical';
COMMENT ON COLUMN security_events.ip_address IS 'Client IP address that triggered the event';
COMMENT ON COLUMN security_events.user_agent IS 'HTTP user agent string (truncated to 500 chars)';
COMMENT ON COLUMN security_events.user_id IS 'Associated user ID if applicable';
COMMENT ON COLUMN security_events.endpoint IS 'API endpoint that was accessed';
COMMENT ON COLUMN security_events.method IS 'HTTP method used';
COMMENT ON COLUMN security_events.payload IS 'Request payload or relevant data (sanitized)';
COMMENT ON COLUMN security_events.details IS 'Additional event details and metadata';

-- Create a partial index for recent events (last 30 days) for better performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_events_recent
ON security_events(created_at)
WHERE created_at > CURRENT_TIMESTAMP - INTERVAL '30 days';

-- Create a view for security analytics
CREATE OR REPLACE VIEW security_analytics AS
SELECT
    DATE_TRUNC('hour', created_at) as hour,
    type,
    severity,
    COUNT(*) as event_count,
    COUNT(DISTINCT ip_address) as unique_ips,
    COUNT(DISTINCT user_id) as unique_users
FROM security_events
WHERE created_at > CURRENT_TIMESTAMP - INTERVAL '7 days'
GROUP BY DATE_TRUNC('hour', created_at), type, severity
ORDER BY hour DESC, event_count DESC;

-- Grant permissions (adjust based on your user/role setup)
-- GRANT SELECT ON security_events TO analytics_user;
-- GRANT SELECT ON security_analytics TO analytics_user;
