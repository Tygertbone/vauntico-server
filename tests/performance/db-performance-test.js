const { performance } = require("perf_hooks");

/**
 * Database Performance Test
 * Tests database connection pool performance under load
 */

class DBPerformanceTester {
  constructor(poolSize = 10, duration = 30000) {
    this.poolSize = poolSize;
    this.duration = duration;
    this.results = [];
  }

  async testDBConnections() {
    console.log("🔍 Testing database connection pool performance...");
    const startTime = performance.now();

    try {
      const { Pool } = require("pg");
      const pool = new Pool({
        host: process.env.DB_HOST || "localhost",
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || "vauntico",
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "password",
        min: 2,
        max: this.poolSize,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      });

      // Test concurrent connections
      const connectionPromises = [];
      for (let i = 0; i < this.poolSize; i++) {
        connectionPromises.push(pool.connect());
      }

      const connections = await Promise.all(connectionPromises);
      const connectionTime = performance.now() - startTime;

      // Test query performance
      const queryPromises = connections.map((conn) =>
        conn.query("SELECT COUNT(*) FROM users")
      );

      const queryResults = await Promise.all(queryPromises);
      const queryTime = performance.now() - connectionTime;

      // Close all connections
      await Promise.all(connections.map((conn) => conn.end()));

      const totalTime = performance.now() - startTime;

      return {
        poolSize: this.poolSize,
        connectionTime: connectionTime.toFixed(2),
        queryTime: queryTime.toFixed(2),
        totalTime: totalTime.toFixed(2),
        success: true,
        averageQueryTime: queryTime / this.poolSize,
      };
    } catch (error) {
      return {
        poolSize: this.poolSize,
        success: false,
        error: error.message,
      };
    }
  }

  async runDBPerformanceTest() {
    console.log(
      `🔍 Starting DB performance test with pool size: ${this.poolSize}`
    );

    const result = await this.testDBConnections();

    if (result.success) {
      console.log("✅ DB performance test completed successfully");
      console.log(`📊 Connection pool time: ${result.connectionTime}ms`);
      console.log(`📊 Average query time: ${result.averageQueryTime}ms`);
      console.log(`📊 Total test time: ${result.totalTime}ms`);
    } else {
      console.log("❌ DB performance test failed");
      console.log(`💥 Error: ${result.error}`);
    }

    return result;
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  const tester = new DBPerformanceTester();
  tester
    .runDBPerformanceTest()
    .then((result) => {
      if (result.success) {
        console.log("🎉 DB performance test completed successfully!");
        process.exit(0);
      } else {
        console.log("💥 DB performance test failed");
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error("💥 DB performance test failed:", error.message);
      process.exit(1);
    });
}

module.exports = DBPerformanceTester;
