require('dotenv').config();
const { Pool } = require('pg');

async function testConnection() {
  const dbConfig = {
    connectionString: process.env.DATABASE_URL,
    max: 10,
    min: 1,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 60000,
    ssl: { rejectUnauthorized: false }
  };

  const pool = new Pool(dbConfig);

  try {
    console.log('Testing database connection...');
    const result = await pool.query('SELECT 1 as test');
    console.log('✅ Database connection successful');
    console.log('Result:', result.rows[0]);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await pool.end();
  }
}

testConnection();
