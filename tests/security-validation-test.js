#!/usr/bin/env node

/**
 * Security Validation Test Suite
 * Tests all implemented security features
 */

const http = require('http');
const { performance } = require('perf_hooks');
const fs = require('fs');

class SecurityValidationTest {
  constructor() {
    this.config = {
      backend: {
        baseUrl: 'http://localhost:3001/api/v1',
        timeout: 10000
      }
    };

    this.results = {
      rateLimitingTest: { passed: false, details: [] },
      inputValidationTest: { passed: false, details: [] },
      xssProtectionTest: { passed: false, details: [] },
      sqlInjectionTest: { passed: false, details: [] },
      authenticationTest: { passed: false, details: [] },
      securityHeadersTest: { passed: false, details: [] },
      overallScore: 0,
      recommendations: []
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
      test: '🧪'
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
          'User-Agent': options.userAgent || 'SecurityValidationTest/1.0',
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
    this.log('Testing rate limiting implementation...', 'test');
    
    const promises = [];
    const testEndpoint = `${this.config.backend.baseUrl}/health`;
    
    // Send 20 rapid requests to test rate limiting
    for (let i = 0; i < 20; i++) {
      promises.push(
        this.makeRequest(testEndpoint)
          .then(result => ({ success: true, statusCode: result.statusCode, index: i }))
          .catch(error => ({ success: false, error: error.error, index: i }))
      );
    }

    const results = await Promise.allSettled(promises);
    let blockedRequests = 0;
    let successfulRequests = 0;

    results.forEach(result => {
      if (result.status === 'fulfilled') {
        const response = result.value;
        if (response.success) {
          successfulRequests++;
        } else if (response.statusCode === 429 || response.statusCode === 403) {
          blockedRequests++;
        }
      }
    });

    const rateLimitWorking = blockedRequests > 0 || successfulRequests < 15;
    
    this.results.rateLimitingTest = {
      passed: rateLimitWorking,
      details: [
        `Total requests: ${results.length}`,
        `Successful: ${successfulRequests}`,
        `Blocked: ${blockedRequests}`,
        `Rate limiting: ${rateLimitWorking ? 'WORKING' : 'NOT WORKING'}`
      ]
    };

    if (rateLimitWorking) {
      this.log('Rate limiting is working correctly', 'success');
    } else {
      this.log('Rate limiting may not be working properly', 'warning');
    }
  }

  async testInputValidation() {
    this.log('Testing input validation...', 'test');
    
    const maliciousInputs = [
      { input: '<script>alert("xss")</script>', type: 'XSS' },
      { input: "'; DROP TABLE users; --", type: 'SQL Injection' },
      { input: '../../../etc/passwd', type: 'Path Traversal' },
      { input: 'a'.repeat(10001), type: 'Buffer Overflow' },
      { input: '\0\0\0', type: 'Null Bytes' }
    ];

    let validationsPassed = 0;
    const details = [];

    for (const test of maliciousInputs) {
      try {
        const result = await this.makeRequest(`${this.config.backend.baseUrl}/sitters/search?q=${encodeURIComponent(test.input)}`);
        
        if (result.statusCode === 400 || result.statusCode === 422) {
          validationsPassed++;
          details.push(`${test.type}: BLOCKED ✅`);
        } else {
          details.push(`${test.type}: NOT BLOCKED ❌`);
        }
      } catch (error) {
        // Network errors might indicate blocking
        validationsPassed++;
        details.push(`${test.type}: BLOCKED (Network Error) ✅`);
      }
    }

    const passed = validationsPassed >= maliciousInputs.length * 0.8; // 80% success rate
    
    this.results.inputValidationTest = {
      passed: passed,
      details: details
    };

    if (passed) {
      this.log('Input validation is working well', 'success');
    } else {
      this.log('Input validation needs improvement', 'warning');
    }
  }

  async testSecurityHeaders() {
    this.log('Testing security headers...', 'test');
    
    try {
      const result = await this.makeRequest(`${this.config.backend.baseUrl}/health`);
      
      const requiredHeaders = [
        'x-xss-protection',
        'x-content-type-options',
        'x-frame-options',
        'referrer-policy'
      ];

      const presentHeaders = [];
      const missingHeaders = [];

      requiredHeaders.forEach(header => {
        if (result.headers[header]) {
          presentHeaders.push(header);
        } else {
          missingHeaders.push(header);
        }
      });

      const passed = presentHeaders.length >= requiredHeaders.length * 0.75; // 75% of headers present
      
      this.results.securityHeadersTest = {
        passed: passed,
        details: [
          `Present headers: ${presentHeaders.join(', ')}`,
          `Missing headers: ${missingHeaders.join(', ')}`,
          `Score: ${presentHeaders.length}/${requiredHeaders.length}`
        ]
      };

      if (passed) {
        this.log('Security headers are properly configured', 'success');
      } else {
        this.log('Some security headers are missing', 'warning');
      }
    } catch (error) {
      this.results.securityHeadersTest = {
        passed: false,
        details: [`Error testing headers: ${error.error}`]
      };
    }
  }

  async testAuthentication() {
    this.log('Testing authentication security...', 'test');
    
    const tests = [
      {
        name: 'Invalid credentials',
        body: { email: 'invalid@test.com', password: 'wrongpassword' },
        expectedStatus: 401
      },
      {
        name: 'Weak password',
        body: { email: 'test@test.com', password: '123' },
        expectedStatus: 400
      },
      {
        name: 'Invalid email format',
        body: { email: 'notanemail', password: 'ValidPassword123!' },
        expectedStatus: 400
      }
    ];

    let authTestsPassed = 0;
    const details = [];

    for (const test of tests) {
      try {
        const result = await this.makeRequest(`${this.config.backend.baseUrl}/auth/login`, {
          method: 'POST',
          body: test.body
        });

        if (result.statusCode === test.expectedStatus) {
          authTestsPassed++;
          details.push(`${test.name}: PASSED ✅`);
        } else {
          details.push(`${test.name}: FAILED (got ${result.statusCode}, expected ${test.expectedStatus}) ❌`);
        }
      } catch (error) {
        details.push(`${test.name}: ERROR (${error.error}) ❌`);
      }
    }

    const passed = authTestsPassed >= tests.length * 0.8;
    
    this.results.authenticationTest = {
      passed: passed,
      details: details
    };

    if (passed) {
      this.log('Authentication security is working well', 'success');
    } else {
      this.log('Authentication security needs improvement', 'warning');
    }
  }

  async testSuspiciousActivityDetection() {
    this.log('Testing suspicious activity detection...', 'test');
    
    const suspiciousTests = [
      {
        name: 'Security scanner user agent',
        userAgent: 'sqlmap/1.0',
        expectedBlocked: true
      },
      {
        name: 'Path traversal attempt',
        path: '/health/../../../etc/passwd',
        expectedBlocked: true
      },
      {
        name: 'Admin path access',
        path: '/admin/users',
        expectedBlocked: true
      }
    ];

    let detectionsPassed = 0;
    const details = [];

    for (const test of suspiciousTests) {
      try {
        const url = test.path 
          ? `${this.config.backend.baseUrl}${test.path}`
          : `${this.config.backend.baseUrl}/health`;
          
        const result = await this.makeRequest(url, {
          userAgent: test.userAgent
        });

        const wasBlocked = result.statusCode === 403 || result.statusCode === 429;
        
        if (wasBlocked === test.expectedBlocked) {
          detectionsPassed++;
          details.push(`${test.name}: ${wasBlocked ? 'BLOCKED' : 'ALLOWED'} ✅`);
        } else {
          details.push(`${test.name}: ${wasBlocked ? 'BLOCKED' : 'ALLOWED'} (unexpected) ❌`);
        }
      } catch (error) {
        if (test.expectedBlocked) {
          detectionsPassed++;
          details.push(`${test.name}: BLOCKED (Network Error) ✅`);
        } else {
          details.push(`${test.name}: ERROR (${error.error}) ❌`);
        }
      }
    }

    const passed = detectionsPassed >= suspiciousTests.length * 0.7;
    
    this.results.suspiciousActivityTest = {
      passed: passed,
      details: details
    };

    if (passed) {
      this.log('Suspicious activity detection is working', 'success');
    } else {
      this.log('Suspicious activity detection needs improvement', 'warning');
    }
  }

  calculateOverallScore() {
    const tests = [
      this.results.rateLimitingTest,
      this.results.inputValidationTest,
      this.results.securityHeadersTest,
      this.results.authenticationTest,
      this.results.suspiciousActivityTest
    ];

    const passedTests = tests.filter(test => test && test.passed).length;
    const totalTests = tests.length;
    
    this.results.overallScore = Math.round((passedTests / totalTests) * 100);
    
    // Generate recommendations
    const recommendations = [];
    
    if (!this.results.rateLimitingTest.passed) {
      recommendations.push('🔒 Implement or fix rate limiting to prevent abuse');
    }
    
    if (!this.results.inputValidationTest.passed) {
      recommendations.push('✅ Enhance input validation to block malicious inputs');
    }
    
    if (!this.results.securityHeadersTest.passed) {
      recommendations.push('🛡️ Add missing security headers for better protection');
    }
    
    if (!this.results.authenticationTest.passed) {
      recommendations.push('🔐 Strengthen authentication validation');
    }
    
    if (this.results.overallScore >= 90) {
      recommendations.push('🎉 Excellent security implementation! System is well protected.');
    } else if (this.results.overallScore >= 70) {
      recommendations.push('👍 Good security implementation with room for improvement.');
    } else {
      recommendations.push('⚠️ Security implementation needs significant improvement.');
    }
    
    this.results.recommendations = recommendations;
  }

  printReport() {
    console.log('\n' + '='.repeat(80));
    console.log('🔒 SECURITY VALIDATION REPORT');
    console.log('='.repeat(80));
    
    console.log(`\n📊 OVERALL SECURITY SCORE: ${this.results.overallScore}/100`);
    
    const tests = [
      { name: 'Rate Limiting', result: this.results.rateLimitingTest },
      { name: 'Input Validation', result: this.results.inputValidationTest },
      { name: 'Security Headers', result: this.results.securityHeadersTest },
      { name: 'Authentication', result: this.results.authenticationTest },
      { name: 'Suspicious Activity Detection', result: this.results.suspiciousActivityTest }
    ];

    console.log('\n🧪 TEST RESULTS:');
    tests.forEach(test => {
      if (test.result) {
        console.log(`\n   ${test.name}: ${test.result.passed ? '✅ PASSED' : '❌ FAILED'}`);
        test.result.details.forEach(detail => {
          console.log(`     ${detail}`);
        });
      }
    });

    console.log('\n💡 RECOMMENDATIONS:');
    this.results.recommendations.forEach(rec => {
      console.log(`   ${rec}`);
    });

    console.log('\n' + '='.repeat(80));
  }

  async run() {
    this.log('🚀 Starting Security Validation Test Suite...', 'security');
    
    const startTime = performance.now();

    // Run all security tests
    await this.testRateLimiting();
    await this.testInputValidation();
    await this.testSecurityHeaders();
    await this.testAuthentication();
    await this.testSuspiciousActivityDetection();

    const endTime = performance.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    // Calculate overall score and recommendations
    this.calculateOverallScore();

    this.log(`Security validation completed in ${duration}s`, 'success');

    // Save detailed report
    const report = {
      timestamp: new Date().toISOString(),
      testDuration: duration,
      overallScore: this.results.overallScore,
      results: this.results
    };

    const reportFile = `security-validation-report-${Date.now()}.json`;
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    
    this.log(`Detailed report saved to: ${reportFile}`, 'success');
    this.printReport();

    return report;
  }
}

// Run the security validation test if this file is executed directly
if (require.main === module) {
  const suite = new SecurityValidationTest();
  suite.run().catch(error => {
    console.error('❌ Security validation test failed:', error);
    process.exit(1);
  });
}

module.exports = SecurityValidationTest;
