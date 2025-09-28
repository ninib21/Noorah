import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  withSequence,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { AnimatedButton, AnimatedPulse, AnimatedGradientBackground, AnimatedShake } from '../components/AnimatedComponents';
import FeedbackService from '../services/feedback.service';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/types';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const EmergencySOSScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [emergencyType, setEmergencyType] = useState<'medical' | 'safety' | 'urgent' | null>(null);
  const [countdown, setCountdown] = useState(5);
  const [isContacting, setIsContacting] = useState(false);
  
  const feedbackService = FeedbackService.getInstance();
  const pulseScale = useSharedValue(1);
  const shakeValue = useSharedValue(0);

  useEffect(() => {
    feedbackService.trackScreen('EmergencySOSScreen');
  }, []);

  useEffect(() => {
    if (isEmergencyActive) {
      // Start pulse animation
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 800 }),
          withTiming(1, { duration: 800 })
        ),
        -1,
        true
      );

      // Start shake animation
      shakeValue.value = withRepeat(
        withTiming(1, { duration: 200 }),
        -1,
        true
      );

      // Start countdown
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            handleEmergencyTrigger();
            return 5;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    } else {
      pulseScale.value = withTiming(1, { duration: 300 });
      shakeValue.value = withTiming(0, { duration: 300 });
    }
  }, [isEmergencyActive]);

  const handleEmergencyTrigger = async () => {
    setIsContacting(true);
    
    try {
      // Track emergency action
      feedbackService.trackAction('emergency_triggered', 'EmergencySOSScreen', {
        emergencyType,
        timestamp: Date.now(),
      });

      // Simulate emergency response
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Emergency Response',
        'Emergency services have been contacted. Help is on the way.',
        [{ text: 'OK', onPress: () => setIsEmergencyActive(false) }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to contact emergency services. Please try again.');
    } finally {
      setIsContacting(false);
    }
  };

  const handleEmergencyTypeSelect = (type: 'medical' | 'safety' | 'urgent') => {
    setEmergencyType(type);
    setIsEmergencyActive(true);
    setCountdown(5);
    
    feedbackService.trackAction('emergency_type_selected', 'EmergencySOSScreen', {
      emergencyType: type,
    });
  };

  const handleCancelEmergency = () => {
    setIsEmergencyActive(false);
    setEmergencyType(null);
    setCountdown(5);
    
    feedbackService.trackAction('emergency_cancelled', 'EmergencySOSScreen', {
      emergencyType,
    });
  };

  const handleCallParent = () => {
    Alert.alert('Calling Guardian', 'Connecting to the designated parent via secure voice line.');
  };

  const handleMessageParent = () => {
    Alert.alert('Messaging Guardian', 'Opening encrypted chat for status updates.');
  };

  const handleShareLocation = () => {
    Alert.alert('Location Shared', 'Your live location has been broadcast to guardians and responders.');
  };

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{
      translateX: interpolate(
        shakeValue.value,
        [0, 1],
        [0, 10],
        Extrapolate.CLAMP
      )
    }],
  }));

  const renderEmergencyButton = () => (
    <Animated.View entering={FadeInDown.delay(100)} style={styles.emergencyContainer}>
      <Text style={styles.emergencyTitle}>Emergency SOS</Text>
      <Text style={styles.emergencySubtitle}>
        Tap the button below to trigger emergency response
      </Text>
      
      <Animated.View style={[styles.sosButtonContainer, pulseStyle]}>
        <TouchableOpacity
          style={styles.sosButton}
          onPress={() => handleEmergencyTypeSelect('urgent')}
          activeOpacity={0.8}
        >
          <AnimatedPulse style={styles.sosButtonInner}>
            <Ionicons name="warning" size={48} color="#FFFFFF" />
            <Text style={styles.sosButtonText}>SOS</Text>
          </AnimatedPulse>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );

  const renderEmergencyTypes = () => (
    <Animated.View entering={FadeInUp.delay(200)} style={styles.emergencyTypes}>
      <Text style={styles.typesTitle}>Select Emergency Type</Text>
      
      <View style={styles.typeButtons}>
        <AnimatedButton
          title="Medical Emergency"
          onPress={() => handleEmergencyTypeSelect('medical')}
          variant="danger"
          size="large"
          icon="medical"
          style={styles.typeButton}
        />
        
        <AnimatedButton
          title="Safety Concern"
          onPress={() => handleEmergencyTypeSelect('safety')}
          variant="danger"
          size="large"
          icon="shield"
          style={styles.typeButton}
        />
        
        <AnimatedButton
          title="Urgent Help"
          onPress={() => handleEmergencyTypeSelect('urgent')}
          variant="danger"
          size="large"
          icon="warning"
          style={styles.typeButton}
        />
      </View>
    </Animated.View>
  );

  const renderActiveEmergency = () => (
    <Animated.View entering={FadeInUp.delay(100)} style={styles.activeEmergency}>
      <Animated.View style={[styles.emergencyAlert, shakeStyle]}>
        <Ionicons name="warning" size={64} color="#EF4444" />
        <Text style={styles.emergencyAlertTitle}>EMERGENCY ACTIVE</Text>
        <Text style={styles.emergencyAlertSubtitle}>
          {emergencyType === 'medical' && 'Medical emergency detected'}
          {emergencyType === 'safety' && 'Safety concern reported'}
          {emergencyType === 'urgent' && 'Urgent help requested'}
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(200)} style={styles.countdownContainer}>
        <Text style={styles.countdownLabel}>Contacting emergency services in:</Text>
        <Text style={styles.countdownTimer}>{countdown}</Text>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(300)} style={styles.emergencyActions}>
        <AnimatedButton
          title={isContacting ? "Contacting..." : "Cancel Emergency"}
          onPress={handleCancelEmergency}
          variant="secondary"
          size="large"
          loading={isContacting}
          disabled={isContacting}
        />
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(400)} style={styles.emergencyInfo}>
        <Text style={styles.infoTitle}>What happens next:</Text>
        <View style={styles.infoList}>
          <View style={styles.infoItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.infoText}>Emergency services contacted</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.infoText}>Location shared with responders</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.infoText}>Noorah support notified</Text>
          </View>
        </View>
      </Animated.View>
    </Animated.View>
  );

  const renderQuickContacts = () => (
    <Animated.View entering={FadeInUp.delay(300)} style={styles.quickContacts}>
      <Text style={styles.contactsTitle}>Quick Contacts</Text>
      
      <View style={styles.contactButtons}>
        <TouchableOpacity style={styles.contactButton} onPress={handleCallParent}>
          <Ionicons name="call" size={24} color="#3A7DFF" />
          <Text style={styles.contactText}>Call Parent</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.contactButton} onPress={handleMessageParent}>
          <Ionicons name="chatbubble" size={24} color="#3A7DFF" />
          <Text style={styles.contactText}>Message</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.contactButton} onPress={handleShareLocation}>
          <Ionicons name="location" size={24} color="#3A7DFF" />
          <Text style={styles.contactText}>Share Location</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderInactiveContent = () => (
    <Animated.ScrollView showsVerticalScrollIndicator={false}>
      {renderEmergencyButton()}
      {renderEmergencyTypes()}
      {renderQuickContacts()}
    </Animated.ScrollView>
  );

  return (
    <AnimatedGradientBackground>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </View>
        {isEmergencyActive ? (
          <Animated.ScrollView showsVerticalScrollIndicator={false}>
            {renderActiveEmergency()}
          </Animated.ScrollView>
        ) : (
          renderInactiveContent()
        )}
      </SafeAreaView>
    </AnimatedGradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emergencyContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  emergencyTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emergencySubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: 32,
  },
  sosButtonContainer: {
    alignItems: 'center',
  },
  sosButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  sosButtonInner: {
    alignItems: 'center',
  },
  sosButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 4,
  },
  emergencyTypes: {
    marginBottom: 40,
  },
  typesTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  typeButtons: {
    gap: 12,
  },
  typeButton: {
    marginBottom: 8,
  },
  activeEmergency: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emergencyAlert: {
    alignItems: 'center',
    marginBottom: 32,
  },
  emergencyAlertTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#EF4444',
    marginTop: 16,
    marginBottom: 8,
  },
  emergencyAlertSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
    textAlign: 'center',
  },
  countdownContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  countdownLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  countdownTimer: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#EF4444',
  },
  emergencyActions: {
    width: '100%',
    marginBottom: 32,
  },
  emergencyInfo: {
    width: '100%',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  infoList: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 12,
  },
  quickContacts: {
    marginTop: 20,
  },
  contactsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  contactButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  contactButton: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    minWidth: 80,
  },
  contactText: {
    fontSize: 12,
    color: '#FFFFFF',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default EmergencySOSScreen; 
