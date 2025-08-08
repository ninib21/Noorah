#!/usr/bin/env node

/**
 * ULTIMATE STRESS TEST SUITE
 * The most powerful stress testing for the TOP-RATED babysitting app
 * Tests THOUSANDS of concurrent users with MASSIVE load
 */

const http = require('http');
const { performance } = require('perf_hooks');
const fs = require('fs');
const crypto = require('crypto');

class UltimateStressTest {
  constructor() {
    this.config = {
      backend: {
        baseUrl: 'http://localhost:3001/api/v1',
        timeout: 30000
      },
      stressLevels: {
        LIGHT: { users: 100, requestsPerUser: 10, duration: 30 },
        MEDIUM: { users: 500, requestsPerUser: 20, duration: 60 },
        HEAVY: { users: 1000, requestsPerUser: 30, duration: 120 },
        EXTREME: { users: 2000, requestsPerUser: 50, duration: 180 },
        ULTIMATE: { users: 5000, requestsPerUser: 100, duration: 300 }
      }
    };

    this.results = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      blockedRequests: 0,
      avgResponseTime: 0,
      minResponseTime: Infinity,
      maxResponseTime: 0,
      p95ResponseTime: 0,
      p99ResponseTime: 0,
      requestsPerSecond: 0,
      concurrentUsers: 0,
      stressTestResults: [],
      performanceBreakdown: {},
      securityEffectiveness: 0
    };

    this.responseTimes = [];
    this.endpoints = [
      { path: '/health', method: 'GET', weight: 30 },
      { path: '/auth/login', method: 'POST', weight: 10, body: { email: 'test@test.com', password: 'ValidPassword123!' } },
      { path: '/sitters/search', method: 'GET', weight: 25 },
      { path: '/bookings', method: 'GET', weight: 20 },
      { path: '/users/profile', method: 'GET', weight: 10 },
      { path: '/payments/create-intent', method: 'POST', weight: 5, body: { amount: 6000 } }
    ];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '📋',
      success: '✅',
      error: '❌',
      warning: '⚠️',
      stress: '🚀',
      ultimate: '💥',
      performance: '⚡',
      diamond: '💎'
    }[type] || '📋';
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const startTime = performance.now();
      
      const req = http.request(url, {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': options.userAgent || `UltimateStressTest-User${Math.floor(Math.random() * 10000)}/1.0`,
          'X-Forwarded-For': options.spoofedIP || `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
          ...options.headers
        },
        timeout: this.config.backend.timeout
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const endTime = performance.now();
          const responseTime = endTime - startTime;
          
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data,
            responseTime: responseTime,
            success: res.statusCode >= 200 && res.statusCode < 300,
            blocked: res.statusCode === 403 || res.statusCode === 429,
            error: res.statusCode >= 400
          });
        });
      });

      req.on('error', (error) => {
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        reject({
          error: error.message,
          responseTime: responseTime,
          success: false,
          blocked: error.code === 'ECONNRESET' || error.code === 'ECONNREFUSED'
        });
      });

      req.on('timeout', () => {
        req.destroy();
        reject({
          error: 'Request timeout',
          responseTime: this.config.backend.timeout,
          success: false,
          blocked: false
        });
      });

      if (options.body) {
        req.write(JSON.stringify(options.body));
      }

      req.end();
    });
  }

  selectRandomEndpoint() {
    const totalWeight = this.endpoints.reduce((sum, ep) => sum + ep.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const endpoint of this.endpoints) {
      random -= endpoint.weight;
      if (random <= 0) {
        return endpoint;
      }
    }
    
    return this.endpoints[0]; // Fallback
  }

  async simulateUser(userId, requestCount, testDuration) {
    const userResults = {
      userId: userId,
      requests: 0,
      successful: 0,
      failed: 0,
      blocked: 0,
      avgResponseTime: 0,
      errors: []
    };

    const startTime = performance.now();
    const endTime = startTime + (testDuration * 1000);
    
    while (performance.now() < endTime && userResults.requests < requestCount) {
      try {
        const endpoint = this.selectRandomEndpoint();
        const url = `${this.config.backend.baseUrl}${endpoint.path}`;
        
        const result = await this.makeRequest(url, {
          method: endpoint.method,
          body: endpoint.body,
          userAgent: `StressTestUser${userId}/1.0`
        });

        userResults.requests++;
        this.results.totalRequests++;
        
        if (result.success) {
          userResults.successful++;
          this.results.successfulRequests++;
        } else if (result.blocked) {
          userResults.blocked++;
          this.results.blockedRequests++;
        } else {
          userResults.failed++;
          this.results.failedRequests++;
        }

        // Track response times
        this.responseTimes.push(result.responseTime);
        this.updatePerformanceMetrics(result.responseTime);

      } catch (error) {
        userResults.requests++;
        this.results.totalRequests++;
        
        if (error.blocked) {
          userResults.blocked++;
          this.results.blockedRequests++;
        } else {
          userResults.failed++;
          this.results.failedRequests++;
          userResults.errors.push(error.error || 'Unknown error');
        }

        if (error.responseTime) {
          this.responseTimes.push(error.responseTime);
          this.updatePerformanceMetrics(error.responseTime);
        }
      }

      // Random delay between requests (0-100ms) to simulate real user behavior
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
    }

    userResults.avgResponseTime = userResults.requests > 0 
      ? this.responseTimes.slice(-userResults.requests).reduce((sum, time) => sum + time, 0) / userResults.requests 
      : 0;

    return userResults;
  }

  updatePerformanceMetrics(responseTime) {
    this.results.minResponseTime = Math.min(this.results.minResponseTime, responseTime);
    this.results.maxResponseTime = Math.max(this.results.maxResponseTime, responseTime);
    
    // Calculate running average
    const totalRequests = this.results.totalRequests;
    this.results.avgResponseTime = (this.results.avgResponseTime * (totalRequests - 1) + responseTime) / totalRequests;
  }

  calculatePercentiles() {
    if (this.responseTimes.length === 0) return;

    const sorted = this.responseTimes.sort((a, b) => a - b);
    const p95Index = Math.floor(sorted.length * 0.95);
    const p99Index = Math.floor(sorted.length * 0.99);

    this.results.p95ResponseTime = sorted[p95Index] || 0;
    this.results.p99ResponseTime = sorted[p99Index] || 0;
  }

  async runStressTest(level, config) {
    this.log(`💥 LAUNCHING ${level} STRESS TEST: ${config.users} users, ${config.requestsPerUser} requests each, ${config.duration}s duration`, 'ultimate');
    
    const startTime = performance.now();
    const promises = [];
    
    // Launch concurrent users
    for (let userId = 1; userId <= config.users; userId++) {
      const promise = this.simulateUser(userId, config.requestsPerUser, config.duration);
      promises.push(promise);
      
      // Stagger user launches to simulate realistic ramp-up
      if (userId % 50 === 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Wait for all users to complete
    const userResults = await Promise.allSettled(promises);
    const endTime = performance.now();
    const actualDuration = (endTime - startTime) / 1000;

    // Calculate test results
    const successfulUsers = userResults.filter(r => r.status === 'fulfilled').length;
    const failedUsers = userResults.length - successfulUsers;
    
    const testResult = {
      level: level,
      config: config,
      actualDuration: actualDuration,
      totalUsers: config.users,
      successfulUsers: successfulUsers,
      failedUsers: failedUsers,
      totalRequests: this.results.totalRequests,
      successfulRequests: this.results.successfulRequests,
      failedRequests: this.results.failedRequests,
      blockedRequests: this.results.blockedRequests,
      requestsPerSecond: this.results.totalRequests / actualDuration,
      avgResponseTime: this.results.avgResponseTime,
      successRate: (this.results.successfulRequests / this.results.totalRequests) * 100,
      blockRate: (this.results.blockedRequests / this.results.totalRequests) * 100
    };

    this.results.stressTestResults.push(testResult);
    
    this.log(`${level} Test Results: ${successfulUsers}/${config.users} users successful, ${testResult.requestsPerSecond.toFixed(2)} req/s, ${testResult.avgResponseTime.toFixed(2)}ms avg`, 
             successfulUsers >= config.users * 0.9 ? 'success' : 'warning');

    return testResult;
  }

  calculateSecurityEffectiveness() {
    const totalRequests = this.results.totalRequests;
    const blockedRequests = this.results.blockedRequests;
    
    if (totalRequests === 0) {
      this.results.securityEffectiveness = 0;
      return;
    }

    // Security effectiveness based on how well the system handles load while maintaining security
    const blockRate = (blockedRequests / totalRequests) * 100;
    const successRate = (this.results.successfulRequests / totalRequests) * 100;
    
    // Ideal: High success rate for legitimate requests, appropriate blocking of excessive requests
    if (successRate >= 80 && blockRate >= 10 && blockRate <= 30) {
      this.results.securityEffectiveness = 100; // Perfect balance
    } else if (successRate >= 60 && blockRate >= 5) {
      this.results.securityEffectiveness = 85; // Good balance
    } else if (successRate >= 40) {
      this.results.securityEffectiveness = 70; // Acceptable
    } else {
      this.results.securityEffectiveness = Math.max(0, successRate);
    }
  }

  printUltimateReport() {
    console.log('\n' + '💥'.repeat(80));
    console.log('💥 ULTIMATE STRESS TEST REPORT - TOP-RATED BABYSITTING APP 💥');
    console.log('💥'.repeat(80));
    
    console.log(`\n🎯 OVERALL PERFORMANCE SCORE: ${this.results.securityEffectiveness}/100`);
    
    const performanceLevel = this.results.securityEffectiveness >= 95 ? '💎 DIAMOND-SOLID' :
                            this.results.securityEffectiveness >= 85 ? '🥇 PLATINUM' :
                            this.results.securityEffectiveness >= 75 ? '🥈 GOLD' :
                            this.results.securityEffectiveness >= 65 ? '🥉 SILVER' : '⚠️ NEEDS OPTIMIZATION';
    
    console.log(`🏆 PERFORMANCE LEVEL: ${performanceLevel}`);
    
    console.log(`\n⚡ PERFORMANCE METRICS:`);
    console.log(`   Total Requests: ${this.results.totalRequests.toLocaleString()}`);
    console.log(`   Successful: ${this.results.successfulRequests.toLocaleString()} (${((this.results.successfulRequests / this.results.totalRequests) * 100).toFixed(1)}%)`);
    console.log(`   Failed: ${this.results.failedRequests.toLocaleString()} (${((this.results.failedRequests / this.results.totalRequests) * 100).toFixed(1)}%)`);
    console.log(`   Blocked: ${this.results.blockedRequests.toLocaleString()} (${((this.results.blockedRequests / this.results.totalRequests) * 100).toFixed(1)}%)`);
    console.log(`   Avg Response Time: ${this.results.avgResponseTime.toFixed(2)}ms`);
    console.log(`   95th Percentile: ${this.results.p95ResponseTime.toFixed(2)}ms`);
    console.log(`   99th Percentile: ${this.results.p99ResponseTime.toFixed(2)}ms`);
    console.log(`   Max Response Time: ${this.results.maxResponseTime.toFixed(2)}ms`);

    console.log(`\n🚀 STRESS TEST BREAKDOWN:`);
    this.results.stressTestResults.forEach(test => {
      console.log(`   ${test.level}:`);
      console.log(`     Users: ${test.totalUsers} | Requests: ${test.totalRequests.toLocaleString()}`);
      console.log(`     Success Rate: ${test.successRate.toFixed(1)}% | Block Rate: ${test.blockRate.toFixed(1)}%`);
      console.log(`     Throughput: ${test.requestsPerSecond.toFixed(2)} req/s | Avg Response: ${test.avgResponseTime.toFixed(2)}ms`);
    });

    console.log(`\n💎 TOP-RATED APP CERTIFICATION:`);
    if (this.results.securityEffectiveness >= 95) {
      console.log(`   🏆 CERTIFIED: ULTIMATE PERFORMANCE ACHIEVED`);
      console.log(`   💎 DIAMOND-SOLID UNDER EXTREME LOAD`);
      console.log(`   🥇 TOP-RATED BABYSITTING APP READY`);
    } else if (this.results.securityEffectiveness >= 85) {
      console.log(`   🥇 EXCELLENT: HIGH PERFORMANCE ACHIEVED`);
      console.log(`   ⚡ READY FOR PRODUCTION DEPLOYMENT`);
    } else {
      console.log(`   ⚠️ OPTIMIZATION NEEDED FOR TOP-RATED STATUS`);
    }

    console.log('\n' + '💥'.repeat(80));
  }

  async run() {
    this.log('💥 STARTING ULTIMATE STRESS TEST SUITE...', 'ultimate');
    this.log('🎯 TARGET: TOP-RATED BABYSITTING APP WITH ULTIMATE PERFORMANCE', 'ultimate');
    
    const overallStartTime = performance.now();

    // Reset counters for each test level
    const originalResults = { ...this.results };
    
    // Run progressive stress tests
    for (const [level, config] of Object.entries(this.config.stressLevels)) {
      // Reset counters for each test
      this.results.totalRequests = 0;
      this.results.successfulRequests = 0;
      this.results.failedRequests = 0;
      this.results.blockedRequests = 0;
      this.results.avgResponseTime = 0;
      this.results.minResponseTime = Infinity;
      this.results.maxResponseTime = 0;
      this.responseTimes = [];
      
      await this.runStressTest(level, config);
      
      // Recovery time between tests
      if (level !== 'ULTIMATE') {
        this.log(`⏱️ Recovery period: 10 seconds...`, 'info');
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }

    // Aggregate all results
    this.results.totalRequests = this.results.stressTestResults.reduce((sum, test) => sum + test.totalRequests, 0);
    this.results.successfulRequests = this.results.stressTestResults.reduce((sum, test) => sum + test.successfulRequests, 0);
    this.results.failedRequests = this.results.stressTestResults.reduce((sum, test) => sum + test.failedRequests, 0);
    this.results.blockedRequests = this.results.stressTestResults.reduce((sum, test) => sum + test.blockedRequests, 0);

    const overallEndTime = performance.now();
    const totalDuration = ((overallEndTime - overallStartTime) / 1000).toFixed(2);

    // Calculate final metrics
    this.calculatePercentiles();
    this.calculateSecurityEffectiveness();

    this.log(`💥 Ultimate stress testing completed in ${totalDuration}s`, 'ultimate');

    // Save comprehensive report
    const report = {
      timestamp: new Date().toISOString(),
      testDuration: totalDuration,
      performanceScore: this.results.securityEffectiveness,
      totalRequests: this.results.totalRequests,
      successfulRequests: this.results.successfulRequests,
      failedRequests: this.results.failedRequests,
      blockedRequests: this.results.blockedRequests,
      stressTestResults: this.results.stressTestResults,
      performanceMetrics: {
        avgResponseTime: this.results.avgResponseTime,
        p95ResponseTime: this.results.p95ResponseTime,
        p99ResponseTime: this.results.p99ResponseTime,
        maxResponseTime: this.results.maxResponseTime
      },
      certification: this.results.securityEffectiveness >= 95 ? 'ULTIMATE' : 
                    this.results.securityEffectiveness >= 85 ? 'EXCELLENT' : 'NEEDS_OPTIMIZATION'
    };

    const reportFile = `ultimate-stress-test-report-${Date.now()}.json`;
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    
    this.log(`💥 Ultimate report saved to: ${reportFile}`, 'ultimate');
    this.printUltimateReport();

    return report;
  }
}

// Run the ultimate stress test if this file is executed directly
if (require.main === module) {
  const suite = new UltimateStressTest();
  suite.run().catch(error => {
    console.error('💥 Ultimate stress test failed:', error);
    process.exit(1);
  });
}

module.exports = UltimateStressTest;
