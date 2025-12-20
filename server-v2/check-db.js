require('dotenv').config();
const { Pool } = require('pg');

async function checkDatabase() {
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
    console.log('Connecting to database...');
    client = await pool.connect();

    // Check what tables exist
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('Existing tables:', result.rows.map(r => r.table_name));

    if (result.rows.length === 0) {
      console.log('✅ Database is empty, ready for migrations');
    } else {
      console.log('⚠️  Database has existing tables. Some may need to be dropped first');
    }

  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

checkDatabase();
