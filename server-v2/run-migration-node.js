import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file in server-v2 directory
import dotenv from "dotenv";
dotenv.config({ path: path.join(__dirname, ".env") });

// Import pg
import { Client } from "pg";

async function runMigration() {
  console.log("🚀 Starting Vauntico Emergency Revenue Database Migration...");

  // Check if DATABASE_URL is available
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("❌ DATABASE_URL not found in environment variables");
    process.exit(1);
  }

  console.log(
    "✅ DATABASE_URL found:",
    databaseUrl.replace(/\/\/[^:]+:[^@]+@/, "//***:***@")
  );

  // Check if migration file exists
  const migrationPath = path.join(
    __dirname,
    "migrations",
    "019_create_emergency_revenue_tables_simple.sql"
  );
  if (!fs.existsSync(migrationPath)) {
    console.error("❌ Migration file not found:", migrationPath);
    process.exit(1);
  }

  console.log("✅ Migration file found:", migrationPath);

  // Read migration SQL
  const migrationSQL = fs.readFileSync(migrationPath, "utf8");
  console.log(
    "📋 Migration SQL loaded, length:",
    migrationSQL.length,
    "characters"
  );

  // Create PostgreSQL client
  const client = new Client({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: true,
    },
  });

  try {
    // Connect to database
    console.log("🔄 Connecting to database...");
    await client.connect();
    console.log("✅ Connected to database");

    // Run migration
    console.log("🔄 Running migration...");
    const result = await client.query(migrationSQL);
    console.log("✅ Migration completed successfully!");

    if (result.rows && result.rows.length > 0) {
      console.log("📊 Migration result:", result.rows);
    }

    // Verify tables were created
    console.log("🔍 Verifying tables were created...");
    const verificationQuery = `
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('creator_payment_requests', 'creator_verifications', 'content_recovery_cases')
            ORDER BY table_name;
        `;

    const verifyResult = await client.query(verificationQuery);
    console.log(
      "✅ Tables found:",
      verifyResult.rows.map((row) => row.table_name)
    );

    if (verifyResult.rows.length !== 3) {
      console.error(`❌ Expected 3 tables, found ${verifyResult.rows.length}`);
      process.exit(1);
    }

    // Check row counts
    console.log("📊 Checking row counts...");
    const rowCountQuery = `
            SELECT 
                'creator_payment_requests' as table_name,
                COUNT(*) as row_count
            FROM creator_payment_requests
            UNION ALL
            SELECT 
                'creator_verifications' as table_name,
                COUNT(*) as row_count
            FROM creator_verifications
            UNION ALL
            SELECT 
                'content_recovery_cases' as table_name,
                COUNT(*) as row_count
            FROM content_recovery_cases;
        `;

    const rowCountResult = await client.query(rowCountQuery);
    console.log("📊 Row counts:");
    rowCountResult.rows.forEach((row) => {
      console.log(`   ${row.table_name}: ${row.row_count} rows`);
    });

    console.log("🎉 Migration and verification completed successfully!");
    console.log("");
    console.log("📋 Summary:");
    console.log("   - 3 emergency revenue tables created");
    console.log("   - Database: Neon PostgreSQL");
    console.log(
      "   - Tables: creator_payment_requests, creator_verifications, content_recovery_cases"
    );
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    if (error.detail) {
      console.error("Details:", error.detail);
    }
    process.exit(1);
  } finally {
    // Close connection
    await client.end();
    console.log("🔌 Database connection closed");
  }
}

// Run migration
runMigration().catch((error) => {
  console.error("❌ Unexpected error:", error);
  process.exit(1);
});
