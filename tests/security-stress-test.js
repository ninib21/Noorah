#!/usr/bin/env node

/**
 * Security Stress Testing Suite for NannyRadar
 * Tests security vulnerabilities and attack resistance
 */

const http = require('http');
const { performance } = require('perf_hooks');
const fs = require('fs');

class SecurityStressTest {
  constructor() {
    this.config = {
      backend: {
        baseUrl: 'http://localhost:3001/api/v1',
        timeout: 10000
      },
      attacks: {
        rateLimiting: { requests: 100, timeWindow: 10 },
        sqlInjection: [
          "'; DROP TABLE users; --",
          "' OR '1'='1",
          "' UNION SELECT * FROM users --",
          "admin'--",
          "' OR 1=1#"
        ],
        xssPayloads: [
          "<script>alert('XSS')</script>",
          "javascript:alert('XSS')",
          "<img src=x onerror=alert('XSS')>",
          "';alert('XSS');//"
        ],
        invalidInputs: [
          null,
          undefined,
          "",
          "a".repeat(10000),
          "{}",
          "[]",
          "true",
          "false",
          -1,
          999999999
        ]
      }
    };

    this.results = {
      rateLimitingTest: {
        tested: false,
        protected: false,
        requestsSent: 0,
        requestsBlocked: 0,
        details: []
      },
      injectionTests: {
        sqlInjection: { tested: false, vulnerable: false, attempts: [] },
        xssProtection: { tested: false, vulnerable: false, attempts: [] }
      },
      inputValidation: {
        tested: false,
        properValidation: false,
        vulnerabilities: []
      },
      authenticationSecurity: {
        tested: false,
        weaknesses: []
      },
      overallSecurity: {
        score: 0,
        level: 'unknown',
        criticalIssues: [],
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
      security: '🔒',
      attack: '⚔️',
      vulnerability: '🚨'
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
          'User-Agent': 'SecurityTest/1.0',
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
          responseTime: this.config.backend.timeout,
          success: false
        });
      });

      if (options.body) {
        req.write(JSON.stringify(options.body));
      }

      req.end();
    });
  }

  async testRateLimiting() {
    this.log('Testing rate limiting protection...', 'security');
    
    const { requests, timeWindow } = this.config.attacks.rateLimiting;
    const startTime = performance.now();
    const promises = [];
    
    // Send rapid requests to test rate limiting
    for (let i = 0; i < requests; i++) {
      promises.push(
        this.makeRequest(`${this.config.backend.baseUrl}/health`)
          .then(result => ({ success: true, statusCode: result.statusCode, index: i }))
          .catch(error => ({ success: false, error: error.error, index: i }))
      );
    }

    const results = await Promise.allSettled(promises);
    const endTime = performance.now();
    const actualTime = (endTime - startTime) / 1000;

    let successfulRequests = 0;
    let blockedRequests = 0;
    let rateLimitedRequests = 0;

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const response = result.value;
        if (response.success) {
          successfulRequests++;
        } else if (response.statusCode === 429) {
          rateLimitedRequests++;
          blockedRequests++;
        } else {
          blockedRequests++;
        }
      } else {
        blockedRequests++;
      }
    });

    this.results.rateLimitingTest = {
      tested: true,
      protected: rateLimitedRequests > 0 || blockedRequests > successfulRequests * 0.5,
      requestsSent: requests,
      requestsBlocked: blockedRequests,
      rateLimitedRequests: rateLimitedRequests,
      successfulRequests: successfulRequests,
      testDuration: actualTime,
      details: results.map(r => r.value || r.reason)
    };

    if (this.results.rateLimitingTest.protected) {
      this.log(`Rate limiting is working: ${rateLimitedRequests} requests rate-limited, ${blockedRequests} total blocked`, 'success');
    } else {
      this.log(`Rate limiting may be insufficient: ${successfulRequests}/${requests} requests succeeded`, 'warning');
    }
  }

  async testSQLInjection() {
    this.log('Testing SQL injection protection...', 'security');
    
    const endpoints = [
      { path: '/auth/login', method: 'POST' },
      { path: '/users/profile', method: 'GET' },
      { path: '/sitters/search', method: 'GET' }
    ];

    let vulnerableEndpoints = 0;
    const attempts = [];

    for (const endpoint of endpoints) {
      for (const payload of this.config.attacks.sqlInjection) {
        try {
          let url = `${this.config.backend.baseUrl}${endpoint.path}`;
          let body = null;

          if (endpoint.method === 'POST') {
            body = { email: payload, password: payload };
          } else {
            url += `?search=${encodeURIComponent(payload)}`;
          }

          const result = await this.makeRequest(url, {
            method: endpoint.method,
            body: body
          });

          const attempt = {
            endpoint: endpoint.path,
            payload: payload,
            statusCode: result.statusCode,
            responseLength: result.data.length,
            suspicious: result.data.toLowerCase().includes('error') || 
                      result.data.toLowerCase().includes('sql') ||
                      result.data.toLowerCase().includes('syntax')
          };

          attempts.push(attempt);

          if (attempt.suspicious) {
            vulnerableEndpoints++;
            this.log(`Potential SQL injection vulnerability in ${endpoint.path}`, 'vulnerability');
          }

        } catch (error) {
          attempts.push({
            endpoint: endpoint.path,
            payload: payload,
            error: error.error,
            suspicious: false
          });
        }
      }
    }

    this.results.injectionTests.sqlInjection = {
      tested: true,
      vulnerable: vulnerableEndpoints > 0,
      vulnerableEndpoints: vulnerableEndpoints,
      totalAttempts: attempts.length,
      attempts: attempts
    };

    if (vulnerableEndpoints === 0) {
      this.log('No SQL injection vulnerabilities detected', 'success');
    } else {
      this.log(`Potential SQL injection vulnerabilities found in ${vulnerableEndpoints} cases`, 'vulnerability');
    }
  }

  async testXSSProtection() {
    this.log('Testing XSS protection...', 'security');
    
    const endpoints = [
      { path: '/users/profile', method: 'GET' },
      { path: '/sitters/search', method: 'GET' }
    ];

    let vulnerableEndpoints = 0;
    const attempts = [];

    for (const endpoint of endpoints) {
      for (const payload of this.config.attacks.xssPayloads) {
        try {
          const url = `${this.config.backend.baseUrl}${endpoint.path}?search=${encodeURIComponent(payload)}`;
          
          const result = await this.makeRequest(url);

          const attempt = {
            endpoint: endpoint.path,
            payload: payload,
            statusCode: result.statusCode,
            responseContainsPayload: result.data.includes(payload),
            hasSecurityHeaders: !!(result.headers['x-xss-protection'] || 
                                  result.headers['content-security-policy'] ||
                                  result.headers['x-content-type-options'])
          };

          attempts.push(attempt);

          if (attempt.responseContainsPayload && !attempt.hasSecurityHeaders) {
            vulnerableEndpoints++;
            this.log(`Potential XSS vulnerability in ${endpoint.path}`, 'vulnerability');
          }

        } catch (error) {
          attempts.push({
            endpoint: endpoint.path,
            payload: payload,
            error: error.error
          });
        }
      }
    }

    this.results.injectionTests.xssProtection = {
      tested: true,
      vulnerable: vulnerableEndpoints > 0,
      vulnerableEndpoints: vulnerableEndpoints,
      totalAttempts: attempts.length,
      attempts: attempts
    };

    if (vulnerableEndpoints === 0) {
      this.log('XSS protection appears adequate', 'success');
    } else {
      this.log(`Potential XSS vulnerabilities found in ${vulnerableEndpoints} cases`, 'vulnerability');
    }
  }

  async testInputValidation() {
    this.log('Testing input validation...', 'security');
    
    const endpoints = [
      { path: '/auth/login', method: 'POST', field: 'email' },
      { path: '/bookings', method: 'POST', field: 'sitterId' }
    ];

    const vulnerabilities = [];
    let properValidationCount = 0;

    for (const endpoint of endpoints) {
      for (const invalidInput of this.config.attacks.invalidInputs) {
        try {
          const body = {};
          body[endpoint.field] = invalidInput;

          const result = await this.makeRequest(`${this.config.backend.baseUrl}${endpoint.path}`, {
            method: endpoint.method,
            body: body
          });

          // Proper validation should return 400 or 422 for invalid input
          const hasProperValidation = result.statusCode === 400 || result.statusCode === 422;
          
          if (hasProperValidation) {
            properValidationCount++;
          } else if (result.statusCode === 200 || result.statusCode === 201) {
            vulnerabilities.push({
              endpoint: endpoint.path,
              field: endpoint.field,
              input: invalidInput,
              statusCode: result.statusCode,
              issue: 'Accepted invalid input'
            });
          }

        } catch (error) {
          // Network errors are expected for some invalid inputs
        }
      }
    }

    this.results.inputValidation = {
      tested: true,
      properValidation: vulnerabilities.length === 0,
      properValidationCount: properValidationCount,
      vulnerabilities: vulnerabilities
    };

    if (vulnerabilities.length === 0) {
      this.log('Input validation appears robust', 'success');
    } else {
      this.log(`Input validation issues found: ${vulnerabilities.length} cases`, 'warning');
    }
  }

  calculateSecurityScore() {
    let score = 100;
    const criticalIssues = [];
    const recommendations = [];

    // Rate limiting (20 points)
    if (!this.results.rateLimitingTest.protected) {
      score -= 20;
      criticalIssues.push('No rate limiting protection');
      recommendations.push('🔒 Implement rate limiting to prevent abuse');
    }

    // SQL injection (30 points)
    if (this.results.injectionTests.sqlInjection.vulnerable) {
      score -= 30;
      criticalIssues.push('SQL injection vulnerabilities detected');
      recommendations.push('🛡️ Implement proper SQL injection protection');
    }

    // XSS protection (25 points)
    if (this.results.injectionTests.xssProtection.vulnerable) {
      score -= 25;
      criticalIssues.push('XSS vulnerabilities detected');
      recommendations.push('🔐 Add XSS protection headers and input sanitization');
    }

    // Input validation (25 points)
    if (!this.results.inputValidation.properValidation) {
      score -= 25;
      criticalIssues.push('Insufficient input validation');
      recommendations.push('✅ Implement comprehensive input validation');
    }

    // Determine security level
    let level;
    if (score >= 90) level = 'excellent';
    else if (score >= 75) level = 'good';
    else if (score >= 60) level = 'fair';
    else if (score >= 40) level = 'poor';
    else level = 'critical';

    this.results.overallSecurity = {
      score: Math.max(0, score),
      level: level,
      criticalIssues: criticalIssues,
      recommendations: recommendations
    };
  }

  printSecurityReport() {
    console.log('\n' + '='.repeat(80));
    console.log('🔒 SECURITY STRESS TEST REPORT');
    console.log('='.repeat(80));
    
    console.log('\n⚔️ ATTACK SIMULATION RESULTS:');
    
    console.log(`\n   Rate Limiting Test:`);
    console.log(`     Protected: ${this.results.rateLimitingTest.protected ? '✅ Yes' : '❌ No'}`);
    console.log(`     Requests Sent: ${this.results.rateLimitingTest.requestsSent}`);
    console.log(`     Requests Blocked: ${this.results.rateLimitingTest.requestsBlocked}`);
    
    console.log(`\n   SQL Injection Test:`);
    console.log(`     Vulnerable: ${this.results.injectionTests.sqlInjection.vulnerable ? '🚨 Yes' : '✅ No'}`);
    console.log(`     Attempts: ${this.results.injectionTests.sqlInjection.totalAttempts}`);
    
    console.log(`\n   XSS Protection Test:`);
    console.log(`     Vulnerable: ${this.results.injectionTests.xssProtection.vulnerable ? '🚨 Yes' : '✅ No'}`);
    console.log(`     Attempts: ${this.results.injectionTests.xssProtection.totalAttempts}`);
    
    console.log(`\n   Input Validation Test:`);
    console.log(`     Proper Validation: ${this.results.inputValidation.properValidation ? '✅ Yes' : '❌ No'}`);
    console.log(`     Vulnerabilities: ${this.results.inputValidation.vulnerabilities.length}`);

    console.log(`\n📊 OVERALL SECURITY ASSESSMENT:`);
    console.log(`   Security Score: ${this.results.overallSecurity.score}/100`);
    console.log(`   Security Level: ${this.results.overallSecurity.level.toUpperCase()}`);
    
    if (this.results.overallSecurity.criticalIssues.length > 0) {
      console.log(`\n🚨 CRITICAL ISSUES:`);
      this.results.overallSecurity.criticalIssues.forEach(issue => {
        console.log(`     ${issue}`);
      });
    }

    console.log(`\n💡 SECURITY RECOMMENDATIONS:`);
    this.results.overallSecurity.recommendations.forEach(rec => {
      console.log(`     ${rec}`);
    });

    console.log('\n' + '='.repeat(80));
  }

  async run() {
    this.log('🚀 Starting Security Stress Test Suite...', 'security');
    
    const startTime = performance.now();

    // Run security tests
    await this.testRateLimiting();
    await this.testSQLInjection();
    await this.testXSSProtection();
    await this.testInputValidation();

    const endTime = performance.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    // Calculate security score
    this.calculateSecurityScore();

    this.log(`Security tests completed in ${duration}s`, 'success');

    // Save report
    const report = {
      timestamp: new Date().toISOString(),
      testDuration: duration,
      results: this.results
    };

    const reportFile = `security-stress-test-report-${Date.now()}.json`;
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    
    this.log(`Security report saved to: ${reportFile}`, 'success');
    this.printSecurityReport();

    return report;
  }
}

// Run the security test if this file is executed directly
if (require.main === module) {
  const suite = new SecurityStressTest();
  suite.run().catch(error => {
    console.error('❌ Security stress test failed:', error);
    process.exit(1);
  });
}

module.exports = SecurityStressTest;
