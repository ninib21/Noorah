#!/usr/bin/env node

/**
 * NannyRadar Comprehensive Stress Testing Suite
 * Tests backend/frontend connection strength and performance
 */

const http = require('http');
const https = require('https');
const { performance } = require('perf_hooks');
const fs = require('fs');

class StressTestSuite {
  constructor() {
    this.results = {
      backend: {
        available: false,
        healthCheck: null,
        apiTests: [],
        loadTests: [],
        errors: []
      },
      frontend: {
        available: false,
        buildStatus: null,
        errors: []
      },
      summary: {
        totalTests: 0,
        passed: 0,
        failed: 0,
        avgResponseTime: 0,
        maxResponseTime: 0,
        minResponseTime: Infinity
      }
    };

    this.config = {
      backend: {
        host: 'localhost',
        port: 3001,
        baseUrl: 'http://localhost:3001/api/v1'
      },
      frontend: {
        host: 'localhost',
        port: 19006,
        baseUrl: 'http://localhost:19006'
      },
      loadTest: {
        concurrentUsers: 10,
        requestsPerUser: 5,
        timeoutMs: 5000
      }
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '📋',
      success: '✅',
      error: '❌',
      warning: '⚠️',
      test: '🧪'
    }[type] || '📋';
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const startTime = performance.now();
      const protocol = url.startsWith('https') ? https : http;
      
      const req = protocol.get(url, {
        timeout: options.timeout || 5000,
        ...options
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
          responseTime: options.timeout || 5000,
          success: false
        });
      });
    });
  }

  async testBackendHealth() {
    this.log('Testing backend health...', 'test');
    
    try {
      const result = await this.makeRequest(`${this.config.backend.baseUrl}/health`);
      
      if (result.success) {
        this.results.backend.available = true;
        this.results.backend.healthCheck = {
          status: 'healthy',
          responseTime: result.responseTime,
          data: JSON.parse(result.data)
        };
        this.log(`Backend is healthy (${result.responseTime.toFixed(2)}ms)`, 'success');
        return true;
      } else {
        throw new Error(`Health check failed with status ${result.statusCode}`);
      }
    } catch (error) {
      this.results.backend.available = false;
      this.results.backend.errors.push(`Health check failed: ${error.error || error.message}`);
      this.log(`Backend health check failed: ${error.error || error.message}`, 'error');
      return false;
    }
  }

  async testBackendEndpoints() {
    if (!this.results.backend.available) {
      this.log('Skipping API tests - backend not available', 'warning');
      return;
    }

    this.log('Testing backend API endpoints...', 'test');
    
    const endpoints = [
      { path: '/health', method: 'GET', name: 'Health Check' },
      { path: '/health/ready', method: 'GET', name: 'Readiness Check' },
      // Add more endpoints as needed
    ];

    for (const endpoint of endpoints) {
      try {
        const result = await this.makeRequest(`${this.config.backend.baseUrl}${endpoint.path}`);
        
        this.results.backend.apiTests.push({
          endpoint: endpoint.name,
          path: endpoint.path,
          method: endpoint.method,
          success: result.success,
          responseTime: result.responseTime,
          statusCode: result.statusCode
        });

        this.updateSummaryStats(result.responseTime, result.success);
        
        if (result.success) {
          this.log(`✓ ${endpoint.name}: ${result.responseTime.toFixed(2)}ms`, 'success');
        } else {
          this.log(`✗ ${endpoint.name}: Failed (${result.statusCode})`, 'error');
        }
      } catch (error) {
        this.results.backend.apiTests.push({
          endpoint: endpoint.name,
          path: endpoint.path,
          method: endpoint.method,
          success: false,
          responseTime: error.responseTime || 0,
          error: error.error || error.message
        });

        this.updateSummaryStats(error.responseTime || 0, false);
        this.log(`✗ ${endpoint.name}: ${error.error || error.message}`, 'error');
      }
    }
  }

  async runLoadTest() {
    if (!this.results.backend.available) {
      this.log('Skipping load tests - backend not available', 'warning');
      return;
    }

    this.log(`Running load test: ${this.config.loadTest.concurrentUsers} concurrent users, ${this.config.loadTest.requestsPerUser} requests each`, 'test');
    
    const promises = [];
    const startTime = performance.now();

    for (let user = 0; user < this.config.loadTest.concurrentUsers; user++) {
      for (let req = 0; req < this.config.loadTest.requestsPerUser; req++) {
        promises.push(this.makeRequest(`${this.config.backend.baseUrl}/health`));
      }
    }

    try {
      const results = await Promise.allSettled(promises);
      const endTime = performance.now();
      const totalTime = endTime - startTime;

      let successful = 0;
      let failed = 0;
      let totalResponseTime = 0;

      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value.success) {
          successful++;
          totalResponseTime += result.value.responseTime;
          this.updateSummaryStats(result.value.responseTime, true);
        } else {
          failed++;
          this.updateSummaryStats(0, false);
        }
      });

      const avgResponseTime = successful > 0 ? totalResponseTime / successful : 0;
      const requestsPerSecond = (successful / (totalTime / 1000)).toFixed(2);

      this.results.backend.loadTests.push({
        concurrentUsers: this.config.loadTest.concurrentUsers,
        requestsPerUser: this.config.loadTest.requestsPerUser,
        totalRequests: promises.length,
        successful: successful,
        failed: failed,
        totalTime: totalTime,
        avgResponseTime: avgResponseTime,
        requestsPerSecond: parseFloat(requestsPerSecond)
      });

      this.log(`Load test completed: ${successful}/${promises.length} successful, ${requestsPerSecond} req/s, avg ${avgResponseTime.toFixed(2)}ms`, 'success');
    } catch (error) {
      this.log(`Load test failed: ${error.message}`, 'error');
    }
  }

  async testFrontend() {
    this.log('Testing frontend availability...', 'test');
    
    try {
      const result = await this.makeRequest(this.config.frontend.baseUrl);
      
      if (result.success) {
        this.results.frontend.available = true;
        this.results.frontend.buildStatus = 'accessible';
        this.log(`Frontend is accessible (${result.responseTime.toFixed(2)}ms)`, 'success');
      } else {
        throw new Error(`Frontend returned status ${result.statusCode}`);
      }
    } catch (error) {
      this.results.frontend.available = false;
      this.results.frontend.errors.push(`Frontend test failed: ${error.error || error.message}`);
      this.log(`Frontend not accessible: ${error.error || error.message}`, 'error');
    }
  }

  updateSummaryStats(responseTime, success) {
    this.results.summary.totalTests++;
    if (success) {
      this.results.summary.passed++;
    } else {
      this.results.summary.failed++;
    }

    if (responseTime > 0) {
      this.results.summary.maxResponseTime = Math.max(this.results.summary.maxResponseTime, responseTime);
      this.results.summary.minResponseTime = Math.min(this.results.summary.minResponseTime, responseTime);
      
      // Calculate running average
      const totalResponseTime = this.results.summary.avgResponseTime * (this.results.summary.totalTests - 1) + responseTime;
      this.results.summary.avgResponseTime = totalResponseTime / this.results.summary.totalTests;
    }
  }

  generateReport() {
    this.log('Generating comprehensive test report...', 'info');
    
    const report = {
      timestamp: new Date().toISOString(),
      testDuration: 'N/A',
      results: this.results,
      recommendations: this.generateRecommendations()
    };

    // Save report to file
    const reportFile = `stress-test-report-${Date.now()}.json`;
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    
    this.log(`Report saved to: ${reportFile}`, 'success');
    this.printSummary();
    
    return report;
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (!this.results.backend.available) {
      recommendations.push('🔧 Backend is not running. Start with: cd backend && npm run start:dev');
    }
    
    if (!this.results.frontend.available) {
      recommendations.push('🔧 Frontend is not running. Start with: cd babysitting-app && npm start');
    }
    
    if (this.results.summary.avgResponseTime > 1000) {
      recommendations.push('⚡ Average response time is high (>1s). Consider optimizing database queries and adding caching.');
    }
    
    if (this.results.summary.failed > this.results.summary.passed * 0.1) {
      recommendations.push('🚨 High failure rate detected. Check error logs and system resources.');
    }
    
    return recommendations;
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 STRESS TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`🎯 Total Tests: ${this.results.summary.totalTests}`);
    console.log(`✅ Passed: ${this.results.summary.passed}`);
    console.log(`❌ Failed: ${this.results.summary.failed}`);
    console.log(`📈 Success Rate: ${((this.results.summary.passed / this.results.summary.totalTests) * 100).toFixed(1)}%`);
    console.log(`⏱️  Avg Response Time: ${this.results.summary.avgResponseTime.toFixed(2)}ms`);
    console.log(`🚀 Max Response Time: ${this.results.summary.maxResponseTime.toFixed(2)}ms`);
    console.log(`⚡ Min Response Time: ${this.results.summary.minResponseTime === Infinity ? 'N/A' : this.results.summary.minResponseTime.toFixed(2) + 'ms'}`);
    console.log(`🔧 Backend: ${this.results.backend.available ? '✅ Available' : '❌ Unavailable'}`);
    console.log(`📱 Frontend: ${this.results.frontend.available ? '✅ Available' : '❌ Unavailable'}`);
    console.log('='.repeat(60));
  }

  async run() {
    this.log('🚀 Starting NannyRadar Stress Test Suite...', 'info');
    
    const startTime = performance.now();
    
    // Test backend
    await this.testBackendHealth();
    await this.testBackendEndpoints();
    await this.runLoadTest();
    
    // Test frontend
    await this.testFrontend();
    
    const endTime = performance.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    this.log(`All tests completed in ${duration}s`, 'success');
    
    return this.generateReport();
  }
}

// Run the stress test if this file is executed directly
if (require.main === module) {
  const suite = new StressTestSuite();
  suite.run().catch(error => {
    console.error('❌ Stress test suite failed:', error);
    process.exit(1);
  });
}

module.exports = StressTestSuite;
