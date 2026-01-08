require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

async function migrate() {
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
    console.log('Connecting to Neon PostgreSQL...');
    client = await pool.connect();

    // Read migration file
    const migrationPath = path.join(__dirname, '..', 'migrations', '001_create_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('Running migration...');
    await client.query(migrationSQL);
    console.log('✅ Migration completed successfully');

    // Test query
    console.log('Testing database connection...');
    const result = await client.query('SELECT NOW()');
    console.log('✅ Database query successful:', result.rows[0]);

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (client) client.release();
    await pool.end();
    console.log('Database connection closed');
  }
}

migrate();
