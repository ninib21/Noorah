import { 
  Injectable, 
  CanActivate, 
  ExecutionContext, 
  UnauthorizedException,
  ForbiddenException,
  Logger 
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import * as crypto from 'crypto';

@Injectable()
export class SecurityGuard implements CanActivate {
  private readonly logger = new Logger(SecurityGuard.name);
  
  // Rate limiting storage (in production, use Redis)
  private readonly rateLimitStore = new Map<string, { count: number; resetTime: number }>();
  
  // Blocked IPs storage (in production, use Redis)
  private readonly blockedIPs = new Set<string>();
  
  // Failed login attempts tracking
  private readonly failedAttempts = new Map<string, { count: number; lastAttempt: number }>();

  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
  ) {
    // Clean up rate limit store every 5 minutes
    setInterval(() => this.cleanupRateLimitStore(), 5 * 60 * 1000);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const clientIP = this.getClientIP(request);
    
    try {
      // Check if IP is blocked
      if (this.isIPBlocked(clientIP)) {
        this.logger.warn(`Blocked IP attempted access: ${clientIP}`);
        throw new ForbiddenException('Access denied');
      }

      // Check rate limiting
      if (!this.checkRateLimit(clientIP, request.path)) {
        this.logger.warn(`Rate limit exceeded for IP: ${clientIP}`);
        throw new ForbiddenException('Rate limit exceeded');
      }

      // Check for suspicious activity
      this.detectSuspiciousActivity(request);

      // Validate JWT token if present
      const token = this.extractTokenFromHeader(request);
      if (token) {
        const payload = await this.validateToken(token);
        request['user'] = payload;
        
        // Additional security checks for authenticated users
        await this.performAuthenticatedSecurityChecks(request, payload);
      }

      // Check if route requires authentication
      const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
        context.getHandler(),
        context.getClass(),
      ]);

      if (!isPublic && !token) {
        throw new UnauthorizedException('Authentication required');
      }

      return true;
    } catch (error) {
      // Log security events
      this.logSecurityEvent(request, error);
      
      // Track failed attempts for potential blocking
      this.trackFailedAttempt(clientIP);
      
      throw error;
    }
  }

  private isIPBlocked(ip: string): boolean {
    return this.blockedIPs.has(ip);
  }

  private checkRateLimit(ip: string, path: string): boolean {
    const key = `${ip}:${path}`;
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    
    // Different limits for different endpoints
    let maxRequests = 100; // Default limit
    
    if (path.includes('/auth/login')) {
      maxRequests = 5; // Stricter limit for login
    } else if (path.includes('/auth/')) {
      maxRequests = 10; // Moderate limit for auth endpoints
    } else if (path.includes('/upload')) {
      maxRequests = 20; // Moderate limit for uploads
    }

    const current = this.rateLimitStore.get(key);
    
    if (!current || now > current.resetTime) {
      // Reset or initialize
      this.rateLimitStore.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      return true;
    }

    if (current.count >= maxRequests) {
      return false;
    }

    current.count++;
    return true;
  }

  private detectSuspiciousActivity(request: Request): void {
    const clientIP = this.getClientIP(request);
    const userAgent = request.headers['user-agent'] || '';
    const path = request.path;
    
    let suspiciousScore = 0;
    const reasons: string[] = [];

    // Check for bot-like behavior
    if (!userAgent || userAgent.length < 10) {
      suspiciousScore += 20;
      reasons.push('Missing or suspicious user agent');
    }

    // Check for security scanning tools
    const scanningTools = [
      'sqlmap', 'nikto', 'nmap', 'masscan', 'zap', 'burp', 
      'dirb', 'gobuster', 'wfuzz', 'hydra', 'medusa'
    ];
    
    if (scanningTools.some(tool => userAgent.toLowerCase().includes(tool))) {
      suspiciousScore += 50;
      reasons.push('Security scanning tool detected');
    }

    // Check for suspicious paths
    const suspiciousPaths = [
      '/admin', '/config', '/.env', '/backup', '/debug',
      '/phpMyAdmin', '/wp-admin', '/.git', '/api/v1/admin'
    ];
    
    if (suspiciousPaths.some(suspPath => path.toLowerCase().includes(suspPath))) {
      suspiciousScore += 30;
      reasons.push('Suspicious path access');
    }

    // Check for path traversal attempts
    if (path.includes('..') || path.includes('%2e%2e')) {
      suspiciousScore += 40;
      reasons.push('Path traversal attempt');
    }

    // Check request frequency
    const recentRequests = this.getRecentRequestCount(clientIP);
    if (recentRequests > 50) { // More than 50 requests in last minute
      suspiciousScore += 25;
      reasons.push('High request frequency');
    }

    // Block if score is too high
    if (suspiciousScore > 60) {
      this.blockIP(clientIP, reasons.join(', '));
      throw new ForbiddenException('Suspicious activity detected');
    }

    // Log medium-level suspicious activity
    if (suspiciousScore > 30) {
      this.logger.warn(`Suspicious activity from ${clientIP}: ${reasons.join(', ')}`);
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private async validateToken(token: string): Promise<any> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      // Additional token validation
      if (!payload.sub || !payload.email) {
        throw new UnauthorizedException('Invalid token payload');
      }

      // Check token age
      const tokenAge = Date.now() / 1000 - payload.iat;
      if (tokenAge > 24 * 60 * 60) { // 24 hours
        throw new UnauthorizedException('Token expired');
      }

      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private async performAuthenticatedSecurityChecks(request: Request, user: any): Promise<void> {
    const clientIP = this.getClientIP(request);
    
    // Check for session hijacking
    const userAgent = request.headers['user-agent'] || '';
    const sessionKey = `session:${user.sub}:${crypto.createHash('md5').update(userAgent).digest('hex')}`;
    
    // In production, you'd store and validate session fingerprints
    
    // Check for concurrent sessions from different IPs
    // This would require session storage in production
    
    // Log authenticated access
    this.logger.debug(`Authenticated access: ${user.email} from ${clientIP}`);
  }

  private logSecurityEvent(request: Request, error: any): void {
    const clientIP = this.getClientIP(request);
    const userAgent = request.headers['user-agent'] || 'unknown';
    
    const securityEvent = {
      timestamp: new Date().toISOString(),
      ip: clientIP,
      userAgent: userAgent,
      path: request.path,
      method: request.method,
      error: error.message,
      severity: this.determineSeverity(error),
    };

    if (securityEvent.severity === 'HIGH' || securityEvent.severity === 'CRITICAL') {
      this.logger.error('Security event', securityEvent);
    } else {
      this.logger.warn('Security event', securityEvent);
    }
  }

  private trackFailedAttempt(ip: string): void {
    const now = Date.now();
    const current = this.failedAttempts.get(ip);
    
    if (!current || now - current.lastAttempt > 60 * 60 * 1000) { // Reset after 1 hour
      this.failedAttempts.set(ip, { count: 1, lastAttempt: now });
      return;
    }

    current.count++;
    current.lastAttempt = now;

    // Block IP after 10 failed attempts
    if (current.count >= 10) {
      this.blockIP(ip, 'Too many failed attempts');
    }
  }

  private blockIP(ip: string, reason: string): void {
    this.blockedIPs.add(ip);
    this.logger.error(`IP blocked: ${ip} - Reason: ${reason}`);
    
    // In production, you'd also:
    // 1. Store in database/Redis for persistence
    // 2. Set expiration time for blocks
    // 3. Send alerts to security team
    
    // Auto-unblock after 1 hour (for demo purposes)
    setTimeout(() => {
      this.blockedIPs.delete(ip);
      this.logger.log(`IP unblocked: ${ip}`);
    }, 60 * 60 * 1000);
  }

  private getRecentRequestCount(ip: string): number {
    // In production, this would query Redis or a cache
    // For demo, return a random number
    return Math.floor(Math.random() * 20);
  }

  private determineSeverity(error: any): string {
    if (error instanceof ForbiddenException) {
      return 'HIGH';
    }
    if (error instanceof UnauthorizedException) {
      return 'MEDIUM';
    }
    return 'LOW';
  }

  private cleanupRateLimitStore(): void {
    const now = Date.now();
    for (const [key, value] of this.rateLimitStore.entries()) {
      if (now > value.resetTime) {
        this.rateLimitStore.delete(key);
      }
    }
  }

  private getClientIP(request: Request): string {
    const forwarded = request.headers['x-forwarded-for'] as string;
    const realIP = request.headers['x-real-ip'] as string;
    const remoteAddress = request.connection?.remoteAddress || request.socket?.remoteAddress;
    
    let ip = forwarded?.split(',')[0] || realIP || remoteAddress || 'unknown';
    
    // Clean up IPv6 mapped IPv4 addresses
    if (ip.startsWith('::ffff:')) {
      ip = ip.substring(7);
    }
    
    return ip;
  }
}

/**
 * Decorator to mark routes as public (no authentication required)
 */
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
