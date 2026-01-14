const axios = require('axios');

/**
 * Widget Load Test
 * Tests widget performance under simulated user load
 */

class WidgetLoadTester {
  constructor(baseUrl = 'http://localhost:3001', concurrentUsers = 50, duration = 60000) {
    this.baseUrl = baseUrl;
    this.concurrentUsers = concurrentUsers;
    this.duration = duration;
    this.results = [];
  }

  async simulateUserLoad(userId) {
    const startTime = Date.now();
    const requests = [];
    
    // Simulate typical user interactions over time
    for (let second = 0; second < this.duration / 1000; second++) {
      // Widget load
      try {
        const loadStart = Date.now();
        const loadResponse = await axios.get(`${this.baseUrl}/api/v1/widget/load`, {
          params: { userId, timestamp: Date.now() },
          timeout: 5000
        });
        requests.push({
          type: 'widget_load',
          responseTime: Date.now() - loadStart,
          status: loadResponse.status,
          success: loadResponse.status === 200
        });
      } catch (error) {
        requests.push({
          type: 'widget_load',
          responseTime: 5000, // timeout
          status: 0,
          success: false,
          error: error.message
        });
      }
      
      // Widget refresh
      if (second % 5 === 0) { // Refresh every 5 seconds
        try {
          const refreshStart = Date.now();
          const refreshResponse = await axios.post(`${this.baseUrl}/api/v1/widget/refresh`, {
            userId,
            timestamp: Date.now()
          }, {
            timeout: 3000
          });
          requests.push({
            type: 'widget_refresh',
            responseTime: Date.now() - refreshStart,
            status: refreshResponse.status,
            success: refreshResponse.status === 200
          });
        } catch (error) {
          requests.push({
            type: 'widget_refresh',
            responseTime: 3000, // timeout
            status: 0,
            success: false,
            error: error.message
          });
        }
      }
      
      // Widget interaction
      if (second % 3 === 0) { // Interaction every 3 seconds
        try {
          const interactionStart = Date.now();
          const interactionResponse = await axios.post(`${this.baseUrl}/api/v1/widget/interaction`, {
            userId,
            action: 'click',
            timestamp: Date.now()
          }, {
            timeout: 1000
          });
          requests.push({
            type: 'widget_interaction',
            responseTime: Date.now() - interactionStart,
            status: interactionResponse.status,
            success: interactionResponse.status === 200
          });
        } catch (error) {
          requests.push({
            type: 'widget_interaction',
            responseTime: 1000,
            status: 0,
            success: false,
            error: error.message
          });
        }
      }
      
      // Brief pause to simulate realistic usage
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const totalTime = Date.now() - startTime;
    const successfulRequests = requests.filter(r => r.success).length;
    const averageResponseTime = requests.reduce((sum, r) => sum + r.responseTime, 0) / requests.length;
    
    return {
      userId,
      totalTime,
      totalRequests: requests.length,
      successfulRequests,
      averageResponseTime,
      requests
    };
  }

  async runLoadTest() {
    console.log('🚀 Starting widget load test...');
    console.log(`📊 Concurrent users: ${this.concurrentUsers}, Duration: ${this.duration}ms`);
    
    const userPromises = [];
    for (let i = 0; i < this.concurrentUsers; i++) {
      userPromises.push(this.simulateUserLoad(`user_${i}`));
    }
    
    try {
      const userResults = await Promise.all(userPromises);
      this.results = userResults;
      
      // Calculate overall statistics
      const totalRequests = userResults.reduce((sum, user) => sum + user.totalRequests, 0);
      const totalSuccessful = userResults.reduce((sum, user) => sum + user.successfulRequests, 0);
      const totalAverageTime = userResults.reduce((sum, user) => sum + user.averageResponseTime, 0) / userResults.length;
      const requestsPerSecond = totalRequests / (this.duration / 1000);
      
      console.log('\n📈 Widget Load Test Results:');
      console.log(`📊 Total requests: ${totalRequests}`);
      console.log(`✅ Successful requests: ${totalSuccessful}`);
      console.log(`📊 Average response time: ${totalAverageTime.toFixed(2)}ms`);
      console.log(`🚀 Requests per second: ${requestsPerSecond.toFixed(2)}`);
      
      // Performance assessment
      if (totalAverageTime < 500) {
        console.log('✅ Widget performance: EXCELLENT');
      } else if (totalAverageTime < 1000) {
        console.log('✅ Widget performance: GOOD');
      } else {
        console.log('⚠️ Widget performance: NEEDS OPTIMIZATION');
      }
      
      return {
        success: true,
        summary: {
          concurrentUsers: this.concurrentUsers,
          duration: this.duration,
          totalRequests,
          totalSuccessful,
          totalAverageTime,
          requestsPerSecond,
          performanceRating: totalAverageTime < 500 ? 'excellent' : totalAverageTime < 1000 ? 'good' : 'needs_optimization'
        },
        userResults
      };
      
    } catch (error) {
      console.error('❌ Widget load test failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  const tester = new WidgetLoadTester();
  tester.runLoadTest()
    .then(result => {
      if (result.success) {
        console.log('\n🎉 Widget load test completed successfully!');
        process.exit(0);
      } else {
        console.error('\n💥 Widget load test failed:', result.error);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n💥 Widget load test failed:', error.message);
      process.exit(1);
    });
  });
}

module.exports = WidgetLoadTester;
