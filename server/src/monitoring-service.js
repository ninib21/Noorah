// Production Monitoring and Error Tracking Service
require('dotenv').config();

class MonitoringService {
    constructor() {
        this.metrics = {
            requests: 0,
            errors: 0,
            responseTime: [],
            activeUsers: new Set(),
            activeSessions: new Set(),
            emergencyAlerts: 0,
            payments: { successful: 0, failed: 0 },
            uptime: Date.now()
        };
        
        this.errorLog = [];
        this.performanceLog = [];
        this.securityLog = [];
        
        // Start periodic cleanup
        setInterval(() => this.cleanup(), 60000); // Every minute
    }

    // Track API request
    trackRequest(req, res, responseTime) {
        this.metrics.requests++;
        this.metrics.responseTime.push(responseTime);
        
        // Keep only last 1000 response times
        if (this.metrics.responseTime.length > 1000) {
            this.metrics.responseTime = this.metrics.responseTime.slice(-1000);
        }

        // Log slow requests
        if (responseTime > 2000) { // 2 seconds
            this.logPerformanceIssue('slow_request', {
                method: req.method,
                url: req.url,
                responseTime,
                userAgent: req.get('User-Agent'),
                ip: req.ip
            });
        }
    }

    // Track errors
    trackError(error, context = {}) {
        this.metrics.errors++;
        
        const errorEntry = {
            timestamp: new Date().toISOString(),
            message: error.message,
            stack: error.stack,
            context,
            id: this.generateId()
        };

        this.errorLog.push(errorEntry);
        
        // Keep only last 500 errors
        if (this.errorLog.length > 500) {
            this.errorLog = this.errorLog.slice(-500);
        }

        // Log critical errors immediately
        if (this.isCriticalError(error)) {
            this.alertCriticalError(errorEntry);
        }

        console.error('Error tracked:', errorEntry);
        return errorEntry.id;
    }

    // Track user activity
    trackUserActivity(userId, action, metadata = {}) {
        this.metrics.activeUsers.add(userId);
        
        // Log security-relevant actions
        if (this.isSecurityRelevant(action)) {
            this.logSecurityEvent(action, { userId, ...metadata });
        }
    }

    // Track session activity
    trackSessionActivity(sessionId, event, data = {}) {
        this.metrics.activeSessions.add(sessionId);
        
        if (event === 'emergency_alert') {
            this.metrics.emergencyAlerts++;
            this.alertEmergency(sessionId, data);
        }
    }

    // Track payment events
    trackPayment(success, amount, paymentMethod, error = null) {
        if (success) {
            this.metrics.payments.successful++;
        } else {
            this.metrics.payments.failed++;
            if (error) {
                this.trackError(new Error(`Payment failed: ${error}`), {
                    amount,
                    paymentMethod,
                    type: 'payment_failure'
                });
            }
        }
    }

    // Get current metrics
    getMetrics() {
        const now = Date.now();
        const uptimeSeconds = Math.floor((now - this.metrics.uptime) / 1000);
        
        return {
            uptime: {
                seconds: uptimeSeconds,
                formatted: this.formatUptime(uptimeSeconds)
            },
            requests: {
                total: this.metrics.requests,
                perMinute: this.calculateRequestsPerMinute()
            },
            errors: {
                total: this.metrics.errors,
                rate: this.metrics.requests > 0 ? (this.metrics.errors / this.metrics.requests * 100).toFixed(2) + '%' : '0%',
                recent: this.errorLog.slice(-10)
            },
            performance: {
                averageResponseTime: this.calculateAverageResponseTime(),
                slowRequests: this.performanceLog.slice(-5)
            },
            users: {
                active: this.metrics.activeUsers.size,
                activeSessions: this.metrics.activeSessions.size
            },
            payments: {
                successful: this.metrics.payments.successful,
                failed: this.metrics.payments.failed,
                successRate: this.calculatePaymentSuccessRate()
            },
            security: {
                emergencyAlerts: this.metrics.emergencyAlerts,
                recentEvents: this.securityLog.slice(-5)
            }
        };
    }

    // Health check with detailed status
    async healthCheck() {
        const metrics = this.getMetrics();
        const issues = [];

        // Check error rate
        if (parseFloat(metrics.errors.rate) > 5) {
            issues.push('High error rate detected');
        }

        // Check response time
        if (metrics.performance.averageResponseTime > 1000) {
            issues.push('High response time detected');
        }

        // Check payment failures
        if (metrics.payments.failed > 0 && parseFloat(metrics.payments.successRate) < 95) {
            issues.push('Payment failure rate too high');
        }

        return {
            status: issues.length === 0 ? 'healthy' : 'warning',
            issues,
            metrics,
            timestamp: new Date().toISOString()
        };
    }

    // Log performance issues
    logPerformanceIssue(type, data) {
        const entry = {
            timestamp: new Date().toISOString(),
            type,
            data,
            id: this.generateId()
        };

        this.performanceLog.push(entry);
        
        if (this.performanceLog.length > 100) {
            this.performanceLog = this.performanceLog.slice(-100);
        }
    }

    // Log security events
    logSecurityEvent(action, data) {
        const entry = {
            timestamp: new Date().toISOString(),
            action,
            data,
            id: this.generateId()
        };

        this.securityLog.push(entry);
        
        if (this.securityLog.length > 200) {
            this.securityLog = this.securityLog.slice(-200);
        }

        console.log('Security event logged:', entry);
    }

    // Alert for critical errors
    async alertCriticalError(errorEntry) {
        console.error('🚨 CRITICAL ERROR DETECTED:', errorEntry);
        
        // In production, send to error tracking service (Sentry, etc.)
        if (process.env.SENTRY_DSN) {
            // Sentry.captureException(error);
        }

        // Send alert to admin team
        if (process.env.ADMIN_EMAIL) {
            // await emailService.sendNotification(
            //     process.env.ADMIN_EMAIL,
            //     'Critical Error Alert - NannyRadar',
            //     `Critical error detected: ${errorEntry.message}`,
            //     { actionUrl: `${process.env.FRONTEND_URL}/admin/errors/${errorEntry.id}` }
            // );
        }
    }

    // Alert for emergency events
    async alertEmergency(sessionId, data) {
        console.log('🚨 EMERGENCY ALERT:', { sessionId, data });
        
        // Log to security events
        this.logSecurityEvent('emergency_alert', { sessionId, ...data });
        
        // In production, alert admin team immediately
        if (process.env.ADMIN_PHONE) {
            // await smsService.sendCustomNotification(
            //     process.env.ADMIN_PHONE,
            //     `Emergency alert triggered in session ${sessionId}`,
            //     true
            // );
        }
    }

    // Helper methods
    isCriticalError(error) {
        const criticalPatterns = [
            'database',
            'payment',
            'stripe',
            'emergency',
            'security',
            'authentication'
        ];
        
        return criticalPatterns.some(pattern => 
            error.message.toLowerCase().includes(pattern)
        );
    }

    isSecurityRelevant(action) {
        const securityActions = [
            'login',
            'logout',
            'password_change',
            'emergency_alert',
            'payment_failure',
            'account_locked',
            'suspicious_activity'
        ];
        
        return securityActions.includes(action);
    }

    calculateRequestsPerMinute() {
        // Simple approximation - in production, use time-windowed calculation
        return Math.round(this.metrics.requests / ((Date.now() - this.metrics.uptime) / 60000));
    }

    calculateAverageResponseTime() {
        if (this.metrics.responseTime.length === 0) return 0;
        const sum = this.metrics.responseTime.reduce((a, b) => a + b, 0);
        return Math.round(sum / this.metrics.responseTime.length);
    }

    calculatePaymentSuccessRate() {
        const total = this.metrics.payments.successful + this.metrics.payments.failed;
        if (total === 0) return '100%';
        return ((this.metrics.payments.successful / total) * 100).toFixed(1) + '%';
    }

    formatUptime(seconds) {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        return `${days}d ${hours}h ${minutes}m ${secs}s`;
    }

    generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    // Cleanup old data
    cleanup() {
        // Clear old active users (inactive for 30 minutes)
        const thirtyMinutesAgo = Date.now() - (30 * 60 * 1000);
        // In production, track last activity time and clean up accordingly
        
        // Clear old active sessions
        // Similar cleanup for sessions
        
        console.log('Monitoring cleanup completed');
    }

    // Export metrics for external monitoring
    exportMetrics() {
        return {
            timestamp: new Date().toISOString(),
            server: 'nannyradar',
            environment: process.env.NODE_ENV || 'development',
            ...this.getMetrics()
        };
    }

    // Reset metrics (for testing)
    reset() {
        this.metrics = {
            requests: 0,
            errors: 0,
            responseTime: [],
            activeUsers: new Set(),
            activeSessions: new Set(),
            emergencyAlerts: 0,
            payments: { successful: 0, failed: 0 },
            uptime: Date.now()
        };
        
        this.errorLog = [];
        this.performanceLog = [];
        this.securityLog = [];
    }
}

module.exports = new MonitoringService();
