#!/usr/bin/env node

/**
 * Frontend-Backend Integration Test Suite
 * Tests the connection and data flow between React Native frontend and NestJS backend
 */

const http = require('http');
const { performance } = require('perf_hooks');
const fs = require('fs');

class IntegrationTestSuite {
  constructor() {
    this.config = {
      frontend: {
        url: 'http://localhost:8081',
        name: 'React Native (Expo)'
      },
      backend: {
        url: 'http://localhost:3001/api/v1',
        name: 'NestJS API'
      }
    };

    this.results = {
      frontend: {
        accessible: false,
        responseTime: 0,
        contentType: null,
        status: null
      },
      backend: {
        accessible: false,
        responseTime: 0,
        healthStatus: null,
        apiEndpoints: []
      },
      integration: {
        corsEnabled: false,
        apiCallsWork: false,
        dataFlow: [],
        errors: []
      },
      summary: {
        overallHealth: 'unknown',
        readyForProduction: false,
        recommendations: []
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
      test: '🧪',
      integration: '🔗'
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
          'Origin': 'http://localhost:8081',
          'User-Agent': 'NannyRadar-IntegrationTest/1.0',
          ...options.headers
        },
        timeout: options.timeout || 10000
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

  async testFrontendAccessibility() {
    this.log('Testing frontend accessibility...', 'test');
    
    try {
      const result = await this.makeRequest(this.config.frontend.url);
      
      this.results.frontend = {
        accessible: result.success,
        responseTime: result.responseTime,
        contentType: result.headers['content-type'],
        status: result.statusCode
      };

      if (result.success) {
        this.log(`Frontend accessible: ${result.responseTime.toFixed(2)}ms (${result.statusCode})`, 'success');
        return true;
      } else {
        throw new Error(`Frontend returned status ${result.statusCode}`);
      }
    } catch (error) {
      this.results.frontend.accessible = false;
      this.results.integration.errors.push(`Frontend test failed: ${error.error || error.message}`);
      this.log(`Frontend not accessible: ${error.error || error.message}`, 'error');
      return false;
    }
  }

  async testBackendHealth() {
    this.log('Testing backend health and API endpoints...', 'test');
    
    try {
      const healthResult = await this.makeRequest(`${this.config.backend.url}/health`);
      
      if (healthResult.success) {
        const healthData = JSON.parse(healthResult.data);
        this.results.backend = {
          accessible: true,
          responseTime: healthResult.responseTime,
          healthStatus: healthData,
          apiEndpoints: []
        };

        this.log(`Backend healthy: ${healthResult.responseTime.toFixed(2)}ms`, 'success');
        
        // Test multiple API endpoints
        const endpoints = [
          { path: '/health/ready', name: 'Readiness Check' },
          { path: '/auth/login', name: 'Auth Login', method: 'POST', body: { email: 'test@test.com', password: 'test' } },
          { path: '/bookings', name: 'Bookings API' },
          { path: '/sitters/search', name: 'Sitters Search' },
          { path: '/users/profile', name: 'User Profile' }
        ];

        for (const endpoint of endpoints) {
          try {
            const result = await this.makeRequest(`${this.config.backend.url}${endpoint.path}`, {
              method: endpoint.method || 'GET',
              body: endpoint.body
            });

            this.results.backend.apiEndpoints.push({
              name: endpoint.name,
              path: endpoint.path,
              success: result.success,
              responseTime: result.responseTime,
              statusCode: result.statusCode
            });

            if (result.success) {
              this.log(`✓ ${endpoint.name}: ${result.responseTime.toFixed(2)}ms`, 'success');
            } else {
              this.log(`✗ ${endpoint.name}: Failed (${result.statusCode})`, 'error');
            }
          } catch (error) {
            this.results.backend.apiEndpoints.push({
              name: endpoint.name,
              path: endpoint.path,
              success: false,
              error: error.error || error.message
            });
            this.log(`✗ ${endpoint.name}: ${error.error || error.message}`, 'error');
          }
        }

        return true;
      } else {
        throw new Error(`Backend health check failed with status ${healthResult.statusCode}`);
      }
    } catch (error) {
      this.results.backend.accessible = false;
      this.results.integration.errors.push(`Backend test failed: ${error.error || error.message}`);
      this.log(`Backend not accessible: ${error.error || error.message}`, 'error');
      return false;
    }
  }

  async testCorsConfiguration() {
    this.log('Testing CORS configuration...', 'integration');
    
    try {
      const result = await this.makeRequest(`${this.config.backend.url}/health`, {
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://localhost:8081',
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      });

      const corsHeaders = {
        'access-control-allow-origin': result.headers['access-control-allow-origin'],
        'access-control-allow-methods': result.headers['access-control-allow-methods'],
        'access-control-allow-headers': result.headers['access-control-allow-headers']
      };

      const corsEnabled = corsHeaders['access-control-allow-origin'] === '*' || 
                         corsHeaders['access-control-allow-origin'] === 'http://localhost:8081';

      this.results.integration.corsEnabled = corsEnabled;

      if (corsEnabled) {
        this.log('CORS properly configured for frontend-backend communication', 'success');
      } else {
        this.log('CORS configuration may prevent frontend-backend communication', 'warning');
        this.results.integration.errors.push('CORS not properly configured');
      }

      return corsEnabled;
    } catch (error) {
      this.results.integration.corsEnabled = false;
      this.results.integration.errors.push(`CORS test failed: ${error.error || error.message}`);
      this.log(`CORS test failed: ${error.error || error.message}`, 'error');
      return false;
    }
  }

  async testDataFlow() {
    this.log('Testing data flow scenarios...', 'integration');
    
    const scenarios = [
      {
        name: 'User Authentication Flow',
        steps: [
          { endpoint: '/auth/login', method: 'POST', body: { email: 'test@test.com', password: 'test' } }
        ]
      },
      {
        name: 'Booking Creation Flow',
        steps: [
          { endpoint: '/sitters/search', method: 'GET' },
          { endpoint: '/bookings', method: 'POST', body: { sitterId: 'test', date: new Date().toISOString() } }
        ]
      },
      {
        name: 'Payment Processing Flow',
        steps: [
          { endpoint: '/payments/create-intent', method: 'POST', body: { amount: 6000 } }
        ]
      }
    ];

    for (const scenario of scenarios) {
      this.log(`Testing ${scenario.name}...`, 'test');
      
      const scenarioResult = {
        name: scenario.name,
        steps: [],
        success: true,
        totalTime: 0
      };

      const startTime = performance.now();

      for (const step of scenario.steps) {
        try {
          const result = await this.makeRequest(`${this.config.backend.url}${step.endpoint}`, {
            method: step.method || 'GET',
            body: step.body
          });

          scenarioResult.steps.push({
            endpoint: step.endpoint,
            method: step.method || 'GET',
            success: result.success,
            responseTime: result.responseTime,
            statusCode: result.statusCode
          });

          if (!result.success) {
            scenarioResult.success = false;
          }
        } catch (error) {
          scenarioResult.steps.push({
            endpoint: step.endpoint,
            method: step.method || 'GET',
            success: false,
            error: error.error || error.message
          });
          scenarioResult.success = false;
        }
      }

      const endTime = performance.now();
      scenarioResult.totalTime = endTime - startTime;

      this.results.integration.dataFlow.push(scenarioResult);

      if (scenarioResult.success) {
        this.log(`✓ ${scenario.name}: ${scenarioResult.totalTime.toFixed(2)}ms`, 'success');
      } else {
        this.log(`✗ ${scenario.name}: Failed`, 'error');
      }
    }

    const successfulFlows = this.results.integration.dataFlow.filter(f => f.success).length;
    this.results.integration.apiCallsWork = successfulFlows > 0;

    return successfulFlows === scenarios.length;
  }

  generateRecommendations() {
    const recommendations = [];

    if (!this.results.frontend.accessible) {
      recommendations.push('🔧 Frontend is not accessible. Ensure Expo dev server is running on port 8081.');
    }

    if (!this.results.backend.accessible) {
      recommendations.push('🔧 Backend is not accessible. Ensure NestJS server is running on port 3001.');
    }

    if (!this.results.integration.corsEnabled) {
      recommendations.push('🌐 CORS is not properly configured. Update backend CORS settings to allow frontend origin.');
    }

    if (this.results.integration.apiCallsWork) {
      recommendations.push('🎉 Frontend-Backend integration is working correctly!');
    } else {
      recommendations.push('🚨 API calls are failing. Check network connectivity and API endpoints.');
    }

    const avgBackendResponseTime = this.results.backend.apiEndpoints.length > 0
      ? this.results.backend.apiEndpoints.reduce((sum, ep) => sum + (ep.responseTime || 0), 0) / this.results.backend.apiEndpoints.length
      : 0;

    if (avgBackendResponseTime > 200) {
      recommendations.push('⚡ Backend response times are high. Consider optimizing API performance.');
    }

    // Determine overall health
    const frontendOk = this.results.frontend.accessible;
    const backendOk = this.results.backend.accessible;
    const integrationOk = this.results.integration.corsEnabled && this.results.integration.apiCallsWork;

    if (frontendOk && backendOk && integrationOk) {
      this.results.summary.overallHealth = 'excellent';
      this.results.summary.readyForProduction = true;
    } else if (backendOk && integrationOk) {
      this.results.summary.overallHealth = 'good';
      this.results.summary.readyForProduction = true;
    } else if (backendOk || frontendOk) {
      this.results.summary.overallHealth = 'partial';
      this.results.summary.readyForProduction = false;
    } else {
      this.results.summary.overallHealth = 'poor';
      this.results.summary.readyForProduction = false;
    }

    this.results.summary.recommendations = recommendations;
  }

  printSummary() {
    console.log('\n' + '='.repeat(80));
    console.log('🔗 FRONTEND-BACKEND INTEGRATION TEST SUMMARY');
    console.log('='.repeat(80));
    
    console.log(`\n📱 FRONTEND (${this.config.frontend.name}):`);
    console.log(`   Status: ${this.results.frontend.accessible ? '✅ Accessible' : '❌ Not Accessible'}`);
    if (this.results.frontend.accessible) {
      console.log(`   Response Time: ${this.results.frontend.responseTime.toFixed(2)}ms`);
      console.log(`   Content Type: ${this.results.frontend.contentType}`);
    }

    console.log(`\n🔧 BACKEND (${this.config.backend.name}):`);
    console.log(`   Status: ${this.results.backend.accessible ? '✅ Accessible' : '❌ Not Accessible'}`);
    if (this.results.backend.accessible) {
      console.log(`   Health Response Time: ${this.results.backend.responseTime.toFixed(2)}ms`);
      console.log(`   API Endpoints Tested: ${this.results.backend.apiEndpoints.length}`);
      const successfulEndpoints = this.results.backend.apiEndpoints.filter(ep => ep.success).length;
      console.log(`   Successful Endpoints: ${successfulEndpoints}/${this.results.backend.apiEndpoints.length}`);
    }

    console.log(`\n🌐 INTEGRATION:`);
    console.log(`   CORS Enabled: ${this.results.integration.corsEnabled ? '✅ Yes' : '❌ No'}`);
    console.log(`   API Calls Work: ${this.results.integration.apiCallsWork ? '✅ Yes' : '❌ No'}`);
    console.log(`   Data Flow Scenarios: ${this.results.integration.dataFlow.length}`);
    const successfulFlows = this.results.integration.dataFlow.filter(f => f.success).length;
    console.log(`   Successful Flows: ${successfulFlows}/${this.results.integration.dataFlow.length}`);

    console.log(`\n📊 OVERALL ASSESSMENT:`);
    console.log(`   Health Status: ${this.results.summary.overallHealth.toUpperCase()}`);
    console.log(`   Production Ready: ${this.results.summary.readyForProduction ? '✅ Yes' : '❌ No'}`);

    console.log(`\n💡 RECOMMENDATIONS:`);
    this.results.summary.recommendations.forEach(rec => {
      console.log(`   ${rec}`);
    });

    console.log('\n' + '='.repeat(80));
  }

  async run() {
    this.log('🚀 Starting Frontend-Backend Integration Test Suite...', 'info');
    
    const startTime = performance.now();

    // Test frontend
    await this.testFrontendAccessibility();

    // Test backend
    await this.testBackendHealth();

    // Test integration
    await this.testCorsConfiguration();
    await this.testDataFlow();

    const endTime = performance.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    // Generate analysis
    this.generateRecommendations();

    this.log(`Integration tests completed in ${duration}s`, 'success');

    // Save detailed report
    const report = {
      timestamp: new Date().toISOString(),
      testDuration: duration,
      results: this.results
    };

    const reportFile = `integration-test-report-${Date.now()}.json`;
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    
    this.log(`Detailed report saved to: ${reportFile}`, 'success');
    this.printSummary();

    return report;
  }
}

// Run the integration test if this file is executed directly
if (require.main === module) {
  const suite = new IntegrationTestSuite();
  suite.run().catch(error => {
    console.error('❌ Integration test failed:', error);
    process.exit(1);
  });
}

module.exports = IntegrationTestSuite;
