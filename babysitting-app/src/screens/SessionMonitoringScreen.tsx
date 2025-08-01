import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Circle } from 'react-native-maps';
import { GPSTrackingService, GPSLocation, GeofenceZone } from '../services/gps-tracking.service';
import { EmergencySOSService } from '../services/emergency-sos.service';

const { width, height } = Dimensions.get('window');

interface SessionActivity {
  id: string;
  type: 'check_in' | 'check_out' | 'activity_update' | 'photo_snapshot' | 'geofence_violation';
  timestamp: number;
  description: string;
  location?: GPSLocation;
  metadata?: any;
}

const SessionMonitoringScreen: React.FC = () => {
  const [currentLocation, setCurrentLocation] = useState<GPSLocation | null>(null);
  const [sessionActivities, setSessionActivities] = useState<SessionActivity[]>([]);
  const [geofenceZones, setGeofenceZones] = useState<GeofenceZone[]>([]);
  const [isTrackingActive, setIsTrackingActive] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    initializeSessionMonitoring();
    return () => {
      // Cleanup
      GPSTrackingService.stopTrackingSession();
    };
  }, []);

  const initializeSessionMonitoring = async () => {
    try {
      // Set up GPS tracking callbacks
      GPSTrackingService.onLocationUpdate((location) => {
        setCurrentLocation(location);
        setLastUpdate(new Date());
        addSessionActivity('activity_update', 'Location updated', location);
      });

      GPSTrackingService.onGeofenceViolation((zone, location) => {
        addSessionActivity('geofence_violation', `Left safety zone: ${zone.name}`, location, {
          zoneName: zone.name,
          distance: 'Outside radius',
        });
        Alert.alert(
          '⚠️ Safety Alert',
          `Sitter has left the safety zone: ${zone.name}`,
          [{ text: 'OK' }]
        );
      });

      // Check if session is already active
      const currentSession = GPSTrackingService.getCurrentSession();
      if (currentSession) {
        setIsTrackingActive(true);
        setGeofenceZones(currentSession.geofenceZones);
        startSessionTimer();
      }
    } catch (error) {
      console.error('Failed to initialize session monitoring:', error);
    }
  };

  const startSessionTimer = () => {
    const timer = setInterval(() => {
      setSessionDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  };

  const addSessionActivity = (
    type: SessionActivity['type'],
    description: string,
    location?: GPSLocation,
    metadata?: any
  ) => {
    const activity: SessionActivity = {
      id: Date.now().toString(),
      type,
      timestamp: Date.now(),
      description,
      location,
      metadata,
    };

    setSessionActivities((prev) => [activity, ...prev.slice(0, 49)]); // Keep last 50 activities
  };

  const handleStartTracking = async () => {
    try {
      const location = await GPSTrackingService.getCurrentLocation();
      if (!location) {
        Alert.alert('Error', 'Unable to get current location. Please check location permissions.');
        return;
      }

      // Create a sample tracking session
      const session = {
        id: 'session_' + Date.now(),
        sitterId: 'sitter_123',
        parentId: 'parent_456',
        bookingId: 'booking_789',
        startTime: Date.now(),
        locations: [location],
        geofenceZones: [
          {
            id: 'home_zone',
            center: location,
            radius: 500, // 500 meters
            name: 'Home Safety Zone',
            isActive: true,
          },
        ],
        isActive: true,
        emergencyContacts: ['+1234567890'],
      };

      const success = await GPSTrackingService.startTrackingSession(session);
      if (success) {
        setIsTrackingActive(true);
        setGeofenceZones(session.geofenceZones);
        addSessionActivity('check_in', 'Session started - GPS tracking active', location);
        startSessionTimer();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to start tracking session.');
    }
  };

  const handleStopTracking = async () => {
    try {
      await GPSTrackingService.stopTrackingSession();
      setIsTrackingActive(false);
      setSessionDuration(0);
      addSessionActivity('check_out', 'Session ended - GPS tracking stopped');
    } catch (error) {
      Alert.alert('Error', 'Failed to stop tracking session.');
    }
  };

  const handleEmergencySOS = async () => {
    try {
      const alert = await EmergencySOSService.triggerSOS('session_emergency');
      if (alert) {
        addSessionActivity('activity_update', 'Emergency SOS triggered', currentLocation || undefined);
        Alert.alert('Emergency SOS', 'Emergency contacts have been notified.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to trigger emergency SOS.');
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getActivityIcon = (type: SessionActivity['type']): string => {
    switch (type) {
      case 'check_in':
        return 'location';
      case 'check_out':
        return 'location-off';
      case 'activity_update':
        return 'refresh';
      case 'photo_snapshot':
        return 'camera';
      case 'geofence_violation':
        return 'warning';
      default:
        return 'information-circle';
    }
  };

  const getActivityColor = (type: SessionActivity['type']): string => {
    switch (type) {
      case 'check_in':
        return '#10B981';
      case 'check_out':
        return '#EF4444';
      case 'activity_update':
        return '#3B82F6';
      case 'photo_snapshot':
        return '#8B5CF6';
      case 'geofence_violation':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#3A7DFF', '#FF7DB9']} style={styles.gradient}>
        <View style={styles.header}>
          <Text style={styles.title}>Session Monitoring</Text>
          <Text style={styles.subtitle}>
            {isTrackingActive ? 'Live GPS tracking active' : 'Start session to begin monitoring'}
          </Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Session Status Card */}
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <View style={styles.statusIndicator}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: isTrackingActive ? '#10B981' : '#EF4444' },
                  ]}
                />
                <Text style={styles.statusText}>
                  {isTrackingActive ? 'ACTIVE' : 'INACTIVE'}
                </Text>
              </View>
              {isTrackingActive && (
                <Text style={styles.durationText}>{formatDuration(sessionDuration)}</Text>
              )}
            </View>

            {isTrackingActive && (
              <View style={styles.statusDetails}>
                <Text style={styles.statusDetail}>
                  Last Update: {lastUpdate?.toLocaleTimeString() || 'N/A'}
                </Text>
                <Text style={styles.statusDetail}>
                  Safety Zones: {geofenceZones.length} active
                </Text>
              </View>
            )}
          </View>

          {/* Map View */}
          {currentLocation && (
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: currentLocation.latitude,
                  longitude: currentLocation.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                showsUserLocation={true}
                showsMyLocationButton={true}
              >
                {/* Current location marker */}
                <Marker
                  coordinate={{
                    latitude: currentLocation.latitude,
                    longitude: currentLocation.longitude,
                  }}
                  title="Current Location"
                  description="Sitter's current position"
                >
                  <View style={styles.locationMarker}>
                    <Ionicons name="location" size={20} color="#3A7DFF" />
                  </View>
                </Marker>

                {/* Geofence zones */}
                {geofenceZones.map((zone) => (
                  <Circle
                    key={zone.id}
                    center={zone.center}
                    radius={zone.radius}
                    strokeColor="#FF7DB9"
                    strokeWidth={2}
                    fillColor="rgba(255, 125, 185, 0.1)"
                  />
                ))}
              </MapView>
            </View>
          )}

          {/* Control Buttons */}
          <View style={styles.controls}>
            {!isTrackingActive ? (
              <TouchableOpacity style={styles.startButton} onPress={handleStartTracking}>
                <Ionicons name="play" size={24} color="#FFFFFF" />
                <Text style={styles.buttonText}>Start Tracking</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.stopButton} onPress={handleStopTracking}>
                  <Ionicons name="stop" size={24} color="#FFFFFF" />
                  <Text style={styles.buttonText}>Stop Tracking</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sosButton} onPress={handleEmergencySOS}>
                  <Ionicons name="warning" size={24} color="#FFFFFF" />
                  <Text style={styles.buttonText}>SOS</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Activity Timeline */}
          <View style={styles.timelineContainer}>
            <Text style={styles.timelineTitle}>Session Activity</Text>
            <View style={styles.timeline}>
              {sessionActivities.map((activity) => (
                <View key={activity.id} style={styles.timelineItem}>
                  <View
                    style={[
                      styles.timelineIcon,
                      { backgroundColor: getActivityColor(activity.type) },
                    ]}
                  >
                    <Ionicons
                      name={getActivityIcon(activity.type) as any}
                      size={16}
                      color="#FFFFFF"
                    />
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineDescription}>{activity.description}</Text>
                    <Text style={styles.timelineTime}>
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </Text>
                  </View>
                </View>
              ))}
              {sessionActivities.length === 0 && (
                <Text style={styles.emptyTimeline}>No activity yet</Text>
              )}
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statusCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  durationText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statusDetails: {
    marginTop: 10,
  },
  statusDetail: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 4,
  },
  mapContainer: {
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  map: {
    flex: 1,
  },
  locationMarker: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 8,
    borderWidth: 2,
    borderColor: '#3A7DFF',
  },
  controls: {
    marginBottom: 20,
  },
  startButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stopButton: {
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    flex: 1,
    marginRight: 10,
  },
  sosButton: {
    backgroundColor: '#FF0000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    flex: 1,
    marginLeft: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  timelineContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  timelineTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  timeline: {
    maxHeight: 300,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  timelineIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  timelineContent: {
    flex: 1,
  },
  timelineDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  timelineTime: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.7,
  },
  emptyTimeline: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.7,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default SessionMonitoringScreen; 