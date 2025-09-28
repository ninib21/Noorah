import { Injectable, NestMiddleware, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as validator from 'validator';
import * as crypto from 'crypto';

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SecurityMiddleware.name);
  
  // Suspicious patterns for injection attacks
  private readonly suspiciousPatterns = [
    // SQL Injection patterns
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
    /(\'|\"|;|--|\*|\/\*|\*\/)/,
    /(\bOR\b|\bAND\b).*(\=|\<|\>)/i,
    
    // XSS patterns
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /javascript:/i,
    /on\w+\s*=/i,
    /<img[^>]+src[^>]*>/gi,
    
    // Path traversal
    /\.\.\//,
    /\.\.\\/,
    /%2e%2e%2f/i,
    /%2e%2e%5c/i,
    
    // Command injection
    /(\||&|;|\$\(|\`)/,
    /(nc|netcat|wget|curl|chmod|rm|cat|ls|ps|kill)/i
  ];

  use(req: Request, res: Response, next: NextFunction) {
    try {
      // Log request for security monitoring
      this.logSecurityEvent(req);

      // Validate and sanitize input
      this.validateInput(req);

      // Check for suspicious activity
      this.checkSuspiciousActivity(req);

      // Add security headers
      this.addSecurityHeaders(res);

      next();
    } catch (error) {
      this.logger.error('Security middleware error:', error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        'Security validation failed',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  private logSecurityEvent(req: Request): void {
    const clientIP = this.getClientIP(req);
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    // Log security-relevant information
    this.logger.debug(`Security check: ${req.method} ${req.path} from ${clientIP}`);
    
    // Check for suspicious user agents
    const suspiciousAgents = ['sqlmap', 'nikto', 'nmap', 'masscan', 'zap', 'burp'];
    if (suspiciousAgents.some(tool => userAgent.toLowerCase().includes(tool))) {
      this.logger.warn(`Suspicious user agent detected: ${userAgent} from ${clientIP}`);
    }
  }

  private validateInput(req: Request): void {
    // Validate query parameters
    if (req.query) {
      this.validateObject(req.query, 'query');
    }

    // Validate request body
    if (req.body) {
      this.validateObject(req.body, 'body');
    }

    // Validate headers for injection attempts
    this.validateHeaders(req.headers);
  }

  private validateObject(obj: any, source: string): void {
    if (typeof obj !== 'object' || obj === null) {
      return;
    }

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        this.validateString(value, `${source}.${key}`);
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (typeof item === 'string') {
            this.validateString(item, `${source}.${key}[${index}]`);
          } else if (typeof item === 'object') {
            this.validateObject(item, `${source}.${key}[${index}]`);
          }
        });
      } else if (typeof value === 'object') {
        this.validateObject(value, `${source}.${key}`);
      }
    }
  }

  private validateString(input: string, field: string): void {
    if (!input || typeof input !== 'string') {
      return;
    }

    // Check length limits
    if (input.length > 10000) {
      throw new HttpException(
        `Input too long in field: ${field}`,
        HttpStatus.BAD_REQUEST
      );
    }

    // Check for null bytes
    if (input.includes('\0')) {
      throw new HttpException(
        `Null byte detected in field: ${field}`,
        HttpStatus.BAD_REQUEST
      );
    }

    // Check for suspicious patterns
    const threats = this.detectThreats(input);
    if (threats.length > 0) {
      this.logger.warn(`Security threat detected in ${field}: ${threats.join(', ')}`);
      throw new HttpException(
        `Invalid input detected in field: ${field}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  private detectThreats(input: string): string[] {
    const threats: string[] = [];
    
    this.suspiciousPatterns.forEach((pattern, index) => {
      if (pattern.test(input)) {
        switch (true) {
          case index < 3:
            threats.push('SQL_INJECTION');
            break;
          case index < 8:
            threats.push('XSS_ATTEMPT');
            break;
          case index < 12:
            threats.push('PATH_TRAVERSAL');
            break;
          default:
            threats.push('COMMAND_INJECTION');
        }
      }
    });

    return [...new Set(threats)]; // Remove duplicates
  }

  private validateHeaders(headers: any): void {
    // Check for suspicious headers
    const suspiciousHeaders = [
      'x-forwarded-host',
      'x-originating-ip',
      'x-cluster-client-ip',
      'x-real-ip'
    ];

    suspiciousHeaders.forEach(header => {
      if (headers[header]) {
        this.logger.warn(`Suspicious header detected: ${header}`);
      }
    });

    // Validate specific headers
    if (headers['content-length']) {
      const contentLength = parseInt(headers['content-length']);
      if (contentLength > 10 * 1024 * 1024) { // 10MB limit
        throw new HttpException(
          'Request too large',
          HttpStatus.PAYLOAD_TOO_LARGE
        );
      }
    }
  }

  private checkSuspiciousActivity(req: Request): void {
    const clientIP = this.getClientIP(req);
    const userAgent = req.headers['user-agent'] || '';
    
    let suspiciousScore = 0;
    const reasons: string[] = [];

    // Check user agent
    if (!userAgent || userAgent.length < 10) {
      suspiciousScore += 20;
      reasons.push('Missing or suspicious user agent');
    }

    // Check for common attack tools
    const attackTools = ['sqlmap', 'nikto', 'nmap', 'masscan', 'zap', 'burp', 'curl', 'wget'];
    if (attackTools.some(tool => userAgent.toLowerCase().includes(tool))) {
      suspiciousScore += 50;
      reasons.push('Security scanning tool detected');
    }

    // Check for suspicious request patterns
    if (req.path.includes('..') || req.path.includes('%2e%2e')) {
      suspiciousScore += 30;
      reasons.push('Path traversal attempt');
    }

    // Check for admin/sensitive paths
    const sensitivePaths = ['/admin', '/config', '/.env', '/backup', '/debug'];
    if (sensitivePaths.some(path => req.path.toLowerCase().includes(path))) {
      suspiciousScore += 25;
      reasons.push('Sensitive path access attempt');
    }

    // If suspicious score is high, block the request
    if (suspiciousScore > 40) {
      this.logger.error(`Blocking suspicious request from ${clientIP}: ${reasons.join(', ')}`);
      throw new HttpException(
        'Request blocked due to suspicious activity',
        HttpStatus.FORBIDDEN
      );
    }

    // Log medium-level suspicious activity
    if (suspiciousScore > 20) {
      this.logger.warn(`Suspicious activity from ${clientIP}: ${reasons.join(', ')}`);
    }
  }

  private addSecurityHeaders(res: Response): void {
    // Prevent XSS attacks
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Referrer policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Permissions policy
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    
    // Remove server information
    res.removeHeader('X-Powered-By');
    
    // Add custom security header
    res.setHeader('X-Security-Scan', crypto.randomBytes(8).toString('hex'));
  }

  private getClientIP(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'] as string;
    const realIP = req.headers['x-real-ip'] as string;
    const remoteAddress = req.connection?.remoteAddress || req.socket?.remoteAddress;
    
    let ip = forwarded?.split(',')[0] || realIP || remoteAddress || 'unknown';
    
    // Clean up IPv6 mapped IPv4 addresses
    if (ip.startsWith('::ffff:')) {
      ip = ip.substring(7);
    }
    
    return ip;
  }
}

/**
 * Input Sanitization Utility
 */
export class InputSanitizer {
  static sanitizeString(input: string): string {
    if (typeof input !== 'string') {
      return input;
    }
    
    // Escape HTML entities
    return validator.escape(input.trim());
  }

  static sanitizeObject(obj: any): any {
    if (typeof obj === 'string') {
      return this.sanitizeString(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }
    
    if (typeof obj === 'object' && obj !== null) {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        (sanitized as any)[this.sanitizeString(key)] = this.sanitizeObject(value);
      }
      return sanitized;
    }
    
    return obj;
  }

  static validateEmail(email: string): boolean {
    return validator.isEmail(email);
  }

  static validateURL(url: string): boolean {
    return validator.isURL(url);
  }

  static validatePhoneNumber(phone: string): boolean {
    return validator.isMobilePhone(phone);
  }

  static validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

