import * as Location from 'expo-location';
import { LocationObject, LocationAccuracy } from 'expo-location';
import { EncryptionService } from './encryption.service';

export interface GPSLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  speed?: number;
  heading?: number;
  altitude?: number;
}

export interface GeofenceZone {
  id: string;
  center: {
    latitude: number;
    longitude: number;
  };
  radius: number; // in meters
  name: string;
  isActive: boolean;
}

export interface TrackingSession {
  id: string;
  sitterId: string;
  parentId: string;
  bookingId: string;
  startTime: number;
  endTime?: number;
  locations: GPSLocation[];
  geofenceZones: GeofenceZone[];
  isActive: boolean;
  emergencyContacts: string[];
}

export class GPSTrackingService {
  private static locationSubscription: Location.LocationSubscription | null = null;
  private static currentSession: TrackingSession | null = null;
  private static geofenceViolations: Set<string> = new Set();
  private static locationUpdateCallback?: (location: GPSLocation) => void;
  private static geofenceViolationCallback?: (zone: GeofenceZone, location: GPSLocation) => void;
  private static emergencyCallback?: (location: GPSLocation, reason: string) => void;

  /**
   * Request location permissions
   */
  static async requestPermissions(): Promise<boolean> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.error('Location permission denied');
      return false;
    }

    const backgroundStatus = await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus.status !== 'granted') {
      console.error('Background location permission denied');
      return false;
    }

    return true;
  }

  /**
   * Start a tracking session
   */
  static async startTrackingSession(session: TrackingSession): Promise<boolean> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Location permissions not granted');
      }

      this.currentSession = session;

      // Configure location tracking
      await Location.setGoogleApiKey(process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '');

      // Start location updates with high accuracy
      this.locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: LocationAccuracy.BestForNavigation,
          timeInterval: 30000, // 30 seconds
          distanceInterval: 10, // 10 meters
          foregroundService: {
            notificationTitle: 'GuardianNest Tracking',
            notificationBody: 'Tracking your location for safety',
            notificationColor: '#3A7DFF',
          },
        },
        (location) => {
          this.handleLocationUpdate(location);
        }
      );

      console.log('GPS tracking session started');
      return true;
    } catch (error) {
      console.error('Failed to start GPS tracking:', error);
      return false;
    }
  }

  /**
   * Stop the current tracking session
   */
  static async stopTrackingSession(): Promise<void> {
    if (this.locationSubscription) {
      this.locationSubscription.remove();
      this.locationSubscription = null;
    }

    if (this.currentSession) {
      this.currentSession.endTime = Date.now();
      this.currentSession.isActive = false;
      
      // Save session data
      await this.saveSessionData(this.currentSession);
      this.currentSession = null;
    }

    console.log('GPS tracking session stopped');
  }

  /**
   * Handle location updates
   */
  private static async handleLocationUpdate(location: LocationObject): Promise<void> {
    if (!this.currentSession) return;

    const gpsLocation: GPSLocation = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy || 0,
      timestamp: location.timestamp,
      speed: location.coords.speed || undefined,
      heading: location.coords.heading || undefined,
      altitude: location.coords.altitude || undefined,
    };

    // Add to session history
    this.currentSession.locations.push(gpsLocation);

    // Check geofence violations
    await this.checkGeofenceViolations(gpsLocation);

    // Call location update callback
    if (this.locationUpdateCallback) {
      this.locationUpdateCallback(gpsLocation);
    }

    // Encrypt and send location data to server
    await this.sendLocationToServer(gpsLocation);
  }

  /**
   * Check for geofence violations
   */
  private static async checkGeofenceViolations(location: GPSLocation): Promise<void> {
    if (!this.currentSession) return;

    for (const zone of this.currentSession.geofenceZones) {
      if (!zone.isActive) continue;

      const distance = this.calculateDistance(
        location.latitude,
        location.longitude,
        zone.center.latitude,
        zone.center.longitude
      );

      const violationKey = `${zone.id}-${location.timestamp}`;

      if (distance > zone.radius) {
        // Outside geofence
        if (!this.geofenceViolations.has(violationKey)) {
          this.geofenceViolations.add(violationKey);
          
          if (this.geofenceViolationCallback) {
            this.geofenceViolationCallback(zone, location);
          }

          // Send emergency alert
          await this.sendEmergencyAlert('geofence_violation', location, {
            zoneName: zone.name,
            distance: distance,
            radius: zone.radius,
          });
        }
      } else {
        // Back inside geofence
        this.geofenceViolations.delete(violationKey);
      }
    }
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  private static calculateDistance(
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
   * Add a geofence zone
   */
  static addGeofenceZone(zone: GeofenceZone): void {
    if (this.currentSession) {
      this.currentSession.geofenceZones.push(zone);
    }
  }

  /**
   * Remove a geofence zone
   */
  static removeGeofenceZone(zoneId: string): void {
    if (this.currentSession) {
      this.currentSession.geofenceZones = this.currentSession.geofenceZones.filter(
        zone => zone.id !== zoneId
      );
    }
  }

  /**
   * Set location update callback
   */
  static onLocationUpdate(callback: (location: GPSLocation) => void): void {
    this.locationUpdateCallback = callback;
  }

  /**
   * Set geofence violation callback
   */
  static onGeofenceViolation(callback: (zone: GeofenceZone, location: GPSLocation) => void): void {
    this.geofenceViolationCallback = callback;
  }

  /**
   * Set emergency callback
   */
  static onEmergency(callback: (location: GPSLocation, reason: string) => void): void {
    this.emergencyCallback = callback;
  }

  /**
   * Trigger emergency alert
   */
  static async triggerEmergency(reason: string = 'manual_trigger'): Promise<void> {
    if (!this.currentSession) return;

    const lastLocation = this.currentSession.locations[this.currentSession.locations.length - 1];
    if (lastLocation) {
      await this.sendEmergencyAlert(reason, lastLocation);
      
      if (this.emergencyCallback) {
        this.emergencyCallback(lastLocation, reason);
      }
    }
  }

  /**
   * Send location data to server
   */
  private static async sendLocationToServer(location: GPSLocation): Promise<void> {
    try {
      // Encrypt location data
      const key = await EncryptionService.generateKey();
      const encryptedData = await EncryptionService.encrypt(
        JSON.stringify(location),
        key
      );

      // Send to server (implement your API call here)
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/tracking/location`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
        body: JSON.stringify({
          sessionId: this.currentSession?.id,
          encryptedLocation: encryptedData,
          timestamp: Date.now(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send location data');
      }
    } catch (error) {
      console.error('Failed to send location to server:', error);
    }
  }

  /**
   * Send emergency alert
   */
  private static async sendEmergencyAlert(
    reason: string,
    location: GPSLocation,
    metadata?: any
  ): Promise<void> {
    try {
      const alertData = {
        sessionId: this.currentSession?.id,
        reason,
        location,
        timestamp: Date.now(),
        metadata,
        emergencyContacts: this.currentSession?.emergencyContacts || [],
      };

      // Send emergency alert to server
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/emergency/alert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
        body: JSON.stringify(alertData),
      });

      if (!response.ok) {
        throw new Error('Failed to send emergency alert');
      }

      console.log('Emergency alert sent:', reason);
    } catch (error) {
      console.error('Failed to send emergency alert:', error);
    }
  }

  /**
   * Save session data locally
   */
  private static async saveSessionData(session: TrackingSession): Promise<void> {
    try {
      const key = await EncryptionService.generateKey();
      const encryptedData = await EncryptionService.encrypt(
        JSON.stringify(session),
        key
      );

      await EncryptionService.secureStore(
        `session_${session.id}`,
        encryptedData
      );
    } catch (error) {
      console.error('Failed to save session data:', error);
    }
  }

  /**
   * Get current session
   */
  static getCurrentSession(): TrackingSession | null {
    return this.currentSession;
  }

  /**
   * Get authentication token
   */
  private static async getAuthToken(): Promise<string> {
    // Implement your auth token retrieval logic
    return await EncryptionService.secureRetrieve('auth_token') || '';
  }

  /**
   * Get current location once
   */
  static async getCurrentLocation(): Promise<GPSLocation | null> {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: LocationAccuracy.BestForNavigation,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || 0,
        timestamp: location.timestamp,
        speed: location.coords.speed || undefined,
        heading: location.coords.heading || undefined,
        altitude: location.coords.altitude || undefined,
      };
    } catch (error) {
      console.error('Failed to get current location:', error);
      return null;
    }
  }
} 