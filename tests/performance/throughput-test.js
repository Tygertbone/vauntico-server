const axios = require("axios");
const { performance } = require("perf_hooks");

/**
 * API Throughput Test
 * Tests concurrent API request performance under load
 */

class ThroughputTester {
  constructor(
    baseUrl = "http://localhost:3001",
    concurrency = 10,
    duration = 30000
  ) {
    this.baseUrl = baseUrl;
    this.concurrency = concurrency;
    this.duration = duration;
    this.results = [];
  }

  async testEndpoint(endpoint, method = "GET", data = null) {
    const promises = [];
    const startTime = performance.now();

    for (let i = 0; i < this.concurrency; i++) {
      const promise = this.makeRequest(endpoint, method, data);
      promises.push(promise);
    }

    try {
      await Promise.all(promises);
      const endTime = performance.now();
      const totalTime = endTime - startTime;

      return {
        endpoint,
        method,
        concurrency: this.concurrency,
        totalTime,
        averageTime: totalTime / this.concurrency,
        success: true,
        requestsPerSecond: (this.concurrency / totalTime) * 1000,
      };
    } catch (error) {
      const endTime = performance.now();
      const totalTime = endTime - startTime;

      return {
        endpoint,
        method,
        concurrency: this.concurrency,
        totalTime,
        averageTime: totalTime / this.concurrency,
        success: false,
        error: error.message,
        requestsPerSecond: 0,
      };
    }
  }

  async makeRequest(endpoint, method, data) {
    try {
      const config = {
        method,
        url: `${this.baseUrl}${endpoint}`,
        timeout: 5000,
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Vauntico-LoadTest/1.0",
        },
      };

      if (data && method !== "GET") {
        config.data = data;
      }

      const response = await axios(config);

      return {
        status: response.status,
        responseTime: response.headers["x-response-time"] || "unknown",
        dataSize: JSON.stringify(response.data).length,
      };
    } catch (error) {
      throw error;
    }
  }

  async runThroughputTest() {
    console.log("🚀 Starting API throughput test...");
    console.log(
      `📊 Concurrency: ${this.concurrency}, Duration: ${this.duration}ms`
    );

    const endpoints = [
      "/api/v1/widget/health",
      "/api/v1/kpi/phase1",
      "/api/v1/kpi/blind-spots",
      "/api/v1/widget/analytics",
    ];

    const testPromises = endpoints.map((endpoint) =>
      this.testEndpoint(endpoint)
    );

    try {
      const results = await Promise.all(testPromises);
      this.results = results;

      // Calculate overall statistics
      const successfulTests = results.filter((r) => r.success);
      const failedTests = results.filter((r) => !r.success);

      const totalRequests = this.concurrency * endpoints.length;
      const totalAverageTime =
        results.reduce((sum, r) => sum + r.averageTime, 0) / results.length;
      const overallRequestsPerSecond =
        successfulTests.reduce((sum, r) => sum + r.requestsPerSecond, 0) /
        successfulTests.length;

      console.log("\n📈 Throughput Test Results:");
      console.log(
        `✅ Successful tests: ${successfulTests.length}/${results.length}`
      );
      console.log(`❌ Failed tests: ${failedTests.length}/${results.length}`);
      console.log(
        `📊 Overall average response time: ${totalAverageTime.toFixed(2)}ms`
      );
      console.log(
        `🚀 Overall requests per second: ${overallRequestsPerSecond.toFixed(2)}`
      );

      if (failedTests.length > 0) {
        console.log("\n❌ Failed Tests:");
        failedTests.forEach((test) => {
          console.log(`  ${test.endpoint}: ${test.error}`);
        });
      }

      return {
        success: true,
        summary: {
          totalEndpoints: endpoints.length,
          concurrency: this.concurrency,
          successfulTests: successfulTests.length,
          failedTests: failedTests.length,
          totalAverageTime: totalAverageTime,
          overallRequestsPerSecond,
        },
        results,
      };
    } catch (error) {
      console.error("❌ Throughput test failed:", error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  const tester = new ThroughputTester();
  tester.runThroughputTest().then((result) => {
    if (result.success) {
      console.log("\n🎉 Throughput test completed successfully!");
      process.exit(0);
    } else {
      console.error("\n💥 Throughput test failed:", result.error);
      process.exit(1);
    }
  });
}

module.exports = ThroughputTester;
