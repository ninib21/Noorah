import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  Dimensions,
  Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { EmergencySOSService, EmergencyAlert } from '../services/emergency-sos.service';
import { GPSTrackingService } from '../services/gps-tracking.service';

const { width, height } = Dimensions.get('window');

const EmergencySOSScreen: React.FC = () => {
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [currentAlert, setCurrentAlert] = useState<EmergencyAlert | null>(null);
  const [pulseAnimation] = useState(new Animated.Value(1));
  const [shakeAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    // Initialize emergency service
    EmergencySOSService.initialize();

    // Set up emergency callbacks
    EmergencySOSService.setCallbacks({
      onEmergencyTriggered: (alert) => {
        setIsEmergencyActive(true);
        setCurrentAlert(alert);
        startEmergencyAnimations();
      },
      onEmergencyResolved: (alert) => {
        setIsEmergencyActive(false);
        setCurrentAlert(null);
        stopEmergencyAnimations();
      },
      onEmergencyEscalated: (alert) => {
        Alert.alert(
          'Emergency Escalated',
          'Emergency has been escalated to authorities due to no response.',
          [{ text: 'OK' }]
        );
      },
    });

    // Check if emergency is already active
    checkEmergencyStatus();
  }, []);

  const checkEmergencyStatus = async () => {
    const isActive = EmergencySOSService.isEmergencyActive();
    setIsEmergencyActive(isActive);
    
    if (isActive) {
      const alert = await EmergencySOSService.getCurrentEmergencyAlert();
      setCurrentAlert(alert);
      startEmergencyAnimations();
    }
  };

  const startEmergencyAnimations = () => {
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Shake animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(shakeAnimation, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: -10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Vibrate continuously
    Vibration.vibrate([500, 500], true);
  };

  const stopEmergencyAnimations = () => {
    pulseAnimation.stopAnimation();
    shakeAnimation.stopAnimation();
    Vibration.cancel();
  };

  const handleSOSTrigger = async () => {
    Alert.alert(
      '🚨 Emergency SOS',
      'Are you sure you want to trigger an emergency alert? This will immediately notify emergency contacts and authorities.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'TRIGGER SOS',
          style: 'destructive',
          onPress: async () => {
            try {
              const alert = await EmergencySOSService.triggerSOS('manual_sos');
              if (alert) {
                Alert.alert(
                  'Emergency SOS Triggered',
                  'Emergency contacts have been notified. Help is on the way.',
                  [{ text: 'OK' }]
                );
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to trigger emergency SOS. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleResolveEmergency = async () => {
    if (!currentAlert) return;

    Alert.alert(
      'Resolve Emergency',
      'Are you sure you want to resolve this emergency?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Resolve',
          onPress: async () => {
            try {
              const success = await EmergencySOSService.resolveEmergency(
                currentAlert.id,
                'user_resolved',
                'Emergency resolved by user'
              );
              if (success) {
                Alert.alert('Emergency Resolved', 'The emergency has been resolved.');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to resolve emergency.');
            }
          },
        },
      ]
    );
  };

  const handleFalseAlarm = async () => {
    if (!currentAlert) return;

    Alert.alert(
      'False Alarm',
      'Are you sure this was a false alarm?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Mark as False Alarm',
          onPress: async () => {
            try {
              const success = await EmergencySOSService.markFalseAlarm(currentAlert.id);
              if (success) {
                Alert.alert('False Alarm', 'Emergency marked as false alarm.');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to mark as false alarm.');
            }
          },
        },
      ]
    );
  };

  const handleTestEmergency = async () => {
    Alert.alert(
      'Test Emergency System',
      'This will test the emergency system without sending real alerts.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Test',
          onPress: async () => {
            try {
              const success = await EmergencySOSService.testEmergencySystem();
              if (success) {
                Alert.alert('Test Successful', 'Emergency system test completed successfully.');
              } else {
                Alert.alert('Test Failed', 'Emergency system test failed.');
              }
            } catch (error) {
              Alert.alert('Error', 'Emergency system test failed.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={isEmergencyActive ? ['#FF0000', '#FF4444'] : ['#3A7DFF', '#FF7DB9']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Text style={styles.title}>
            {isEmergencyActive ? '🚨 EMERGENCY ACTIVE' : 'Emergency SOS'}
          </Text>
          <Text style={styles.subtitle}>
            {isEmergencyActive
              ? 'Emergency contacts have been notified'
              : 'Tap the button below in case of emergency'}
          </Text>
        </View>

        <View style={styles.content}>
          {isEmergencyActive ? (
            // Emergency Active State
            <View style={styles.emergencyActiveContainer}>
              <Animated.View
                style={[
                  styles.emergencyIcon,
                  {
                    transform: [
                      { scale: pulseAnimation },
                      { translateX: shakeAnimation },
                    ],
                  },
                ]}
              >
                <Ionicons name="warning" size={80} color="#FFFFFF" />
              </Animated.View>
              
              <Text style={styles.emergencyText}>EMERGENCY SOS ACTIVE</Text>
              <Text style={styles.emergencyDescription}>
                Emergency contacts and authorities have been notified.
                Your location is being tracked for safety.
              </Text>

              <View style={styles.emergencyActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.resolveButton]}
                  onPress={handleResolveEmergency}
                >
                  <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Resolve Emergency</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.falseAlarmButton]}
                  onPress={handleFalseAlarm}
                >
                  <Ionicons name="close-circle" size={24} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>False Alarm</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            // Normal State
            <View style={styles.normalStateContainer}>
              <View style={styles.sosButtonContainer}>
                <TouchableOpacity
                  style={styles.sosButton}
                  onPress={handleSOSTrigger}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#FF0000', '#FF4444']}
                    style={styles.sosButtonGradient}
                  >
                    <Ionicons name="warning" size={60} color="#FFFFFF" />
                    <Text style={styles.sosButtonText}>SOS</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              <Text style={styles.sosDescription}>
                Press the SOS button above to immediately alert emergency contacts
                and authorities. Your location will be shared automatically.
              </Text>

              <View style={styles.safetyInfo}>
                <Text style={styles.safetyTitle}>Safety Features:</Text>
                <Text style={styles.safetyItem}>• GPS location tracking</Text>
                <Text style={styles.safetyItem}>• Emergency contact notification</Text>
                <Text style={styles.safetyItem}>• Automatic escalation after 5 minutes</Text>
                <Text style={styles.safetyItem}>• Direct connection to authorities</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.testButton}
            onPress={handleTestEmergency}
          >
            <Ionicons name="settings" size={20} color="#FFFFFF" />
            <Text style={styles.testButtonText}>Test Emergency System</Text>
          </TouchableOpacity>
        </View>
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
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  normalStateContainer: {
    alignItems: 'center',
    width: '100%',
  },
  sosButtonContainer: {
    marginBottom: 40,
  },
  sosButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  sosButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sosButtonText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 10,
  },
  sosDescription: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    opacity: 0.9,
  },
  safetyInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 12,
    width: '100%',
  },
  safetyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  safetyItem: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 5,
    opacity: 0.9,
  },
  emergencyActiveContainer: {
    alignItems: 'center',
    width: '100%',
  },
  emergencyIcon: {
    marginBottom: 20,
  },
  emergencyText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  emergencyDescription: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    opacity: 0.9,
  },
  emergencyActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 140,
    justifyContent: 'center',
  },
  resolveButton: {
    backgroundColor: '#10B981',
  },
  falseAlarmButton: {
    backgroundColor: '#6B7280',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default EmergencySOSScreen; 