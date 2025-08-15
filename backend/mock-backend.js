#!/usr/bin/env node

/**
 * Mock Backend Server for NannyRadar Stress Testing
 * Simulates the main API endpoints for testing purposes
 */

const http = require('http');
const url = require('url');
const { performance } = require('perf_hooks');

class MockBackendServer {
  constructor(port = 3001) {
    this.port = port;
    this.server = null;
    this.requestCount = 0;
    this.startTime = performance.now();
    this.stats = {
      totalRequests: 0,
      healthChecks: 0,
      apiCalls: 0,
      errors: 0,
      avgResponseTime: 0
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '📋',
      success: '✅',
      error: '❌',
      warning: '⚠️',
      request: '🔄'
    }[type] || '📋';
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  simulateDelay(min = 10, max = 100) {
    const delay = Math.random() * (max - min) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  async handleRequest(req, res) {
    const startTime = performance.now();
    this.requestCount++;
    this.stats.totalRequests++;

    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const method = req.method;

    this.log(`${method} ${path}`, 'request');

    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Content-Type', 'application/json');

    // Handle preflight requests
    if (method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    try {
      // Simulate processing delay
      await this.simulateDelay(5, 50);

      let response;
      let statusCode = 200;

      switch (path) {
        case '/api/v1/health':
          this.stats.healthChecks++;
          response = {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: ((performance.now() - this.startTime) / 1000).toFixed(2),
            environment: 'mock',
            version: '1.0.0-mock',
            requestCount: this.requestCount,
            stats: this.stats
          };
          break;

        case '/api/v1/health/ready':
          response = {
            status: 'ready',
            timestamp: new Date().toISOString(),
            services: {
              database: 'connected',
              redis: 'connected',
              external_apis: 'available'
            }
          };
          break;

        case '/api/v1/auth/login':
          this.stats.apiCalls++;
          if (method === 'POST') {
            response = {
              success: true,
              token: 'mock_jwt_token_' + Date.now(),
              user: {
                id: 'mock_user_123',
                email: 'test@nannyradar.com',
                role: 'parent'
              },
              expiresIn: '24h'
            };
          } else {
            statusCode = 405;
            response = { error: 'Method not allowed' };
          }
          break;

        case '/api/v1/bookings':
          this.stats.apiCalls++;
          if (method === 'GET') {
            response = {
              bookings: [
                {
                  id: 'booking_1',
                  sitterId: 'sitter_123',
                  parentId: 'parent_456',
                  date: new Date().toISOString(),
                  status: 'confirmed',
                  duration: 4,
                  rate: 15.00
                }
              ],
              total: 1,
              page: 1,
              limit: 10
            };
          } else if (method === 'POST') {
            response = {
              success: true,
              booking: {
                id: 'booking_' + Date.now(),
                status: 'pending',
                createdAt: new Date().toISOString()
              }
            };
            statusCode = 201;
          } else {
            statusCode = 405;
            response = { error: 'Method not allowed' };
          }
          break;

        case '/api/v1/sitters/search':
          this.stats.apiCalls++;
          response = {
            sitters: [
              {
                id: 'sitter_1',
                name: 'Sarah Johnson',
                rating: 4.8,
                hourlyRate: 15.00,
                distance: 2.3,
                available: true,
                experience: 5
              },
              {
                id: 'sitter_2',
                name: 'Mike Chen',
                rating: 4.9,
                hourlyRate: 18.00,
                distance: 1.8,
                available: true,
                experience: 3
              }
            ],
            total: 2,
            filters: parsedUrl.query
          };
          break;

        case '/api/v1/payments/create-intent':
          this.stats.apiCalls++;
          if (method === 'POST') {
            response = {
              success: true,
              clientSecret: 'pi_mock_' + Date.now() + '_secret',
              paymentIntentId: 'pi_mock_' + Date.now(),
              amount: 6000, // $60.00
              currency: 'usd'
            };
            statusCode = 201;
          } else {
            statusCode = 405;
            response = { error: 'Method not allowed' };
          }
          break;

        case '/api/v1/users/profile':
          this.stats.apiCalls++;
          response = {
            id: 'user_123',
            email: 'test@nannyradar.com',
            firstName: 'John',
            lastName: 'Doe',
            role: 'parent',
            verified: true,
            createdAt: '2024-01-01T00:00:00Z'
          };
          break;

        case '/api/v1/stats':
          response = {
            server: {
              uptime: ((performance.now() - this.startTime) / 1000).toFixed(2),
              requestCount: this.requestCount,
              stats: this.stats,
              memory: process.memoryUsage(),
              timestamp: new Date().toISOString()
            }
          };
          break;

        default:
          statusCode = 404;
          response = {
            error: 'Not Found',
            message: `Endpoint ${path} not found`,
            availableEndpoints: [
              '/api/v1/health',
              '/api/v1/health/ready',
              '/api/v1/auth/login',
              '/api/v1/bookings',
              '/api/v1/sitters/search',
              '/api/v1/payments/create-intent',
              '/api/v1/users/profile',
              '/api/v1/stats'
            ]
          };
          this.stats.errors++;
          break;
      }

      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      // Update average response time
      this.stats.avgResponseTime = (this.stats.avgResponseTime * (this.stats.totalRequests - 1) + responseTime) / this.stats.totalRequests;

      res.writeHead(statusCode);
      res.end(JSON.stringify(response, null, 2));

      this.log(`${statusCode} ${path} (${responseTime.toFixed(2)}ms)`, statusCode < 400 ? 'success' : 'error');

    } catch (error) {
      this.stats.errors++;
      this.log(`Error handling ${path}: ${error.message}`, 'error');
      
      res.writeHead(500);
      res.end(JSON.stringify({
        error: 'Internal Server Error',
        message: error.message
      }));
    }
  }

  start() {
    return new Promise((resolve, reject) => {
      this.server = http.createServer((req, res) => {
        this.handleRequest(req, res).catch(error => {
          this.log(`Unhandled error: ${error.message}`, 'error');
        });
      });

      this.server.listen(this.port, (error) => {
        if (error) {
          reject(error);
        } else {
          this.log(`🚀 Mock NannyRadar Backend running on http://localhost:${this.port}`, 'success');
          this.log(`📚 API Documentation: http://localhost:${this.port}/api/v1/stats`, 'info');
          this.log(`🔍 Health Check: http://localhost:${this.port}/api/v1/health`, 'info');
          resolve();
        }
      });

      this.server.on('error', (error) => {
        this.log(`Server error: ${error.message}`, 'error');
      });
    });
  }

  stop() {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          this.log('Mock backend server stopped', 'info');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  getStats() {
    return {
      ...this.stats,
      uptime: ((performance.now() - this.startTime) / 1000).toFixed(2),
      requestCount: this.requestCount
    };
  }
}

// Start the server if this file is executed directly
if (require.main === module) {
  const server = new MockBackendServer(3001);
  
  server.start().catch(error => {
    console.error('❌ Failed to start mock backend:', error);
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n📋 Shutting down mock backend...');
    await server.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n📋 Shutting down mock backend...');
    await server.stop();
    process.exit(0);
  });
}

module.exports = MockBackendServer;
