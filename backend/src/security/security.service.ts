import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Booking } from '../entities/booking.entity';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';

export interface SecurityAlert {
  id: string;
  type: 'suspicious_activity' | 'location_violation' | 'emergency_sos' | 'fraud_detection';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId: string;
  bookingId?: string;
  description: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  metadata: any;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export interface AnomalyDetection {
  userId: string;
  anomalyType: 'location' | 'behavior' | 'payment' | 'communication';
  confidence: number;
  details: any;
  timestamp: Date;
}

export interface SecurityAudit {
  id: string;
  userId: string;
  action: string;
  resource: string;
  ipAddress: string;
  userAgent: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  timestamp: Date;
  success: boolean;
  metadata: any;
}

@Injectable()
export class SecurityService {
  private readonly logger = new Logger(SecurityService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
  ) {}

  /**
   * Detect anomalies in user behavior
   */
  async detectAnomalies(userId: string, action: string, data: any): Promise<AnomalyDetection[]> {
    const anomalies: AnomalyDetection[] = [];

    // Location anomaly detection
    if (data.location) {
      const locationAnomaly = await this.detectLocationAnomaly(userId, data.location);
      if (locationAnomaly) anomalies.push(locationAnomaly);
    }

    // Behavior anomaly detection
    const behaviorAnomaly = await this.detectBehaviorAnomaly(userId, action, data);
    if (behaviorAnomaly) anomalies.push(behaviorAnomaly);

    // Payment anomaly detection
    if (action === 'payment') {
      const paymentAnomaly = await this.detectPaymentAnomaly(userId, data);
      if (paymentAnomaly) anomalies.push(paymentAnomaly);
    }

    // Communication anomaly detection
    if (action === 'message') {
      const communicationAnomaly = await this.detectCommunicationAnomaly(userId, data);
      if (communicationAnomaly) anomalies.push(communicationAnomaly);
    }

    return anomalies;
  }

  /**
   * Generate security alerts based on anomalies
   */
  async generateSecurityAlert(anomaly: AnomalyDetection): Promise<SecurityAlert> {
    const alert: SecurityAlert = {
      id: crypto.randomUUID(),
      type: this.mapAnomalyToAlertType(anomaly.anomalyType),
      severity: this.calculateAlertSeverity(anomaly),
      userId: anomaly.userId,
      description: this.generateAlertDescription(anomaly),
      metadata: anomaly.details,
      timestamp: new Date(),
      resolved: false,
    };

    // Log the alert
    this.logger.warn(`Security alert generated: ${alert.type} for user ${alert.userId}`);

    // Send notifications if critical
    if (alert.severity === 'critical') {
      await this.sendCriticalAlertNotification(alert);
    }

    return alert;
  }

  /**
   * Validate device security
   */
  async validateDeviceSecurity(deviceInfo: any): Promise<{
    isSecure: boolean;
    warnings: string[];
    riskLevel: 'low' | 'medium' | 'high';
  }> {
    const warnings: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' = 'low';

    // Check for jailbroken/rooted devices
    if (deviceInfo.isJailbroken || deviceInfo.isRooted) {
      warnings.push('Device appears to be jailbroken/rooted');
      riskLevel = 'high';
    }

    // Check for outdated OS
    if (deviceInfo.osVersion && this.isOutdatedOS(deviceInfo.osVersion)) {
      warnings.push('Operating system is outdated');
      riskLevel = riskLevel === 'low' ? 'medium' : riskLevel;
    }

    // Check for suspicious apps
    if (deviceInfo.suspiciousApps && deviceInfo.suspiciousApps.length > 0) {
      warnings.push('Suspicious applications detected');
      riskLevel = 'medium';
    }

    // Check for VPN usage (could indicate location spoofing)
    if (deviceInfo.isUsingVPN) {
      warnings.push('VPN usage detected');
      riskLevel = riskLevel === 'low' ? 'medium' : riskLevel;
    }

    return {
      isSecure: riskLevel === 'low',
      warnings,
      riskLevel,
    };
  }

  /**
   * Monitor session security
   */
  async monitorSessionSecurity(bookingId: string, sessionData: any): Promise<{
    isSecure: boolean;
    alerts: SecurityAlert[];
  }> {
    const alerts: SecurityAlert[] = [];

    // Check for location violations
    if (sessionData.location) {
      const locationAlert = await this.checkLocationViolation(bookingId, sessionData.location);
      if (locationAlert) alerts.push(locationAlert);
    }

    // Check for unusual activity patterns
    const activityAlert = await this.checkActivityPatterns(bookingId, sessionData);
    if (activityAlert) alerts.push(activityAlert);

    // Check for communication anomalies
    const communicationAlert = await this.checkCommunicationAnomalies(bookingId, sessionData);
    if (communicationAlert) alerts.push(communicationAlert);

    return {
      isSecure: alerts.length === 0,
      alerts,
    };
  }

  /**
   * Generate blockchain audit trail
   */
  async generateAuditTrail(event: any): Promise<string> {
    const auditData = {
      eventId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      eventType: event.type,
      userId: event.userId,
      bookingId: event.bookingId,
      dataHash: crypto.createHash('sha256').update(JSON.stringify(event.data)).digest('hex'),
      previousHash: event.previousHash || '0000000000000000000000000000000000000000000000000000000000000000',
    };

    // Create blockchain-style hash
    const blockData = JSON.stringify(auditData);
    const hash = crypto.createHash('sha256').update(blockData).digest('hex');

    // Store audit trail (in production, this would go to a blockchain or immutable log)
    this.logger.log(`Audit trail generated: ${hash}`);

    return hash;
  }

  /**
   * Encrypt sensitive data
   */
  async encryptData(data: string, key?: string): Promise<{
    encryptedData: string;
    iv: string;
    keyId: string;
  }> {
    const encryptionKey = key || process.env.ENCRYPTION_KEY || crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipher('aes-256-gcm', encryptionKey);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encryptedData: encrypted + authTag.toString('hex'),
      iv: iv.toString('hex'),
      keyId: crypto.createHash('sha256').update(encryptionKey).digest('hex').substring(0, 16),
    };
  }

  /**
   * Decrypt sensitive data
   */
  async decryptData(encryptedData: string, iv: string, key?: string): Promise<string> {
    const encryptionKey = key || process.env.ENCRYPTION_KEY;
    const authTagLength = 16;
    
    const encrypted = encryptedData.slice(0, -authTagLength * 2);
    const authTag = Buffer.from(encryptedData.slice(-authTagLength * 2), 'hex');
    
    const decipher = crypto.createDecipher('aes-256-gcm', encryptionKey);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Generate secure tokens
   */
  async generateSecureToken(userId: string, purpose: string): Promise<{
    token: string;
    expiresAt: Date;
  }> {
    const payload = {
      userId,
      purpose,
      timestamp: Date.now(),
      random: crypto.randomBytes(16).toString('hex'),
    };

    const token = crypto.createHash('sha256')
      .update(JSON.stringify(payload) + process.env.JWT_SECRET)
      .digest('hex');

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    return { token, expiresAt };
  }

  /**
   * Validate secure token
   */
  async validateSecureToken(token: string, userId: string, purpose: string): Promise<boolean> {
    // In production, this would validate against stored tokens
    // For now, we'll use a simple hash validation
    const expectedToken = crypto.createHash('sha256')
      .update(userId + purpose + process.env.JWT_SECRET)
      .digest('hex');

    return token === expectedToken;
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    // In a real implementation, you'd validate against a database
    return apiKey === process.env.API_KEY;
  }

  async validateRateLimit(userId: string, action: string): Promise<boolean> {
    // Simple rate limiting implementation
    const key = `rate_limit:${userId}:${action}`;
    // In a real implementation, you'd use a cache service
    console.log(`Rate limit check for ${userId}:${action}`);
    return true; // Always allow for now
  }

  // Private helper methods

  private async detectLocationAnomaly(userId: string, location: any): Promise<AnomalyDetection | null> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) return null;

    // Check if location is too far from user's usual location
    // In a real implementation, you'd check user's stored location
    console.log('Location anomaly detection for user:', userId);
    return null;
  }

  private async detectBehaviorAnomaly(userId: string, action: string, data: any): Promise<AnomalyDetection | null> {
    // Check for unusual activity patterns
    const recentActions = await this.getRecentUserActions(userId, 24); // Last 24 hours
    
    const actionCount = recentActions.filter(a => a.action === action).length;
    
    // If user performs same action more than 10 times in 24 hours
    if (actionCount > 10) {
      return {
        userId,
        anomalyType: 'behavior',
        confidence: 0.7,
        details: {
          action,
          count: actionCount,
          timeWindow: '24h',
        },
        timestamp: new Date(),
      };
    }

    return null;
  }

  private async detectPaymentAnomaly(userId: string, data: any): Promise<AnomalyDetection | null> {
    // Check for unusual payment patterns
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) return null;

    // Check if payment amount is unusually high
    if (data.amount > 1000) { // More than $1000
      return {
        userId,
        anomalyType: 'payment',
        confidence: 0.6,
        details: {
          amount: data.amount,
          threshold: 1000,
        },
        timestamp: new Date(),
      };
    }

    return null;
  }

  private async detectCommunicationAnomaly(userId: string, data: any): Promise<AnomalyDetection | null> {
    // Check for suspicious communication patterns
    const messageContent = data.message?.toLowerCase() || '';
    
    // Check for suspicious keywords
    const suspiciousKeywords = ['password', 'credit card', 'ssn', 'social security'];
    const foundKeywords = suspiciousKeywords.filter(keyword => 
      messageContent.includes(keyword)
    );

    if (foundKeywords.length > 0) {
      return {
        userId,
        anomalyType: 'communication',
        confidence: 0.8,
        details: {
          suspiciousKeywords: foundKeywords,
          messageLength: messageContent.length,
        },
        timestamp: new Date(),
      };
    }

    return null;
  }

  private mapAnomalyToAlertType(anomalyType: string): SecurityAlert['type'] {
    switch (anomalyType) {
      case 'location':
        return 'location_violation';
      case 'behavior':
        return 'suspicious_activity';
      case 'payment':
        return 'fraud_detection';
      case 'communication':
        return 'suspicious_activity';
      default:
        return 'suspicious_activity';
    }
  }

  private calculateAlertSeverity(anomaly: AnomalyDetection): SecurityAlert['severity'] {
    if (anomaly.confidence > 0.9) return 'critical';
    if (anomaly.confidence > 0.7) return 'high';
    if (anomaly.confidence > 0.5) return 'medium';
    return 'low';
  }

  private generateAlertDescription(anomaly: AnomalyDetection): string {
    switch (anomaly.anomalyType) {
      case 'location':
        return `Unusual location activity detected for user ${anomaly.userId}`;
      case 'behavior':
        return `Unusual behavior pattern detected for user ${anomaly.userId}`;
      case 'payment':
        return `Suspicious payment activity detected for user ${anomaly.userId}`;
      case 'communication':
        return `Suspicious communication detected for user ${anomaly.userId}`;
      default:
        return `Security anomaly detected for user ${anomaly.userId}`;
    }
  }

  private async sendCriticalAlertNotification(alert: SecurityAlert): Promise<void> {
    // In production, this would send notifications to security team
    this.logger.error(`CRITICAL SECURITY ALERT: ${alert.type} for user ${alert.userId}`);
    
    // Send to admin dashboard
    // Send SMS/email to security team
    // Log to security monitoring system
  }

  private isOutdatedOS(version: string): boolean {
    // Simple OS version check (in production, this would be more sophisticated)
    const versionParts = version.split('.');
    const majorVersion = parseInt(versionParts[0]);
    
    // Consider iOS < 14 or Android < 10 as outdated
    return majorVersion < 10;
  }

  private async checkLocationViolation(bookingId: string, location: any): Promise<SecurityAlert | null> {
    const booking = await this.bookingRepository.findOne({ 
      where: { id: bookingId },
      relations: ['parent', 'sitter'],
    });

    if (!booking) return null;

    // Check if sitter is within reasonable distance of booking location
    // In a real implementation, you'd calculate distance
    console.log('Location violation check for booking:', bookingId);
    return null;
  }

  private async checkActivityPatterns(bookingId: string, sessionData: any): Promise<SecurityAlert | null> {
    // Check for unusual activity patterns during session
    const activities = sessionData.activities || [];
    
    // Check for suspicious patterns
    if (activities.length === 0 && sessionData.duration > 60) {
      // No activities recorded for a long session
      return {
        id: crypto.randomUUID(),
        type: 'suspicious_activity',
        severity: 'medium',
        userId: sessionData.sitterId,
        bookingId,
        description: 'No activities recorded during extended session',
        metadata: { duration: sessionData.duration, activities },
        timestamp: new Date(),
        resolved: false,
      };
    }

    return null;
  }

  private async checkCommunicationAnomalies(bookingId: string, sessionData: any): Promise<SecurityAlert | null> {
    // Check for unusual communication patterns
    const messages = sessionData.messages || [];
    
    // Check for excessive messaging
    if (messages.length > 50) {
      return {
        id: crypto.randomUUID(),
        type: 'suspicious_activity',
        severity: 'medium',
        userId: sessionData.sitterId,
        bookingId,
        description: 'Excessive messaging detected during session',
        metadata: { messageCount: messages.length },
        timestamp: new Date(),
        resolved: false,
      };
    }

    return null;
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private async getRecentUserActions(userId: string, hours: number): Promise<any[]> {
    // In production, this would query an audit log
    // For now, return empty array
    return [];
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  async logSecurityEvent(event: string, details: any = {}): Promise<void> {
    const securityEvent = {
      event,
      timestamp: new Date(),
      details,
      severity: this.determineEventSeverity(event),
    };

    // In a real implementation, you'd save this to a security log
    console.log('Security event logged:', securityEvent);
  }

  private determineEventSeverity(event: string): 'low' | 'medium' | 'high' | 'critical' {
    const criticalEvents = ['failed_login', 'suspicious_activity', 'data_breach'];
    const highEvents = ['multiple_failed_logins', 'unusual_access_pattern'];
    const mediumEvents = ['password_change', 'profile_update'];

    if (criticalEvents.includes(event)) return 'critical';
    if (highEvents.includes(event)) return 'high';
    if (mediumEvents.includes(event)) return 'medium';
    return 'low';
  }

  private async validateBookingLocation(booking: any, userLocation: any): Promise<boolean> {
    // Validate that booking location is reasonable for the user
    if (!booking.location || !userLocation) return true;

    // In a real implementation, you'd calculate distance
    console.log('Booking location validation:', { bookingId: booking.id });
    return true;
  }

  private async detectBookingAnomalies(booking: any, user: any): Promise<string[]> {
    const anomalies = [];

    // Check for unusual booking times
    const bookingTime = new Date(booking.startTime);
    const currentTime = new Date();
    const timeDiff = bookingTime.getTime() - currentTime.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    if (hoursDiff < 1) {
      anomalies.push('Very short notice booking');
    }

    if (hoursDiff > 168) { // More than a week in advance
      anomalies.push('Very long advance booking');
    }

    // Check for unusual booking duration
    const durationHours = booking.duration / 60; // Assuming duration is in minutes
    if (durationHours > 12) {
      anomalies.push('Unusually long booking duration');
    }

    // Check for unusual booking frequency
    const recentBookings = await this.getRecentUserBookings(user.id, 7); // Last 7 days
    if (recentBookings.length > 5) {
      anomalies.push('High frequency of bookings');
    }

    return anomalies;
  }

  private async getRecentUserBookings(userId: string, days: number): Promise<any[]> {
    // In a real implementation, you'd query the database
    return [];
  }
} 