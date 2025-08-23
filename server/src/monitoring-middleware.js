// Monitoring Middleware for Express
const monitoringService = require('./monitoring-service');

// Request tracking middleware
function requestTracker(req, res, next) {
    const startTime = Date.now();
    
    // Track user activity if authenticated
    if (req.user && req.user.id) {
        monitoringService.trackUserActivity(req.user.id, req.method + ' ' + req.path, {
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });
    }

    // Override res.end to capture response time
    const originalEnd = res.end;
    res.end = function(...args) {
        const responseTime = Date.now() - startTime;
        monitoringService.trackRequest(req, res, responseTime);
        originalEnd.apply(this, args);
    };

    next();
}

// Error tracking middleware
function errorTracker(err, req, res, next) {
    const errorId = monitoringService.trackError(err, {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user ? req.user.id : null,
        body: req.body,
        params: req.params,
        query: req.query
    });

    // Add error ID to response for tracking
    res.locals.errorId = errorId;
    
    next(err);
}

// Security event tracker
function securityTracker(action, metadata = {}) {
    return (req, res, next) => {
        monitoringService.logSecurityEvent(action, {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            userId: req.user ? req.user.id : null,
            ...metadata
        });
        next();
    };
}

// Rate limiting tracker
function rateLimitTracker(req, res, next) {
    // Track rate limit hits
    if (res.locals.rateLimited) {
        monitoringService.logSecurityEvent('rate_limit_exceeded', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            endpoint: req.path
        });
    }
    next();
}

module.exports = {
    requestTracker,
    errorTracker,
    securityTracker,
    rateLimitTracker
};
