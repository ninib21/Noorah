#!/usr/bin/env node

/**
 * Advanced NannyRadar Stress Testing Suite
 * Comprehensive performance and load testing
 */

const http = require('http');
const https = require('https');
const { performance } = require('perf_hooks');
const fs = require('fs');

class AdvancedStressTest {
  constructor() {
    this.config = {
      backend: {
        baseUrl: 'http://localhost:3001/api/v1',
        endpoints: [
          { path: '/health', method: 'GET', name: 'Health Check' },
          { path: '/health/ready', method: 'GET', name: 'Readiness Check' },
          { path: '/auth/login', method: 'POST', name: 'Login', body: { email: 'test@test.com', password: 'password' } },
          { path: '/bookings', method: 'GET', name: 'Get Bookings' },
          { path: '/sitters/search', method: 'GET', name: 'Search Sitters' },
          { path: '/users/profile', method: 'GET', name: 'Get Profile' },
          { path: '/payments/create-intent', method: 'POST', name: 'Create Payment', body: { amount: 6000 } }
        ]
      },
      loadTests: [
        { name: 'Light Load', users: 5, requests: 10, duration: 10 },
        { name: 'Medium Load', users: 20, requests: 15, duration: 15 },
        { name: 'Heavy Load', users: 50, requests: 20, duration: 20 },
        { name: 'Spike Test', users: 100, requests: 5, duration: 5 }
      ]
    };

    this.results = {
      endpointTests: [],
      loadTests: [],
      performanceMetrics: {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        avgResponseTime: 0,
        minResponseTime: Infinity,
        maxResponseTime: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0,
        requestsPerSecond: 0,
        errorRate: 0
      },
      recommendations: []
    };

    this.responseTimes = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '📋',
      success: '✅',
      error: '❌',
      warning: '⚠️',
      test: '🧪',
      load: '🚀',
      metric: '📊'
    }[type] || '📋';
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const startTime = performance.now();
      const protocol = url.startsWith('https') ? https : http;
      
      const requestOptions = {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'NannyRadar-StressTest/1.0',
          ...options.headers
        },
        timeout: options.timeout || 10000
      };

      const req = protocol.request(url, requestOptions, (res) => {
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
            success: res.statusCode >= 200 && res.statusCode < 300
          });
        });
      });

      req.on('error', (error) => {
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        reject({
          error: error.message,
          responseTime: responseTime,
          success: false
        });
      });

      req.on('timeout', () => {
        req.destroy();
        reject({
          error: 'Request timeout',
          responseTime: options.timeout || 10000,
          success: false
        });
      });

      if (options.body) {
        req.write(JSON.stringify(options.body));
      }

      req.end();
    });
  }

  async testEndpoint(endpoint) {
    const url = `${this.config.backend.baseUrl}${endpoint.path}`;
    
    try {
      const result = await this.makeRequest(url, {
        method: endpoint.method,
        body: endpoint.body
      });

      this.updateMetrics(result.responseTime, result.success);
      
      const testResult = {
        name: endpoint.name,
        path: endpoint.path,
        method: endpoint.method,
        success: result.success,
        statusCode: result.statusCode,
        responseTime: result.responseTime,
        timestamp: new Date().toISOString()
      };

      this.results.endpointTests.push(testResult);
      
      if (result.success) {
        this.log(`✓ ${endpoint.name}: ${result.responseTime.toFixed(2)}ms (${result.statusCode})`, 'success');
      } else {
        this.log(`✗ ${endpoint.name}: Failed (${result.statusCode})`, 'error');
      }

      return testResult;
    } catch (error) {
      this.updateMetrics(error.responseTime || 0, false);
      
      const testResult = {
        name: endpoint.name,
        path: endpoint.path,
        method: endpoint.method,
        success: false,
        error: error.error || error.message,
        responseTime: error.responseTime || 0,
        timestamp: new Date().toISOString()
      };

      this.results.endpointTests.push(testResult);
      this.log(`✗ ${endpoint.name}: ${error.error || error.message}`, 'error');
      
      return testResult;
    }
  }

  async runLoadTest(loadConfig) {
    this.log(`Running ${loadConfig.name}: ${loadConfig.users} users, ${loadConfig.requests} requests each, ${loadConfig.duration}s duration`, 'load');
    
    const startTime = performance.now();
    const promises = [];
    const results = [];

    // Create concurrent users
    for (let user = 0; user < loadConfig.users; user++) {
      for (let req = 0; req < loadConfig.requests; req++) {
        // Distribute requests across different endpoints
        const endpoint = this.config.backend.endpoints[req % this.config.backend.endpoints.length];
        const url = `${this.config.backend.baseUrl}${endpoint.path}`;
        
        const promise = this.makeRequest(url, {
          method: endpoint.method,
          body: endpoint.body
        }).then(result => {
          results.push(result);
          this.updateMetrics(result.responseTime, result.success);
          return result;
        }).catch(error => {
          results.push({ success: false, responseTime: error.responseTime || 0, error: error.error });
          this.updateMetrics(error.responseTime || 0, false);
          return error;
        });

        promises.push(promise);
        
        // Add small delay between requests to simulate real user behavior
        if (req < loadConfig.requests - 1) {
          await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
        }
      }
    }

    // Wait for all requests to complete or timeout
    const timeoutPromise = new Promise(resolve => 
      setTimeout(() => resolve('timeout'), loadConfig.duration * 1000)
    );

    const raceResult = await Promise.race([
      Promise.allSettled(promises),
      timeoutPromise
    ]);

    const endTime = performance.now();
    const actualDuration = (endTime - startTime) / 1000;

    // Calculate metrics
    const successful = results.filter(r => r.success).length;
    const failed = results.length - successful;
    const avgResponseTime = results.length > 0 
      ? results.reduce((sum, r) => sum + (r.responseTime || 0), 0) / results.length 
      : 0;
    const requestsPerSecond = results.length / actualDuration;

    const loadTestResult = {
      name: loadConfig.name,
      config: loadConfig,
      results: {
        totalRequests: results.length,
        successful: successful,
        failed: failed,
        duration: actualDuration,
        avgResponseTime: avgResponseTime,
        requestsPerSecond: requestsPerSecond,
        successRate: (successful / results.length) * 100
      },
      timestamp: new Date().toISOString()
    };

    this.results.loadTests.push(loadTestResult);
    
    this.log(`${loadConfig.name} completed: ${successful}/${results.length} successful, ${requestsPerSecond.toFixed(2)} req/s, ${avgResponseTime.toFixed(2)}ms avg`, 'success');
    
    return loadTestResult;
  }

  updateMetrics(responseTime, success) {
    this.results.performanceMetrics.totalRequests++;
    
    if (success) {
      this.results.performanceMetrics.successfulRequests++;
    } else {
      this.results.performanceMetrics.failedRequests++;
    }

    if (responseTime > 0) {
      this.responseTimes.push(responseTime);
      
      this.results.performanceMetrics.minResponseTime = Math.min(
        this.results.performanceMetrics.minResponseTime, 
        responseTime
      );
      
      this.results.performanceMetrics.maxResponseTime = Math.max(
        this.results.performanceMetrics.maxResponseTime, 
        responseTime
      );

      // Calculate running average
      const total = this.results.performanceMetrics.totalRequests;
      const currentAvg = this.results.performanceMetrics.avgResponseTime;
      this.results.performanceMetrics.avgResponseTime = 
        (currentAvg * (total - 1) + responseTime) / total;
    }

    // Calculate error rate
    this.results.performanceMetrics.errorRate = 
      (this.results.performanceMetrics.failedRequests / this.results.performanceMetrics.totalRequests) * 100;
  }

  calculatePercentiles() {
    if (this.responseTimes.length === 0) return;

    const sorted = this.responseTimes.sort((a, b) => a - b);
    const p95Index = Math.floor(sorted.length * 0.95);
    const p99Index = Math.floor(sorted.length * 0.99);

    this.results.performanceMetrics.p95ResponseTime = sorted[p95Index] || 0;
    this.results.performanceMetrics.p99ResponseTime = sorted[p99Index] || 0;
  }

  generateRecommendations() {
    const metrics = this.results.performanceMetrics;
    const recommendations = [];

    if (metrics.avgResponseTime > 500) {
      recommendations.push('🐌 High average response time (>500ms). Consider optimizing database queries and adding caching.');
    }

    if (metrics.p95ResponseTime > 1000) {
      recommendations.push('📈 95th percentile response time is high (>1s). Investigate slow endpoints.');
    }

    if (metrics.errorRate > 5) {
      recommendations.push('🚨 High error rate (>5%). Check server logs and system resources.');
    }

    if (metrics.errorRate === 0 && metrics.avgResponseTime < 100) {
      recommendations.push('🎉 Excellent performance! System is handling load very well.');
    }

    const heavyLoadTest = this.results.loadTests.find(t => t.name === 'Heavy Load');
    if (heavyLoadTest && heavyLoadTest.results.requestsPerSecond < 100) {
      recommendations.push('⚡ Low throughput under heavy load. Consider scaling horizontally.');
    }

    this.results.recommendations = recommendations;
  }

  printDetailedReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 ADVANCED STRESS TEST DETAILED REPORT');
    console.log('='.repeat(80));
    
    // Performance Metrics
    const metrics = this.results.performanceMetrics;
    console.log('\n📈 PERFORMANCE METRICS:');
    console.log(`   Total Requests: ${metrics.totalRequests}`);
    console.log(`   Successful: ${metrics.successfulRequests} (${((metrics.successfulRequests/metrics.totalRequests)*100).toFixed(1)}%)`);
    console.log(`   Failed: ${metrics.failedRequests} (${metrics.errorRate.toFixed(1)}%)`);
    console.log(`   Avg Response Time: ${metrics.avgResponseTime.toFixed(2)}ms`);
    console.log(`   Min Response Time: ${metrics.minResponseTime === Infinity ? 'N/A' : metrics.minResponseTime.toFixed(2) + 'ms'}`);
    console.log(`   Max Response Time: ${metrics.maxResponseTime.toFixed(2)}ms`);
    console.log(`   95th Percentile: ${metrics.p95ResponseTime.toFixed(2)}ms`);
    console.log(`   99th Percentile: ${metrics.p99ResponseTime.toFixed(2)}ms`);

    // Load Test Results
    console.log('\n🚀 LOAD TEST RESULTS:');
    this.results.loadTests.forEach(test => {
      console.log(`   ${test.name}:`);
      console.log(`     Requests: ${test.results.totalRequests}`);
      console.log(`     Success Rate: ${test.results.successRate.toFixed(1)}%`);
      console.log(`     Throughput: ${test.results.requestsPerSecond.toFixed(2)} req/s`);
      console.log(`     Avg Response: ${test.results.avgResponseTime.toFixed(2)}ms`);
    });

    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    this.results.recommendations.forEach(rec => {
      console.log(`   ${rec}`);
    });

    console.log('\n' + '='.repeat(80));
  }

  async run() {
    this.log('🚀 Starting Advanced NannyRadar Stress Test Suite...', 'info');
    
    const overallStartTime = performance.now();

    // Test individual endpoints
    this.log('Testing individual API endpoints...', 'test');
    for (const endpoint of this.config.backend.endpoints) {
      await this.testEndpoint(endpoint);
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between tests
    }

    // Run load tests
    this.log('Running progressive load tests...', 'load');
    for (const loadConfig of this.config.loadTests) {
      await this.runLoadTest(loadConfig);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Recovery time between load tests
    }

    const overallEndTime = performance.now();
    const totalDuration = ((overallEndTime - overallStartTime) / 1000).toFixed(2);

    // Calculate final metrics
    this.calculatePercentiles();
    this.generateRecommendations();

    this.log(`All tests completed in ${totalDuration}s`, 'success');

    // Generate and save report
    const report = {
      timestamp: new Date().toISOString(),
      testDuration: totalDuration,
      results: this.results,
      summary: {
        totalTests: this.results.performanceMetrics.totalRequests,
        overallSuccessRate: ((this.results.performanceMetrics.successfulRequests / this.results.performanceMetrics.totalRequests) * 100).toFixed(1),
        avgResponseTime: this.results.performanceMetrics.avgResponseTime.toFixed(2),
        recommendations: this.results.recommendations
      }
    };

    const reportFile = `advanced-stress-test-report-${Date.now()}.json`;
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    
    this.log(`Detailed report saved to: ${reportFile}`, 'success');
    this.printDetailedReport();
    
    return report;
  }
}

// Run the advanced stress test if this file is executed directly
if (require.main === module) {
  const suite = new AdvancedStressTest();
  suite.run().catch(error => {
    console.error('❌ Advanced stress test failed:', error);
    process.exit(1);
  });
}

module.exports = AdvancedStressTest;
