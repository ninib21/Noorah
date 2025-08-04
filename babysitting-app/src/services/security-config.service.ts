import * as SecureStore from 'expo-secure-store';
import * as Location from 'expo-location';
import { Platform } from 'react-native';

export interface SecurityConfig {
  // TLS/HTTPS Settings
  enforceHTTPS: boolean;
  certificatePinning: boolean;
  allowedDomains: string[];
  
  // Encryption Settings
  encryptionEnabled: boolean;
  encryptionAlgorithm: 'AES-256-GCM' | 'AES-256-CBC';
  keyRotationDays: number;
  
  // Geo-fencing Settings
  geoFencingEnabled: boolean;
  allowedRegions: GeoRegion[];
  emergencyRegions: GeoRegion[];
  
  // Session Security
  sessionTimeoutMinutes: number;
  maxFailedAttempts: number;
  lockoutDurationMinutes: number;
  
  // Data Protection
  autoLockEnabled: boolean;
  autoLockDelaySeconds: number;
  dataRetentionDays: number;
  
  // Emergency Settings
  emergencySOSEnabled: boolean;
  emergencyContacts: EmergencyContact[];
  sosTimeoutSeconds: number;
  
  // Audit & Logging
  auditLoggingEnabled: boolean;
  logRetentionDays: number;
  sensitiveDataMasking: boolean;
}

export interface GeoRegion {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters
  type: 'allowed' | 'restricted' | 'emergency';
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  relationship: string;
  priority: number; // 1 = highest priority
}

export interface SecurityAuditLog {
  id: string;
  timestamp: Date;
  event: string;
  userId?: string;
  ipAddress?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  details: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

class SecurityConfigService {
  private readonly CONFIG_KEY = 'security_config';
  private readonly AUDIT_LOG_KEY = 'security_audit_log';
  private readonly FAILED_ATTEMPTS_KEY = 'failed_auth_attempts';
  
  private config: SecurityConfig;

  constructor() {
    this.config = this.getDefaultConfig();
    this.loadConfig();
  }

  /**
   * Get default security configuration
   */
  private getDefaultConfig(): SecurityConfig {
    return {
      // TLS/HTTPS Settings
      enforceHTTPS: true,
      certificatePinning: true,
      allowedDomains: ['api.nannyradar.com', 'firebase.googleapis.com'],
      
      // Encryption Settings
      encryptionEnabled: true,
      encryptionAlgorithm: 'AES-256-GCM',
      keyRotationDays: 30,
      
      // Geo-fencing Settings
      geoFencingEnabled: true,
      allowedRegions: [],
      emergencyRegions: [],
      
      // Session Security
      sessionTimeoutMinutes: 30,
      maxFailedAttempts: 5,
      lockoutDurationMinutes: 15,
      
      // Data Protection
      autoLockEnabled: true,
      autoLockDelaySeconds: 300, // 5 minutes
      dataRetentionDays: 90,
      
      // Emergency Settings
      emergencySOSEnabled: true,
      emergencyContacts: [],
      sosTimeoutSeconds: 30,
      
      // Audit & Logging
      auditLoggingEnabled: true,
      logRetentionDays: 365,
      sensitiveDataMasking: true,
    };
  }

  /**
   * Load configuration from secure storage
   */
  private async loadConfig(): Promise<void> {
    try {
      const configData = await SecureStore.getItemAsync(this.CONFIG_KEY);
      if (configData) {
        this.config = { ...this.config, ...JSON.parse(configData) };
      }
    } catch (error) {
      console.error('Error loading security config:', error);
    }
  }

  /**
   * Save configuration to secure storage
   */
  private async saveConfig(): Promise<void> {
    try {
      await SecureStore.setItemAsync(this.CONFIG_KEY, JSON.stringify(this.config));
    } catch (error) {
      console.error('Error saving security config:', error);
    }
  }

  /**
   * Get current security configuration
   */
  getConfig(): SecurityConfig {
    return { ...this.config };
  }

  /**
   * Update security configuration
   */
  async updateConfig(updates: Partial<SecurityConfig>): Promise<void> {
    this.config = { ...this.config, ...updates };
    await this.saveConfig();
    await this.logAuditEvent('config_updated', { updates });
  }

  /**
   * Check if HTTPS is enforced
   */
  isHTTPSEnforced(): boolean {
    return this.config.enforceHTTPS;
  }

  /**
   * Check if certificate pinning is enabled
   */
  isCertificatePinningEnabled(): boolean {
    return this.config.certificatePinning;
  }

  /**
   * Check if domain is allowed
   */
  isDomainAllowed(domain: string): boolean {
    return this.config.allowedDomains.includes(domain);
  }

  /**
   * Check if encryption is enabled
   */
  isEncryptionEnabled(): boolean {
    return this.config.encryptionEnabled;
  }

  /**
   * Get encryption algorithm
   */
  getEncryptionAlgorithm(): string {
    return this.config.encryptionAlgorithm;
  }

  /**
   * Check if geo-fencing is enabled
   */
  isGeoFencingEnabled(): boolean {
    return this.config.geoFencingEnabled;
  }

  /**
   * Add allowed region
   */
  async addAllowedRegion(region: GeoRegion): Promise<void> {
    this.config.allowedRegions.push(region);
    await this.saveConfig();
    await this.logAuditEvent('region_added', { region });
  }

  /**
   * Remove allowed region
   */
  async removeAllowedRegion(regionId: string): Promise<void> {
    this.config.allowedRegions = this.config.allowedRegions.filter(r => r.id !== regionId);
    await this.saveConfig();
    await this.logAuditEvent('region_removed', { regionId });
  }

  /**
   * Check if current location is in allowed region
   */
  async isLocationAllowed(latitude: number, longitude: number): Promise<boolean> {
    if (!this.config.geoFencingEnabled || this.config.allowedRegions.length === 0) {
      return true; // No restrictions
    }

    for (const region of this.config.allowedRegions) {
      const distance = this.calculateDistance(
        latitude,
        longitude,
        region.latitude,
        region.longitude
      );
      
      if (distance <= region.radius) {
        return true;
      }
    }

    await this.logAuditEvent('location_violation', {
      latitude,
      longitude,
      allowedRegions: this.config.allowedRegions,
    });

    return false;
  }

  /**
   * Calculate distance between two points (Haversine formula)
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Get session timeout in minutes
   */
  getSessionTimeout(): number {
    return this.config.sessionTimeoutMinutes;
  }

  /**
   * Check if user is locked out
   */
  async isUserLockedOut(userId: string): Promise<boolean> {
    try {
      const attemptsData = await SecureStore.getItemAsync(`${this.FAILED_ATTEMPTS_KEY}_${userId}`);
      if (!attemptsData) return false;

      const attempts = JSON.parse(attemptsData);
      const now = Date.now();
      const lockoutEnd = attempts.lastAttempt + (this.config.lockoutDurationMinutes * 60 * 1000);

      return attempts.count >= this.config.maxFailedAttempts && now < lockoutEnd;
    } catch (error) {
      console.error('Error checking lockout status:', error);
      return false;
    }
  }

  /**
   * Record failed authentication attempt
   */
  async recordFailedAttempt(userId: string): Promise<void> {
    try {
      const attemptsData = await SecureStore.getItemAsync(`${this.FAILED_ATTEMPTS_KEY}_${userId}`);
      const now = Date.now();
      
      let attempts = attemptsData ? JSON.parse(attemptsData) : { count: 0, lastAttempt: 0 };
      
      // Reset if lockout period has passed
      const lockoutEnd = attempts.lastAttempt + (this.config.lockoutDurationMinutes * 60 * 1000);
      if (now > lockoutEnd) {
        attempts = { count: 0, lastAttempt: 0 };
      }
      
      attempts.count++;
      attempts.lastAttempt = now;
      
      await SecureStore.setItemAsync(`${this.FAILED_ATTEMPTS_KEY}_${userId}`, JSON.stringify(attempts));
      
      await this.logAuditEvent('failed_auth_attempt', {
        userId,
        attemptCount: attempts.count,
        ipAddress: 'unknown', // Would be set by backend
      });
    } catch (error) {
      console.error('Error recording failed attempt:', error);
    }
  }

  /**
   * Reset failed attempts for user
   */
  async resetFailedAttempts(userId: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(`${this.FAILED_ATTEMPTS_KEY}_${userId}`);
    } catch (error) {
      console.error('Error resetting failed attempts:', error);
    }
  }

  /**
   * Check if auto-lock is enabled
   */
  isAutoLockEnabled(): boolean {
    return this.config.autoLockEnabled;
  }

  /**
   * Get auto-lock delay in seconds
   */
  getAutoLockDelay(): number {
    return this.config.autoLockDelaySeconds;
  }

  /**
   * Check if emergency SOS is enabled
   */
  isEmergencySOSEnabled(): boolean {
    return this.config.emergencySOSEnabled;
  }

  /**
   * Get emergency contacts
   */
  getEmergencyContacts(): EmergencyContact[] {
    return [...this.config.emergencyContacts];
  }

  /**
   * Add emergency contact
   */
  async addEmergencyContact(contact: EmergencyContact): Promise<void> {
    this.config.emergencyContacts.push(contact);
    this.config.emergencyContacts.sort((a, b) => a.priority - b.priority);
    await this.saveConfig();
    await this.logAuditEvent('emergency_contact_added', { contact });
  }

  /**
   * Remove emergency contact
   */
  async removeEmergencyContact(contactId: string): Promise<void> {
    this.config.emergencyContacts = this.config.emergencyContacts.filter(c => c.id !== contactId);
    await this.saveConfig();
    await this.logAuditEvent('emergency_contact_removed', { contactId });
  }

  /**
   * Get SOS timeout in seconds
   */
  getSOSTimeout(): number {
    return this.config.sosTimeoutSeconds;
  }

  /**
   * Check if audit logging is enabled
   */
  isAuditLoggingEnabled(): boolean {
    return this.config.auditLoggingEnabled;
  }

  /**
   * Log audit event
   */
  async logAuditEvent(event: string, details: any, severity: 'low' | 'medium' | 'high' | 'critical' = 'low'): Promise<void> {
    if (!this.config.auditLoggingEnabled) return;

    try {
      const location = await this.getCurrentLocation();
      
      const logEntry: SecurityAuditLog = {
        id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        event,
        location,
        details: this.maskSensitiveData(details),
        severity,
      };

      const logsData = await SecureStore.getItemAsync(this.AUDIT_LOG_KEY);
      const logs: SecurityAuditLog[] = logsData ? JSON.parse(logsData) : [];
      
      logs.push(logEntry);
      
      // Clean up old logs
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.config.logRetentionDays);
      const filteredLogs = logs.filter(log => new Date(log.timestamp) > cutoffDate);
      
      await SecureStore.setItemAsync(this.AUDIT_LOG_KEY, JSON.stringify(filteredLogs));
    } catch (error) {
      console.error('Error logging audit event:', error);
    }
  }

  /**
   * Get current location
   */
  private async getCurrentLocation(): Promise<{ latitude: number; longitude: number } | undefined> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return undefined;

      const location = await Location.getCurrentPositionAsync({});
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error('Error getting location:', error);
      return undefined;
    }
  }

  /**
   * Mask sensitive data in audit logs
   */
  private maskSensitiveData(data: any): any {
    if (!this.config.sensitiveDataMasking) return data;

    const sensitiveFields = ['password', 'token', 'secret', 'key', 'ssn', 'creditCard'];
    const masked = { ...data };

    for (const field of sensitiveFields) {
      if (masked[field]) {
        masked[field] = '***MASKED***';
      }
    }

    return masked;
  }

  /**
   * Get audit logs
   */
  async getAuditLogs(): Promise<SecurityAuditLog[]> {
    try {
      const logsData = await SecureStore.getItemAsync(this.AUDIT_LOG_KEY);
      return logsData ? JSON.parse(logsData) : [];
    } catch (error) {
      console.error('Error getting audit logs:', error);
      return [];
    }
  }

  /**
   * Clear audit logs
   */
  async clearAuditLogs(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(this.AUDIT_LOG_KEY);
      await this.logAuditEvent('audit_logs_cleared', {}, 'medium');
    } catch (error) {
      console.error('Error clearing audit logs:', error);
    }
  }

  /**
   * Get security status summary
   */
  getSecurityStatus(): {
    httpsEnforced: boolean;
    encryptionEnabled: boolean;
    geoFencingEnabled: boolean;
    mfaEnabled: boolean;
    auditLoggingEnabled: boolean;
    emergencyContactsCount: number;
    allowedRegionsCount: number;
  } {
    return {
      httpsEnforced: this.config.enforceHTTPS,
      encryptionEnabled: this.config.encryptionEnabled,
      geoFencingEnabled: this.config.geoFencingEnabled,
      mfaEnabled: false, // Would be checked separately
      auditLoggingEnabled: this.config.auditLoggingEnabled,
      emergencyContactsCount: this.config.emergencyContacts.length,
      allowedRegionsCount: this.config.allowedRegions.length,
    };
  }
}

export default new SecurityConfigService(); 