import { execSync } from "child_process";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  try {
    console.log("🔄 Running database migrations...");

    // Set database URL from environment or use default
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error("DATABASE_URL environment variable is not set");
    }

    console.log(
      `📊 Database URL configured: ${databaseUrl.replace(/\/\/.*@/, "//***:***@")}`,
    );

    // Run migrations using the migration scripts
    const migrationsPath = path.join(__dirname, "migrations");
    console.log(`📁 Migration path: ${migrationsPath}`);

    // Check if migrations directory exists
    try {
      await execSync(`test -d "${migrationsPath}"`, { stdio: "inherit" });
    } catch (error) {
      console.log("ℹ️ No migrations directory found, skipping migrations");
      return;
    }

    // Run migrations with node directly
    console.log("🚀 Executing migration files...");
    execSync(
      `node -e "
      const fs = require('fs');
      const path = require('path');
      const { Pool } = require('pg');
      
      async function runMigrations() {
        const pool = new Pool({
          connectionString: process.env.DATABASE_URL,
          ssl: { rejectUnauthorized: false }
        });
        
        const migrationsDir = '${migrationsPath}';
        const files = fs.readdirSync(migrationsDir)
          .filter(f => f.endsWith('.sql'))
          .sort();
        
        console.log('Found migration files:', files);
        
        for (const file of files) {
          console.log(\`Running migration: \${file}\`);
          const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
          await pool.query(sql);
          console.log(\`✅ Completed: \${file}\`);
        }
        
        await pool.end();
        console.log('🎉 All migrations completed successfully');
      }
      
      runMigrations().catch(console.error);
    "`,
      {
        stdio: "inherit",
        env: { ...process.env, DATABASE_URL: databaseUrl },
      },
    );

    console.log("✅ Database migrations completed successfully");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  }
}

runMigrations();
