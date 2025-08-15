import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { GPSTrackingService, GPSLocation } from './gps-tracking.service';
import { EncryptionService } from './encryption.service';

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  relationship: string;
  isPrimary: boolean;
}

export interface EmergencyAlert {
  id: string;
  sessionId: string;
  userId: string;
  userType: 'parent' | 'sitter';
  reason: string;
  location: GPSLocation;
  timestamp: number;
  status: 'active' | 'resolved' | 'false_alarm';
  metadata?: any;
  emergencyContacts: EmergencyContact[];
  responseTime?: number;
  resolvedBy?: string;
  resolvedAt?: number;
}

export interface EmergencyResponse {
  alertId: string;
  responderId: string;
  responseType: 'acknowledge' | 'resolve' | 'escalate';
  timestamp: number;
  notes?: string;
}

export class EmergencySOSService {
  private static isEmergencyActive = false;
  private static emergencyTimeout: NodeJS.Timeout | null = null;
  private static emergencyCallbacks: {
    onEmergencyTriggered?: (alert: EmergencyAlert) => void;
    onEmergencyResolved?: (alert: EmergencyAlert) => void;
    onEmergencyEscalated?: (alert: EmergencyAlert) => void;
  } = {};

  /**
   * Initialize emergency SOS service
   */
  static async initialize(): Promise<void> {
    // Configure notifications for emergency alerts
    await Notifications.setNotificationChannelAsync('emergency', {
      name: 'Emergency Alerts',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250, 250, 250],
      lightColor: '#FF0000',
      sound: 'emergency_alert.wav',
    });

    // Set up GPS tracking emergency callbacks
    GPSTrackingService.onEmergency((location, reason) => {
      this.handleEmergencyTrigger(reason, location);
    });
  }

  /**
   * Trigger emergency SOS
   */
  static async triggerSOS(reason: string = 'manual_sos'): Promise<EmergencyAlert | null> {
    try {
      if (this.isEmergencyActive) {
        console.log('Emergency already active');
        return null;
      }

      // Get current location
      const location = await GPSTrackingService.getCurrentLocation();
      if (!location) {
        throw new Error('Unable to get current location');
      }

      // Create emergency alert
      const alert: EmergencyAlert = {
        id: await this.generateAlertId(),
        sessionId: GPSTrackingService.getCurrentSession()?.id || '',
        userId: await this.getCurrentUserId(),
        userType: await this.getCurrentUserType(),
        reason,
        location,
        timestamp: Date.now(),
        status: 'active',
        emergencyContacts: await this.getEmergencyContacts(),
      };

      // Set emergency as active
      this.isEmergencyActive = true;

      // Trigger haptic feedback
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      // Send emergency alert
      await this.sendEmergencyAlert(alert);

      // Set timeout for automatic escalation (5 minutes)
      this.emergencyTimeout = setTimeout(() => {
        this.escalateEmergency(alert);
      }, 5 * 60 * 1000);

      // Call emergency callback
      if (this.emergencyCallbacks.onEmergencyTriggered) {
        this.emergencyCallbacks.onEmergencyTriggered(alert);
      }

      console.log('Emergency SOS triggered:', alert.id);
      return alert;
    } catch (error) {
      console.error('Failed to trigger SOS:', error);
      return null;
    }
  }

  /**
   * Handle emergency trigger from GPS tracking
   */
  private static async handleEmergencyTrigger(reason: string, location: GPSLocation): Promise<void> {
    const alert: EmergencyAlert = {
      id: await this.generateAlertId(),
      sessionId: GPSTrackingService.getCurrentSession()?.id || '',
      userId: await this.getCurrentUserId(),
      userType: await this.getCurrentUserType(),
      reason,
      location,
      timestamp: Date.now(),
      status: 'active',
      emergencyContacts: await this.getEmergencyContacts(),
    };

    await this.sendEmergencyAlert(alert);
  }

  /**
   * Resolve emergency alert
   */
  static async resolveEmergency(alertId: string, resolvedBy: string, notes?: string): Promise<boolean> {
    try {
      const alert = await this.getEmergencyAlert(alertId);
      if (!alert) {
        throw new Error('Emergency alert not found');
      }

      alert.status = 'resolved';
      alert.resolvedBy = resolvedBy;
      alert.resolvedAt = Date.now();
      alert.responseTime = alert.resolvedAt - alert.timestamp;

      // Clear emergency state
      this.isEmergencyActive = false;
      if (this.emergencyTimeout) {
        clearTimeout(this.emergencyTimeout);
        this.emergencyTimeout = null;
      }

      // Send resolution to server
      await this.sendEmergencyResolution(alert, notes);

      // Call resolution callback
      if (this.emergencyCallbacks.onEmergencyResolved) {
        this.emergencyCallbacks.onEmergencyResolved(alert);
      }

      console.log('Emergency resolved:', alertId);
      return true;
    } catch (error) {
      console.error('Failed to resolve emergency:', error);
      return false;
    }
  }

  /**
   * Escalate emergency to authorities
   */
  static async escalateEmergency(alert: EmergencyAlert): Promise<void> {
    try {
      alert.status = 'active'; // Keep active for escalation
      
      // Send escalation to server
      await this.sendEmergencyEscalation(alert);

      // Call escalation callback
      if (this.emergencyCallbacks.onEmergencyEscalated) {
        this.emergencyCallbacks.onEmergencyEscalated(alert);
      }

      console.log('Emergency escalated:', alert.id);
    } catch (error) {
      console.error('Failed to escalate emergency:', error);
    }
  }

  /**
   * Mark emergency as false alarm
   */
  static async markFalseAlarm(alertId: string): Promise<boolean> {
    try {
      const alert = await this.getEmergencyAlert(alertId);
      if (!alert) {
        throw new Error('Emergency alert not found');
      }

      alert.status = 'false_alarm';
      alert.resolvedAt = Date.now();
      alert.responseTime = alert.resolvedAt - alert.timestamp;

      // Clear emergency state
      this.isEmergencyActive = false;
      if (this.emergencyTimeout) {
        clearTimeout(this.emergencyTimeout);
        this.emergencyTimeout = null;
      }

      // Send false alarm notification to server
      await this.sendFalseAlarmNotification(alert);

      console.log('Emergency marked as false alarm:', alertId);
      return true;
    } catch (error) {
      console.error('Failed to mark false alarm:', error);
      return false;
    }
  }

  /**
   * Send emergency alert to server
   */
  private static async sendEmergencyAlert(alert: EmergencyAlert): Promise<void> {
    try {
      // Encrypt alert data
      const key = await EncryptionService.generateKey();
      const encryptedData = await EncryptionService.encrypt(
        JSON.stringify(alert),
        key
      );

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/emergency/alert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
        body: JSON.stringify({
          encryptedAlert: encryptedData,
          priority: 'high',
          requiresImmediateResponse: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send emergency alert');
      }

      // Send push notifications to emergency contacts
      await this.notifyEmergencyContacts(alert);
    } catch (error) {
      console.error('Failed to send emergency alert:', error);
    }
  }

  /**
   * Send emergency resolution to server
   */
  private static async sendEmergencyResolution(alert: EmergencyAlert, notes?: string): Promise<void> {
    try {
      const resolution: EmergencyResponse = {
        alertId: alert.id,
        responderId: alert.resolvedBy || '',
        responseType: 'resolve',
        timestamp: Date.now(),
        notes,
      };

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/emergency/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
        body: JSON.stringify(resolution),
      });

      if (!response.ok) {
        throw new Error('Failed to send emergency resolution');
      }
    } catch (error) {
      console.error('Failed to send emergency resolution:', error);
    }
  }

  /**
   * Send emergency escalation to server
   */
  private static async sendEmergencyEscalation(alert: EmergencyAlert): Promise<void> {
    try {
      const escalation: EmergencyResponse = {
        alertId: alert.id,
        responderId: 'system',
        responseType: 'escalate',
        timestamp: Date.now(),
        notes: 'Emergency escalated due to no response within 5 minutes',
      };

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/emergency/escalate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
        body: JSON.stringify(escalation),
      });

      if (!response.ok) {
        throw new Error('Failed to send emergency escalation');
      }
    } catch (error) {
      console.error('Failed to send emergency escalation:', error);
    }
  }

  /**
   * Send false alarm notification
   */
  private static async sendFalseAlarmNotification(alert: EmergencyAlert): Promise<void> {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/emergency/false-alarm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
        body: JSON.stringify({
          alertId: alert.id,
          timestamp: Date.now(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send false alarm notification');
      }
    } catch (error) {
      console.error('Failed to send false alarm notification:', error);
    }
  }

  /**
   * Notify emergency contacts
   */
  private static async notifyEmergencyContacts(alert: EmergencyAlert): Promise<void> {
    try {
      for (const contact of alert.emergencyContacts) {
        // Send push notification
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '🚨 EMERGENCY ALERT',
            body: `Emergency SOS triggered by ${alert.userType}. Location: ${alert.location.latitude.toFixed(4)}, ${alert.location.longitude.toFixed(4)}`,
            data: {
              alertId: alert.id,
              contactId: contact.id,
              type: 'emergency_alert',
            },
            sound: 'emergency_alert.wav',
            priority: Notifications.AndroidNotificationPriority.MAX,
          },
          trigger: null, // Send immediately
        });

        // Send SMS (if implemented)
        await this.sendEmergencySMS(contact.phone, alert);
      }
    } catch (error) {
      console.error('Failed to notify emergency contacts:', error);
    }
  }

  /**
   * Send emergency SMS
   */
  private static async sendEmergencySMS(phone: string, alert: EmergencyAlert): Promise<void> {
    try {
      // Implement SMS sending logic here
      // This would typically use a service like Twilio
      console.log(`Sending emergency SMS to ${phone}`);
    } catch (error) {
      console.error('Failed to send emergency SMS:', error);
    }
  }

  /**
   * Set emergency callbacks
   */
  static setCallbacks(callbacks: {
    onEmergencyTriggered?: (alert: EmergencyAlert) => void;
    onEmergencyResolved?: (alert: EmergencyAlert) => void;
    onEmergencyEscalated?: (alert: EmergencyAlert) => void;
  }): void {
    this.emergencyCallbacks = callbacks;
  }

  /**
   * Check if emergency is active
   */
  static isEmergencyActive(): boolean {
    return this.isEmergencyActive;
  }

  /**
   * Get current emergency alert
   */
  static async getCurrentEmergencyAlert(): Promise<EmergencyAlert | null> {
    // Implement logic to get current emergency alert from server or local storage
    return null;
  }

  /**
   * Generate unique alert ID
   */
  private static async generateAlertId(): Promise<string> {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `emergency_${timestamp}_${random}`;
  }

  /**
   * Get current user ID
   */
  private static async getCurrentUserId(): Promise<string> {
    // Implement logic to get current user ID
    return 'user_id';
  }

  /**
   * Get current user type
   */
  private static async getCurrentUserType(): Promise<'parent' | 'sitter'> {
    // Implement logic to get current user type
    return 'parent';
  }

  /**
   * Get emergency contacts
   */
  private static async getEmergencyContacts(): Promise<EmergencyContact[]> {
    // Implement logic to get emergency contacts from user profile
    return [
      {
        id: 'contact_1',
        name: 'Emergency Contact 1',
        phone: '+1234567890',
        relationship: 'Spouse',
        isPrimary: true,
      },
    ];
  }

  /**
   * Get emergency alert by ID
   */
  private static async getEmergencyAlert(alertId: string): Promise<EmergencyAlert | null> {
    // Implement logic to get emergency alert from server or local storage
    return null;
  }

  /**
   * Get authentication token
   */
  private static async getAuthToken(): Promise<string> {
    return await EncryptionService.secureRetrieve('auth_token') || '';
  }

  /**
   * Test emergency system
   */
  static async testEmergencySystem(): Promise<boolean> {
    try {
      const testAlert = await this.triggerSOS('test_emergency');
      if (testAlert) {
        await this.markFalseAlarm(testAlert.id);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Emergency system test failed:', error);
      return false;
    }
  }
} 