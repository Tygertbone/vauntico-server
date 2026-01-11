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
  warn: (message, ...args) => console.warn(`⚠️  [WARN] ${message}`, ...args),
  section: (title) => console.log(`\n🔍 ${title}`),
  divider: () => console.log('='.repeat(60))
};

// Validation results tracker
const validationResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  details: []
};

function addResult(test, status, message, details = null) {
  const result = { test, status, message, details };
  validationResults.details.push(result);
  
  switch (status) {
    case 'PASS':
      validationResults.passed++;
      logger.success(`✓ ${test}: ${message}`);
      if (details) logger.info(`   Details: ${details}`);
      break;
    case 'FAIL':
      validationResults.failed++;
      logger.error(`✗ ${test}: ${message}`);
      if (details) logger.error(`   Details: ${details}`);
      break;
    case 'WARN':
      validationResults.warnings++;
      logger.warn(`⚠ ${test}: ${message}`);
      if (details) logger.info(`   Details: ${details}`);
      break;
  }
}

async function validateEnvironment() {
  logger.section('ENVIRONMENT VALIDATION');
  
  // Check required environment variables
  const requiredVars = ['DATABASE_URL'];
  const optionalVars = ['NODE_ENV', 'LOG_LEVEL'];
  
  for (const varName of requiredVars) {
    if (process.env[varName]) {
      addResult(
        `Environment Variable: ${varName}`,
        'PASS',
        'Variable is set',
        varName === 'DATABASE_URL' ? '***REDACTED***' : process.env[varName]
      );
    } else {
      addResult(
        `Environment Variable: ${varName}`,
        'FAIL',
        'Required variable is missing'
      );
    }
  }
  
  for (const varName of optionalVars) {
    if (process.env[varName]) {
      addResult(
        `Environment Variable: ${varName}`,
        'PASS',
        'Optional variable is set',
        process.env[varName]
      );
    } else {
      addResult(
        `Environment Variable: ${varName}`,
        'WARN',
        'Optional variable is not set'
      );
    }
  }
  
  // Check Node.js version
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  if (majorVersion >= 18) {
    addResult(
      'Node.js Version',
      'PASS',
      `Node.js ${nodeVersion} meets requirements (>=18.0.0)`
    );
  } else {
    addResult(
      'Node.js Version',
      'FAIL',
      `Node.js ${nodeVersion} is below minimum requirement (>=18.0.0)`
    );
  }
}

async function validateDatabaseConnection() {
  logger.section('DATABASE CONNECTION VALIDATION');
  
  if (!process.env.DATABASE_URL) {
    addResult(
      'Database Connection',
      'FAIL',
      'Cannot test connection - DATABASE_URL not set'
    );
    return null;
  }
  
  const dbConfig = {
    connectionString: process.env.DATABASE_URL,
    max: 5,
    min: 1,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    ssl: { rejectUnauthorized: false }
  };
  
  const pool = new Pool(dbConfig);
  let client;
  
  try {
    const connectStart = Date.now();
    client = await pool.connect();
    const connectTime = Date.now() - connectStart;
    
    addResult(
      'Database Connection',
      'PASS',
      `Successfully connected in ${connectTime}ms`
    );
    
    // Test basic query
    const queryStart = Date.now();
    const result = await client.query('SELECT NOW() as current_time, version() as version');
    const queryTime = Date.now() - queryStart;
    
    addResult(
      'Database Query Test',
      'PASS',
      `Basic query executed successfully in ${queryTime}ms`,
      `Server time: ${result.rows[0].current_time}`
    );
    
    // Get database info
    const dbInfo = await client.query(`
      SELECT 
        current_database() as database,
        current_user as user,
        version() as version
    `);
    
    const info = dbInfo.rows[0];
    addResult(
      'Database Information',
      'PASS',
      'Retrieved database metadata',
      `DB: ${info.database}, User: ${info.user}, Version: ${info.version?.split(' ')[0]}`
    );
    
    return client;
    
  } catch (error) {
    const errorMessage = error.message;
    let guidance = '';
    
    switch (error.code) {
      case 'ECONNREFUSED':
        guidance = 'Check database URL and network connectivity';
        break;
      case '3D000':
        guidance = 'Database does not exist - ensure the database is created';
        break;
      case '28P01':
        guidance = 'Authentication failed - check database credentials';
        break;
      default:
        guidance = 'Check database configuration and connectivity';
    }
    
    addResult(
      'Database Connection',
      'FAIL',
      errorMessage,
      guidance
    );
    return null;
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

async function validateDatabaseSchema(client) {
  logger.section('DATABASE SCHEMA VALIDATION');
  
  if (!client) {
    addResult(
      'Schema Validation',
      'FAIL',
      'Cannot validate schema - no database connection'
    );
    return;
  }
  
  try {
    // Check if key tables exist
    const expectedTables = [
      'users',
      'trust_scores',
      'api_usage',
      'subscriptions',
      'security_events'
    ];
    
    for (const tableName of expectedTables) {
      try {
        const result = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          );
        `, [tableName]);
        
        if (result.rows[0].exists) {
          addResult(
            `Table: ${tableName}`,
            'PASS',
            'Table exists'
          );
          
          // Get row count for existing tables
          const countResult = await client.query(`SELECT COUNT(*) as count FROM ${tableName}`);
          const rowCount = parseInt(countResult.rows[0].count);
          addResult(
            `Table: ${tableName} Records`,
            'PASS',
            `Table contains ${rowCount} records`
          );
        } else {
          addResult(
            `Table: ${tableName}`,
            'WARN',
            'Table does not exist - may need to run migration'
          );
        }
      } catch (tableError) {
        addResult(
          `Table: ${tableName}`,
          'FAIL',
          `Error checking table: ${tableError.message}`
        );
      }
    }
    
    // Check database size
    try {
      const sizeResult = await client.query(`
        SELECT pg_size_pretty(pg_database_size(current_database())) as size
      `);
      const dbSize = sizeResult.rows[0].size;
      addResult(
        'Database Size',
        'PASS',
        `Current database size: ${dbSize}`
      );
    } catch (sizeError) {
      addResult(
        'Database Size',
        'WARN',
        `Could not retrieve database size: ${sizeError.message}`
      );
    }
    
  } catch (error) {
    addResult(
      'Schema Validation',
      'FAIL',
      `Schema validation failed: ${error.message}`
    );
  }
}

async function validateMigrationFiles() {
  logger.section('MIGRATION FILES VALIDATION');
  
  const migrationsDir = path.join(__dirname, '..', 'migrations');
  
  try {
    if (!fs.existsSync(migrationsDir)) {
      addResult(
        'Migrations Directory',
        'FAIL',
        `Migrations directory not found: ${migrationsDir}`
      );
      return;
    }
    
    addResult(
      'Migrations Directory',
      'PASS',
      `Migrations directory exists: ${migrationsDir}`
    );
    
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    if (migrationFiles.length === 0) {
      addResult(
        'Migration Files',
        'WARN',
        'No SQL migration files found'
      );
      return;
    }
    
    addResult(
      'Migration Files',
      'PASS',
      `Found ${migrationFiles.length} migration file(s)`,
      migrationFiles.join(', ')
    );
    
    // Validate each migration file
    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.size === 0) {
        addResult(
          `Migration File: ${file}`,
          'WARN',
          'Migration file is empty'
        );
      } else {
        addResult(
          `Migration File: ${file}`,
          'PASS',
          `Migration file is valid (${stats.size} bytes)`
        );
      }
    }
    
  } catch (error) {
    addResult(
      'Migration Files Validation',
      'FAIL',
      `Error validating migration files: ${error.message}`
    );
  }
}

function printSummary() {
  logger.divider();
  logger.section('VALIDATION SUMMARY');
  
  const total = validationResults.passed + validationResults.failed + validationResults.warnings;
  const successRate = total > 0 ? Math.round((validationResults.passed / total) * 100) : 0;
  
  console.log(`\n📊 VALIDATION RESULTS:`);
  console.log(`   ✅ Passed: ${validationResults.passed}`);
  console.log(`   ❌ Failed: ${validationResults.failed}`);
  console.log(`   ⚠️  Warnings: ${validationResults.warnings}`);
  console.log(`   📈 Success Rate: ${successRate}%`);
  
  if (validationResults.failed === 0) {
    console.log(`\n🎉 ALL CRITICAL CHECKS PASSED!`);
    if (validationResults.warnings === 0) {
      console.log(`🏆 PERFECT: No warnings detected`);
    } else {
      console.log(`⚠️  ${validationResults.warnings} warning(s) - review recommended`);
    }
  } else {
    console.log(`\n❌ VALIDATION FAILED: ${validationResults.failed} critical issue(s) found`);
    console.log(`🔧 Please address the failed checks before proceeding`);
  }
  
  logger.divider();
  
  // Return appropriate exit code
  return validationResults.failed === 0 ? 0 : 1;
}

async function validate() {
  const startTime = Date.now();
  
  console.log('🔍 VAUNTICO DATABASE VALIDATION');
  console.log(`Started at: ${new Date().toISOString()}`);
  logger.divider();
  
  try {
    // Run all validation checks
    await validateEnvironment();
    const client = await validateDatabaseConnection();
    await validateDatabaseSchema(client);
    await validateMigrationFiles();
    
    const totalTime = Date.now() - startTime;
    logger.info(`Validation completed in ${totalTime}ms`);
    
    const exitCode = printSummary();
    process.exit(exitCode);
    
  } catch (error) {
    logger.error('Validation script failed unexpectedly:', error);
    process.exit(1);
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

// Run validation
validate().catch((error) => {
  logger.error('Validation script failed:', error);
  process.exit(1);
});
