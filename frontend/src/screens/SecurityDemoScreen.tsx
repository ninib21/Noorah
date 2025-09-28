import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const SecurityDemoScreen: React.FC = () => {
  const navigation = useNavigation();

  const navigateToScreen = (screenName: string) => {
    navigation.navigate(screenName as never);
  };

  const securityFeatures = [
    {
      id: 'emergency-sos',
      title: 'Emergency SOS',
      description: 'One-tap emergency alert with automatic escalation',
      icon: 'warning',
      color: '#FF0000',
      screen: 'EmergencySOS',
    },
    {
      id: 'session-monitoring',
      title: 'Session Monitoring',
      description: 'Real-time GPS tracking with geofencing',
      icon: 'location',
      color: '#3A7DFF',
      screen: 'SessionMonitoring',
    },
    {
      id: 'security-test',
      title: 'Security Test Suite',
      description: 'Test all security features and encryption',
      icon: 'shield-checkmark',
      color: '#10B981',
      screen: 'SecurityTest',
    },
  ];

  const securityStats = [
    { label: 'Encryption', value: 'AES-256-GCM', icon: 'lock-closed' },
    { label: 'Response Time', value: '< 30 seconds', icon: 'flash' },
    { label: 'Location Accuracy', value: '±5 meters', icon: 'location' },
    { label: 'Uptime', value: '99.9%', icon: 'checkmark-circle' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#3A7DFF', '#FF7DB9']} style={styles.gradient}>
        <View style={styles.header}>
          <Text style={styles.title}>🛡️ Security Features Demo</Text>
          <Text style={styles.subtitle}>
            Military-grade security for ultimate peace of mind
          </Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Security Stats */}
          <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>Security Metrics</Text>
            <View style={styles.statsGrid}>
              {securityStats.map((stat, index) => (
                <View key={index} style={styles.statItem}>
                  <Ionicons name={stat.icon as any} size={24} color="#FFFFFF" />
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Security Features */}
          <View style={styles.featuresContainer}>
            <Text style={styles.sectionTitle}>Security Features</Text>
            {securityFeatures.map((feature) => (
              <TouchableOpacity
                key={feature.id}
                style={[styles.featureCard, { borderLeftColor: feature.color }]}
                onPress={() => navigateToScreen(feature.screen)}
              >
                <View style={styles.featureHeader}>
                  <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
                    <Ionicons name={feature.icon as any} size={24} color="#FFFFFF" />
                  </View>
                  <View style={styles.featureContent}>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureDescription}>{feature.description}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Security Benefits */}
          <View style={styles.benefitsContainer}>
            <Text style={styles.sectionTitle}>Why Choose Noorah?</Text>
            
            <View style={styles.benefitItem}>
              <Ionicons name="shield-checkmark" size={20} color="#FFFFFF" />
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Military-Grade Security</Text>
                <Text style={styles.benefitDescription}>
                  AES-256 encryption, secure storage, and real-time monitoring
                </Text>
              </View>
            </View>

            <View style={styles.benefitItem}>
              <Ionicons name="location" size={20} color="#FFFFFF" />
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Real-Time Tracking</Text>
                <Text style={styles.benefitDescription}>
                  GPS tracking with geofencing and automatic alerts
                </Text>
              </View>
            </View>

            <View style={styles.benefitItem}>
              <Ionicons name="warning" size={20} color="#FFFFFF" />
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Instant Emergency Response</Text>
                <Text style={styles.benefitDescription}>
                  One-tap SOS with automatic escalation to authorities
                </Text>
              </View>
            </View>

            <View style={styles.benefitItem}>
              <Ionicons name="lock-closed" size={20} color="#FFFFFF" />
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Privacy Protection</Text>
                <Text style={styles.benefitDescription}>
                  GDPR and COPPA compliant data handling
                </Text>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.actionsContainer}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.emergencyButton]}
                onPress={() => navigateToScreen('EmergencySOS')}
              >
                <Ionicons name="warning" size={24} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Emergency SOS</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.trackingButton]}
                onPress={() => navigateToScreen('SessionMonitoring')}
              >
                <Ionicons name="location" size={24} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Start Tracking</Text>
              </TouchableOpacity>
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
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
  statsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
    textAlign: 'center',
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featureCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  benefitsContainer: {
    marginBottom: 20,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
  },
  benefitContent: {
    flex: 1,
    marginLeft: 12,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  actionsContainer: {
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 6,
  },
  emergencyButton: {
    backgroundColor: '#FF0000',
  },
  trackingButton: {
    backgroundColor: '#10B981',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default SecurityDemoScreen; 
