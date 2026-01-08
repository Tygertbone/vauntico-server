import { Pool, PoolClient } from 'pg';

// Database configuration
const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'vauntico',
  user: process.env.DB_USER || 'vauntico_user',
  password: process.env.DB_PASSWORD || 'vauntico_password',
  max: 20, // maximum number of clients in the pool
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // how long to wait when connecting a new client
};

// Create connection pool
export const pool = new Pool(poolConfig);

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Helper function to execute queries with error handling
export async function query(text: string, params?: any[]): Promise<any> {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    const duration = Date.now() - start;
    console.error('Query error', { text, duration, error });
    throw error;
  }
}

// Helper function to get a client from the pool for transactions
export async function getClient(): Promise<PoolClient> {
  return await pool.connect();
}

// Database health check
export async function healthCheck(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

// Graceful shutdown
export async function closePool(): Promise<void> {
  await pool.end();
  console.log('Database pool closed');
}

// Initialize database tables if they don't exist
export async function initializeDatabase(): Promise<void> {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        trust_score INTEGER DEFAULT 0,
        reputation_score INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create council_members table
    await client.query(`
      CREATE TABLE IF NOT EXISTS council_members (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        voting_weight DECIMAL(10, 2) NOT NULL,
        joined_at TIMESTAMP DEFAULT NOW(),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create proposals table
    await client.query(`
      CREATE TABLE IF NOT EXISTS proposals (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        description TEXT NOT NULL,
        type VARCHAR(50) NOT NULL CHECK (type IN ('governance', 'feature', 'policy', 'community')),
        status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'voting', 'completed', 'rejected')),
        created_by VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        voting_starts_at TIMESTAMP,
        voting_ends_at TIMESTAMP,
        quorum_required DECIMAL(3, 2) DEFAULT 0.4,
        trust_score_threshold INTEGER DEFAULT 750,
        yes_votes DECIMAL(15, 2) DEFAULT 0,
        no_votes DECIMAL(15, 2) DEFAULT 0,
        abstain_votes DECIMAL(15, 2) DEFAULT 0,
        total_weight DECIMAL(15, 2) DEFAULT 0,
        tags TEXT[],
        impact VARCHAR(20) DEFAULT 'medium' CHECK (impact IN ('low', 'medium', 'high', 'critical'))
      )
    `);

    // Create votes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS votes (
        id VARCHAR(255) PRIMARY KEY,
        proposal_id VARCHAR(255) REFERENCES proposals(id) ON DELETE CASCADE,
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        vote VARCHAR(10) NOT NULL CHECK (vote IN ('yes', 'no', 'abstain')),
        voting_weight DECIMAL(10, 2) NOT NULL,
        reasoning TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        trust_score_at_time INTEGER NOT NULL,
        UNIQUE(proposal_id, user_id)
      )
    `);

    // Create audit_trail table
    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_trail (
        id VARCHAR(255) PRIMARY KEY,
        action VARCHAR(255) NOT NULL,
        entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('proposal', 'vote', 'member', 'council')),
        entity_id VARCHAR(255) NOT NULL,
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
        old_value JSONB,
        new_value JSONB,
        timestamp TIMESTAMP DEFAULT NOW(),
        ip_address VARCHAR(45) NOT NULL,
        user_agent TEXT,
        reason TEXT
      )
    `);

    // Create sponsorships table
    await client.query(`
      CREATE TABLE IF NOT EXISTS sponsorships (
        id VARCHAR(255) PRIMARY KEY,
        sponsor_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        creator_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        tier VARCHAR(50) NOT NULL CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
        amount DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'USD',
        status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('pending', 'active', 'expired', 'cancelled')),
        start_date TIMESTAMP DEFAULT NOW(),
        end_date TIMESTAMP,
        kpis JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create marketplace_items table
    await client.query(`
      CREATE TABLE IF NOT EXISTS marketplace_items (
        id VARCHAR(255) PRIMARY KEY,
        creator_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(500) NOT NULL,
        description TEXT NOT NULL,
        type VARCHAR(50) NOT NULL CHECK (type IN ('widget', 'badge', 'integration', 'template')),
        price DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'USD',
        status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'active', 'inactive')),
        license_type VARCHAR(50) DEFAULT 'standard' CHECK (license_type IN ('standard', 'premium', 'exclusive')),
        revenue_share_percentage DECIMAL(5, 2) DEFAULT 0.3,
        download_url VARCHAR(500),
        preview_url VARCHAR(500),
        tags TEXT[],
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create marketplace_purchases table
    await client.query(`
      CREATE TABLE IF NOT EXISTS marketplace_purchases (
        id VARCHAR(255) PRIMARY KEY,
        item_id VARCHAR(255) REFERENCES marketplace_items(id) ON DELETE CASCADE,
        buyer_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        amount DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'USD',
        status VARCHAR(50) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'refunded', 'cancelled')),
        purchased_at TIMESTAMP DEFAULT NOW(),
        license_key VARCHAR(255),
        expires_at TIMESTAMP
      )
    `);

    // Create community_engagement table
    await client.query(`
      CREATE TABLE IF NOT EXISTS community_engagement (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('love_loop', 'legacy_tree', 'leaderboard', 'echo_chamber')),
        target_id VARCHAR(255),
        data JSONB,
        credits_earned INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create vauntico_credits table
    await client.query(`
      CREATE TABLE IF NOT EXISTS vauntico_credits (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        amount INTEGER NOT NULL,
        source VARCHAR(100) NOT NULL,
        reference_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        expires_at TIMESTAMP
      )
    `);

    // Create indexes for better performance
    await client.query('CREATE INDEX IF NOT EXISTS idx_council_members_user_id ON council_members(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_proposals_created_by ON proposals(created_by)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_votes_proposal_id ON votes(proposal_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_audit_trail_entity ON audit_trail(entity_type, entity_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_audit_trail_timestamp ON audit_trail(timestamp)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_sponsorships_creator_id ON sponsorships(creator_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_marketplace_items_creator_id ON marketplace_items(creator_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_marketplace_purchases_buyer_id ON marketplace_purchases(buyer_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_community_engagement_user_id ON community_engagement(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_vauntico_credits_user_id ON vauntico_credits(user_id)');

    await client.query('COMMIT');
    console.log('Database initialized successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Database initialization failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Export types for database operations
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

export default pool;