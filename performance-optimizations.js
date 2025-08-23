// Performance Optimizations for NannyRadar
// Image optimization, caching, and CDN setup

// 1. Image Optimization Service
class ImageOptimizer {
    static async optimizeImage(imageBuffer, options = {}) {
        const { width = 800, height = 600, quality = 80, format = 'jpeg' } = options;
        
        try {
            const Jimp = require('jimp');
            const image = await Jimp.read(imageBuffer);
            
            // Resize and optimize
            image.resize(width, height, Jimp.RESIZE_BEZIER);
            image.quality(quality);
            
            // Convert to specified format
            if (format === 'webp') {
                // Use sharp for WebP conversion in production
                return await image.getBufferAsync(Jimp.MIME_JPEG);
            }
            
            return await image.getBufferAsync(Jimp.MIME_JPEG);
        } catch (error) {
            console.error('Image optimization failed:', error);
            return imageBuffer; // Return original if optimization fails
        }
    }
}

// 2. Caching Service
class CacheService {
    constructor() {
        this.cache = new Map();
        this.ttl = new Map();
        
        // Cleanup expired entries every 5 minutes
        setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }
    
    set(key, value, ttlMs = 300000) { // 5 minutes default
        this.cache.set(key, value);
        this.ttl.set(key, Date.now() + ttlMs);
    }
    
    get(key) {
        if (this.isExpired(key)) {
            this.delete(key);
            return null;
        }
        return this.cache.get(key);
    }
    
    delete(key) {
        this.cache.delete(key);
        this.ttl.delete(key);
    }
    
    isExpired(key) {
        const expiry = this.ttl.get(key);
        return expiry && Date.now() > expiry;
    }
    
    cleanup() {
        for (const [key] of this.ttl) {
            if (this.isExpired(key)) {
                this.delete(key);
            }
        }
    }
    
    clear() {
        this.cache.clear();
        this.ttl.clear();
    }
}

// 3. CDN Configuration
const CDN_CONFIG = {
    images: 'https://cdn.nannyradar.com/images/',
    assets: 'https://cdn.nannyradar.com/assets/',
    videos: 'https://cdn.nannyradar.com/videos/'
};

// 4. Performance Middleware
function performanceMiddleware(req, res, next) {
    // Add cache headers for static assets
    if (req.url.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg)$/)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
        res.setHeader('Expires', new Date(Date.now() + 31536000000).toUTCString());
    }
    
    // Add compression hint
    res.setHeader('Vary', 'Accept-Encoding');
    
    next();
}

// 5. Database Query Optimization
class QueryOptimizer {
    static addIndexes() {
        return [
            'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_active ON users(email) WHERE is_active = true;',
            'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_date_status ON bookings(start_time, status);',
            'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_active ON sessions(status) WHERE status = \'active\';',
            'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_status_date ON payments(status, created_at);'
        ];
    }
    
    static optimizeQueries() {
        return {
            // Use prepared statements
            findActiveBookings: 'SELECT * FROM bookings WHERE status = $1 AND start_time > $2 ORDER BY start_time LIMIT $3',
            findUserSessions: 'SELECT s.*, b.parent_id, b.sitter_id FROM sessions s JOIN bookings b ON s.booking_id = b.id WHERE (b.parent_id = $1 OR b.sitter_id = $1) AND s.status = $2',
            // Add more optimized queries
        };
    }
}

// 6. Frontend Performance Optimizations
const FRONTEND_OPTIMIZATIONS = `
<!-- Critical CSS inline -->
<style>
/* Critical above-the-fold styles */
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
.hero { background: linear-gradient(135deg, #FF69B4, #6C63FF); }
</style>

<!-- Preload critical resources -->
<link rel="preload" href="/fonts/nunito-bold.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/api/health" as="fetch" crossorigin>

<!-- Lazy load non-critical CSS -->
<link rel="preload" href="/css/app.css" as="style" onload="this.onload=null;this.rel='stylesheet'">

<!-- Service Worker for caching -->
<script>
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
}
</script>
`;

// 7. Service Worker for Caching
const SERVICE_WORKER = `
const CACHE_NAME = 'nannyradar-v1';
const urlsToCache = [
    '/',
    '/css/app.css',
    '/js/app.js',
    '/images/logo.png',
    '/api/health'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});
`;

// 8. Advanced Analytics
class AdvancedAnalytics {
    constructor() {
        this.events = [];
        this.userSessions = new Map();
        this.performanceMetrics = new Map();
    }
    
    trackEvent(eventName, properties = {}) {
        this.events.push({
            event: eventName,
            properties,
            timestamp: Date.now(),
            sessionId: properties.sessionId || 'anonymous'
        });
    }
    
    trackUserSession(userId, action, metadata = {}) {
        if (!this.userSessions.has(userId)) {
            this.userSessions.set(userId, {
                startTime: Date.now(),
                actions: [],
                metadata: {}
            });
        }
        
        const session = this.userSessions.get(userId);
        session.actions.push({
            action,
            timestamp: Date.now(),
            metadata
        });
    }
    
    trackPerformance(metric, value, tags = {}) {
        const key = `${metric}_${JSON.stringify(tags)}`;
        if (!this.performanceMetrics.has(key)) {
            this.performanceMetrics.set(key, []);
        }
        
        this.performanceMetrics.get(key).push({
            value,
            timestamp: Date.now()
        });
    }
    
    getAnalytics() {
        return {
            totalEvents: this.events.length,
            activeSessions: this.userSessions.size,
            topEvents: this.getTopEvents(),
            performanceMetrics: this.getPerformanceMetrics(),
            userEngagement: this.getUserEngagement()
        };
    }
    
    getTopEvents() {
        const eventCounts = {};
        this.events.forEach(event => {
            eventCounts[event.event] = (eventCounts[event.event] || 0) + 1;
        });
        
        return Object.entries(eventCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);
    }
    
    getPerformanceMetrics() {
        const metrics = {};
        for (const [key, values] of this.performanceMetrics) {
            const recentValues = values.slice(-100); // Last 100 measurements
            metrics[key] = {
                average: recentValues.reduce((sum, v) => sum + v.value, 0) / recentValues.length,
                min: Math.min(...recentValues.map(v => v.value)),
                max: Math.max(...recentValues.map(v => v.value)),
                count: recentValues.length
            };
        }
        return metrics;
    }
    
    getUserEngagement() {
        const now = Date.now();
        const activeUsers = Array.from(this.userSessions.values())
            .filter(session => now - session.startTime < 30 * 60 * 1000) // Active in last 30 minutes
            .length;
            
        return {
            activeUsers,
            totalSessions: this.userSessions.size,
            averageSessionLength: this.calculateAverageSessionLength()
        };
    }
    
    calculateAverageSessionLength() {
        const sessions = Array.from(this.userSessions.values());
        if (sessions.length === 0) return 0;
        
        const totalLength = sessions.reduce((sum, session) => {
            const lastAction = session.actions[session.actions.length - 1];
            const sessionLength = lastAction ? lastAction.timestamp - session.startTime : 0;
            return sum + sessionLength;
        }, 0);
        
        return Math.round(totalLength / sessions.length / 1000); // Average in seconds
    }
}

// 9. User Feedback System
class FeedbackSystem {
    constructor() {
        this.feedback = [];
        this.ratings = new Map();
    }
    
    submitFeedback(userId, type, message, rating = null, metadata = {}) {
        const feedback = {
            id: this.generateId(),
            userId,
            type, // 'bug', 'feature', 'general', 'rating'
            message,
            rating,
            metadata,
            timestamp: Date.now(),
            status: 'new'
        };
        
        this.feedback.push(feedback);
        
        if (rating) {
            this.ratings.set(userId, rating);
        }
        
        return feedback.id;
    }
    
    getFeedbackSummary() {
        const summary = {
            total: this.feedback.length,
            byType: {},
            averageRating: this.calculateAverageRating(),
            recentFeedback: this.feedback.slice(-10)
        };
        
        this.feedback.forEach(f => {
            summary.byType[f.type] = (summary.byType[f.type] || 0) + 1;
        });
        
        return summary;
    }
    
    calculateAverageRating() {
        const ratings = Array.from(this.ratings.values());
        if (ratings.length === 0) return 0;
        return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
    }
    
    generateId() {
        return Math.random().toString(36).substr(2, 9);
    }
}

// Export all services
module.exports = {
    ImageOptimizer,
    CacheService,
    CDN_CONFIG,
    performanceMiddleware,
    QueryOptimizer,
    FRONTEND_OPTIMIZATIONS,
    SERVICE_WORKER,
    AdvancedAnalytics,
    FeedbackSystem
};
