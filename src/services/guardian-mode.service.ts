import { Platform } from 'react-native';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Alert } from 'react-native';

export interface GuardianModeConfig {
  enabled: boolean;
  checkInInterval: number; // minutes
  escalationDelay: number; // minutes
  emergencyContacts: string[];
  autoEscalation: boolean;
  silentMode: boolean;
  geofenceRadius: number; // meters
}

export interface CheckInEvent {
  id: string;
  timestamp: Date;
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  status: 'success' | 'missed' | 'escalated';
  sitterResponse?: string;
  escalatedTo?: string[];
}

export interface EscalationProtocol {
  level: 1 | 2 | 3;
  delay: number; // minutes
  actions: string[];
  contacts: string[];
  autoCall: boolean;
}

class GuardianModeService {
  private config: GuardianModeConfig;
  private checkInTimer: NodeJS.Timeout | null = null;
  private escalationTimer: NodeJS.Timeout | null = null;
  private isActive = false;
  private currentSessionId: string | null = null;
  private checkInHistory: CheckInEvent[] = [];

  constructor() {
    this.config = {
      enabled: false,
      checkInInterval: 30, // 30 minutes
      escalationDelay: 5, // 5 minutes
      emergencyContacts: [],
      autoEscalation: true,
      silentMode: false,
      geofenceRadius: 100, // 100 meters
    };
  }

  /**
   * Initialize Guardian Mode for a session
   */
  async initialize(sessionId: string, config: Partial<GuardianModeConfig> = {}): Promise<void> {
    try {
      this.currentSessionId = sessionId;
      this.config = { ...this.config, ...config };
      this.isActive = true;

      // Request permissions
      await this.requestPermissions();

      // Start the first check-in
      await this.scheduleNextCheckIn();

      console.log('Guardian Mode initialized for session:', sessionId);
    } catch (error) {
      console.error('Failed to initialize Guardian Mode:', error);
      throw error;
    }
  }

  /**
   * Request necessary permissions
   */
  private async requestPermissions(): Promise<void> {
    const locationPermission = await Location.requestForegroundPermissionsAsync();
    const notificationPermission = await Notifications.requestPermissionsAsync();

    if (!locationPermission.granted) {
      throw new Error('Location permission required for Guardian Mode');
    }

    if (!notificationPermission.granted) {
      throw new Error('Notification permission required for Guardian Mode');
    }
  }

  /**
   * Schedule the next check-in
   */
  private async scheduleNextCheckIn(): Promise<void> {
    if (!this.isActive) return;

    this.checkInTimer = setTimeout(async () => {
      await this.performCheckIn();
    }, this.config.checkInInterval * 60 * 1000);
  }

  /**
   * Perform a check-in
   */
  async performCheckIn(): Promise<CheckInEvent> {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const checkInEvent: CheckInEvent = {
        id: `checkin_${Date.now()}`,
        timestamp: new Date(),
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy,
        },
        status: 'success',
      };

      this.checkInHistory.push(checkInEvent);

      // Send check-in notification to parent
      await this.sendCheckInNotification(checkInEvent);

      // Schedule next check-in
      await this.scheduleNextCheckIn();

      return checkInEvent;
    } catch (error) {
      console.error('Check-in failed:', error);
      
      const failedEvent: CheckInEvent = {
        id: `checkin_${Date.now()}`,
        timestamp: new Date(),
        location: { latitude: 0, longitude: 0, accuracy: 0 },
        status: 'missed',
      };

      this.checkInHistory.push(failedEvent);

      // Start escalation if auto-escalation is enabled
      if (this.config.autoEscalation) {
        await this.startEscalation(failedEvent);
      }

      return failedEvent;
    }
  }

  /**
   * Send check-in notification to parent
   */
  private async sendCheckInNotification(checkIn: CheckInEvent): Promise<void> {
    const message = this.config.silentMode 
      ? 'Silent check-in completed'
      : `Check-in completed at ${checkIn.timestamp.toLocaleTimeString()}`;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Guardian Mode Check-in',
        body: message,
        data: { type: 'guardian_checkin', checkIn },
      },
      trigger: null, // Send immediately
    });
  }

  /**
   * Start escalation protocol
   */
  async startEscalation(failedCheckIn: CheckInEvent): Promise<void> {
    console.log('Starting escalation protocol');

    this.escalationTimer = setTimeout(async () => {
      await this.executeEscalation(failedCheckIn);
    }, this.config.escalationDelay * 60 * 1000);
  }

  /**
   * Execute escalation actions
   */
  private async executeEscalation(failedCheckIn: CheckInEvent): Promise<void> {
    try {
      // Update check-in status
      failedCheckIn.status = 'escalated';
      failedCheckIn.escalatedTo = this.config.emergencyContacts;

      // Send emergency notifications
      await this.sendEmergencyNotifications(failedCheckIn);

      // Call emergency contacts if enabled
      if (this.config.autoEscalation) {
        await this.callEmergencyContacts();
      }

      console.log('Escalation protocol executed');
    } catch (error) {
      console.error('Escalation failed:', error);
    }
  }

  /**
   * Send emergency notifications
   */
  private async sendEmergencyNotifications(failedCheckIn: CheckInEvent): Promise<void> {
    const message = `Guardian Mode Alert: Check-in missed at ${failedCheckIn.timestamp.toLocaleTimeString()}. Location: ${failedCheckIn.location.latitude}, ${failedCheckIn.location.longitude}`;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🚨 Guardian Mode Alert',
        body: message,
        data: { type: 'guardian_escalation', checkIn: failedCheckIn },
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null,
    });
  }

  /**
   * Call emergency contacts
   */
  private async callEmergencyContacts(): Promise<void> {
    // This would integrate with phone calling functionality
    // For now, we'll just log the action
    console.log('Calling emergency contacts:', this.config.emergencyContacts);
  }

  /**
   * Respond to check-in (for sitters)
   */
  async respondToCheckIn(checkInId: string, response: string): Promise<void> {
    const checkIn = this.checkInHistory.find(c => c.id === checkInId);
    if (checkIn) {
      checkIn.sitterResponse = response;
      checkIn.status = 'success';
    }
  }

  /**
   * Get check-in history
   */
  getCheckInHistory(): CheckInEvent[] {
    return [...this.checkInHistory];
  }

  /**
   * Update Guardian Mode configuration
   */
  updateConfig(newConfig: Partial<GuardianModeConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Stop Guardian Mode
   */
  stop(): void {
    this.isActive = false;
    this.currentSessionId = null;

    if (this.checkInTimer) {
      clearTimeout(this.checkInTimer);
      this.checkInTimer = null;
    }

    if (this.escalationTimer) {
      clearTimeout(this.escalationTimer);
      this.escalationTimer = null;
    }

    console.log('Guardian Mode stopped');
  }

  /**
   * Get current status
   */
  getStatus(): {
    isActive: boolean;
    sessionId: string | null;
    config: GuardianModeConfig;
    lastCheckIn: CheckInEvent | null;
  } {
    return {
      isActive: this.isActive,
      sessionId: this.currentSessionId,
      config: this.config,
      lastCheckIn: this.checkInHistory[this.checkInHistory.length - 1] || null,
    };
  }
}

export default new GuardianModeService(); 