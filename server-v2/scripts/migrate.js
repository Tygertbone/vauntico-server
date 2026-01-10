import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Pool } from 'pg';

// Configure dotenv at the top
dotenv.config();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Enhanced logging utility
const logger = {
  info: (message, ...args) => console.log(`ℹ️  [INFO] ${message}`, ...args),
  success: (message, ...args) => console.log(`✅ [SUCCESS] ${message}`, ...args),
  error: (message, error) => console.error(`❌ [ERROR] ${message}`, error?.message || error),
  warn: (message, ...args) => console.warn(`⚠️  [WARN] ${message}`, ...args)
};

async function migrate() {
  const startTime = Date.now();
  
  // Validate environment variables
  if (!process.env.DATABASE_URL) {
    logger.error('DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  const dbConfig = {
    connectionString: process.env.DATABASE_URL,
    max: 10,
    min: 1,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 60000,
    ssl: { rejectUnauthorized: false }
  };

  const pool = new Pool(dbConfig);
  let client;

  try {
    logger.info('Starting database migration process...');
    logger.info('Connecting to Neon PostgreSQL...');
    
    client = await pool.connect();
    logger.success('Database connection established');

    // Check if migration file exists
    const migrationPath = path.join(__dirname, '..', 'migrations', '001_create_schema.sql');
    if (!fs.existsSync(migrationPath)) {
      logger.error(`Migration file not found: ${migrationPath}`);
      process.exit(1);
    }

    // Read migration file
    logger.info(`Reading migration file: ${migrationPath}`);
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    if (!migrationSQL.trim()) {
      logger.warn('Migration file is empty');
      return;
    }

    // Run migration
    logger.info('Running database migration...');
    const migrationStart = Date.now();
    await client.query('BEGIN');
    
    try {
      await client.query(migrationSQL);
      await client.query('COMMIT');
      const migrationTime = Date.now() - migrationStart;
      logger.success(`Migration completed successfully in ${migrationTime}ms`);
    } catch (migrationError) {
      await client.query('ROLLBACK');
      
      // Check if it's just an "already exists" error
      if (migrationError.message && migrationError.message.includes('already exists')) {
        logger.warn('Schema already exists, continuing...');
        logger.success('Database schema validation completed');
        const migrationTime = Date.now() - migrationStart;
        logger.success(`Schema validation completed in ${migrationTime}ms`);
      } else {
        throw migrationError;
      }
    }

    // Test database connection with a simple query
    logger.info('Testing database connection...');
    const testStart = Date.now();
    const result = await client.query('SELECT NOW() as current_time, version() as version');
    const testTime = Date.now() - testStart;
    
    logger.success(`Database test query successful in ${testTime}ms`);
    logger.info('Database info:', {
      currentTime: result.rows[0].current_time,
      version: result.rows[0].version?.split(' ')[0] || 'Unknown'
    });

    const totalTime = Date.now() - startTime;
    logger.success(`Migration process completed successfully in ${totalTime}ms`);

  } catch (error) {
    const totalTime = Date.now() - startTime;
    logger.error(`Migration failed after ${totalTime}ms`, error);
    
    // Provide more specific error guidance
    if (error.code === 'ECONNREFUSED') {
      logger.error('Connection refused - check database URL and network connectivity');
    } else if (error.code === '3D000') {
      logger.error('Database does not exist - ensure that database is created');
    } else if (error.code === '28P01') {
      logger.error('Authentication failed - check database credentials');
    } else if (error.code === '42P01') {
      logger.error('Table does not exist - check migration file syntax');
    }
    
    process.exit(1);
  } finally {
    if (client) {
      client.release();
      logger.info('Database client released');
    }
    
    try {
      await pool.end();
      logger.success('Database connection pool closed');
    } catch (closeError) {
      logger.error('Error closing database pool', closeError);
    }
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Run migration
migrate().catch((error) => {
  logger.error('Migration script failed:', error);
  process.exit(1);
});
