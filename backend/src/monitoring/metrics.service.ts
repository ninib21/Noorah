import { Injectable } from '@nestjs/common';
import * as promClient from 'prom-client';

@Injectable()
export class MetricsService {
  private register: promClient.Registry;
  private httpRequestDuration: promClient.Histogram;
  private httpRequestTotal: promClient.Counter;
  private activeUsers: promClient.Gauge;
  private bookingRequests: promClient.Counter;
  private paymentTransactions: promClient.Counter;
  private emergencyAlerts: promClient.Counter;
  private databaseConnections: promClient.Gauge;
  private cacheHits: promClient.Counter;
  private cacheMisses: promClient.Counter;

  constructor() {
    this.register = new promClient.Registry();
    this.httpRequestDuration = new promClient.Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.1, 0.5, 1, 2, 5],
    });

    this.httpRequestTotal = new promClient.Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
    });

    this.activeUsers = new promClient.Gauge({
      name: 'active_users',
      help: 'Number of active users',
      labelNames: ['user_type'],
    });

    this.bookingRequests = new promClient.Counter({
      name: 'booking_requests_total',
      help: 'Total number of booking requests',
      labelNames: ['status'],
    });

    this.paymentTransactions = new promClient.Counter({
      name: 'payment_transactions_total',
      help: 'Total number of payment transactions',
      labelNames: ['status', 'payment_method'],
    });

    this.emergencyAlerts = new promClient.Counter({
      name: 'emergency_alerts_total',
      help: 'Total number of emergency alerts',
      labelNames: ['type', 'severity'],
    });

    this.databaseConnections = new promClient.Gauge({
      name: 'database_connections',
      help: 'Number of active database connections',
      labelNames: ['database'],
    });

    this.cacheHits = new promClient.Counter({
      name: 'cache_hits_total',
      help: 'Total number of cache hits',
      labelNames: ['cache_type'],
    });

    this.cacheMisses = new promClient.Counter({
      name: 'cache_misses_total',
      help: 'Total number of cache misses',
      labelNames: ['cache_type'],
    });

    // Register all metrics
    this.register.registerMetric(this.httpRequestDuration);
    this.register.registerMetric(this.httpRequestTotal);
    this.register.registerMetric(this.activeUsers);
    this.register.registerMetric(this.bookingRequests);
    this.register.registerMetric(this.paymentTransactions);
    this.register.registerMetric(this.emergencyAlerts);
    this.register.registerMetric(this.databaseConnections);
    this.register.registerMetric(this.cacheHits);
    this.register.registerMetric(this.cacheMisses);
  }

  recordHttpRequest(method: string, route: string, statusCode: number, duration: number) {
    this.httpRequestDuration.observe({ method, route, status_code: statusCode }, duration);
    this.httpRequestTotal.inc({ method, route, status_code: statusCode });
  }

  recordBookingRequest(status: string) {
    this.bookingRequests.inc({ status });
  }

  recordPaymentTransaction(status: string, paymentMethod: string) {
    this.paymentTransactions.inc({ status, payment_method: paymentMethod });
  }

  recordEmergencyAlert(type: string, severity: string) {
    this.emergencyAlerts.inc({ type, severity });
  }

  setActiveUsers(count: number, userType: string) {
    this.activeUsers.set({ user_type: userType }, count);
  }

  setDatabaseConnections(count: number, database: string) {
    this.databaseConnections.set({ database }, count);
  }

  recordCacheHit(cacheType: string) {
    this.cacheHits.inc({ cache_type: cacheType });
  }

  recordCacheMiss(cacheType: string) {
    this.cacheMisses.inc({ cache_type: cacheType });
  }

  async getMetrics(): Promise<string> {
    return this.register.metrics();
  }
} 
