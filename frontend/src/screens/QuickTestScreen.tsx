import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const QuickTestScreen: React.FC = () => {
  const navigation = useNavigation();

  const testCredentials = {
    parent1: {
      email: 'jennifer.parent@test.com',
      password: 'TestParent123!',
      firstName: 'Jennifer',
      lastName: 'Smith',
      phone: '+1-555-0101',
      userType: 'Parent'
    },
    parent2: {
      email: 'michael.parent@test.com',
      password: 'TestParent456!',
      firstName: 'Michael',
      lastName: 'Johnson',
      phone: '+1-555-0102',
      userType: 'Parent'
    },
    sitter1: {
      email: 'sarah.sitter@test.com',
      password: 'TestSitter123!',
      firstName: 'Sarah',
      lastName: 'Wilson',
      phone: '+1-555-0201',
      userType: 'Sitter'
    },
    sitter2: {
      email: 'emma.sitter@test.com',
      password: 'TestSitter456!',
      firstName: 'Emma',
      lastName: 'Rodriguez',
      phone: '+1-555-0202',
      userType: 'Sitter'
    }
  };

  const showCredentials = (type: string) => {
    const creds = testCredentials[type as keyof typeof testCredentials];
    Alert.alert(
      `${creds.userType} Test Credentials`,
      `Email: ${creds.email}\nPassword: ${creds.password}\nName: ${creds.firstName} ${creds.lastName}\nPhone: ${creds.phone}`,
      [
        { text: 'Copy Email', onPress: () => {} },
        { text: 'Go to Signup', onPress: () => navigation.navigate('Signup' as never) },
        { text: 'Close' }
      ]
    );
  };

  const quickTests = [
    {
      title: 'Authentication Flow',
      tests: [
        { name: 'Signup Screen', screen: 'Signup', icon: 'person-add', color: '#3A7DFF' },
        { name: 'Login Screen', screen: 'Login', icon: 'log-in', color: '#10B981' },
        { name: 'Forgot Password', screen: 'ForgotPassword', icon: 'key', color: '#F59E0B' },
        { name: 'User Type Selection', screen: 'UserTypeSelection', icon: 'people', color: '#8B5CF6' },
      ]
    },
    {
      title: 'Parent Flow',
      tests: [
        { name: 'Parent Tabs', screen: 'ParentTabs', icon: 'home', color: '#3A7DFF' },
        { name: 'Booking Flow', screen: 'BookingFlow', icon: 'calendar', color: '#06B6D4' },
        { name: 'Payment Screen', screen: 'Payment', icon: 'card', color: '#10B981' },
      ]
    },
    {
      title: 'Sitter Flow',
      tests: [
        { name: 'Sitter Tabs', screen: 'SitterTabs', icon: 'briefcase', color: '#FF7DB9' },
        { name: 'Sitter Profile', screen: 'SitterProfileView', icon: 'person', color: '#F97316' },
      ]
    },
    {
      title: 'Security Features',
      tests: [
        { name: 'Emergency SOS', screen: 'EmergencySOS', icon: 'warning', color: '#EF4444' },
        { name: 'Security Demo', screen: 'SecurityDemo', icon: 'shield-checkmark', color: '#059669' },
        { name: 'Session Monitoring', screen: 'SessionMonitoring', icon: 'eye', color: '#7C3AED' },
      ]
    },
    {
      title: 'Backend Integration',
      tests: [
        { name: 'Backend Test', screen: 'BackendTest', icon: 'server', color: '#10B981' },
      ]
    }
  ];

  const credentialButtons = [
    { key: 'parent1', title: 'Parent #1 - Jennifer', color: '#3A7DFF' },
    { key: 'parent2', title: 'Parent #2 - Michael', color: '#1E40AF' },
    { key: 'sitter1', title: 'Sitter #1 - Sarah', color: '#FF7DB9' },
    { key: 'sitter2', title: 'Sitter #2 - Emma', color: '#EC4899' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#3A7DFF', '#FF7DB9']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Quick Test Center</Text>
          <Text style={styles.subtitle}>Test all app functionality</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Test Credentials */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔑 Test Credentials</Text>
            <Text style={styles.sectionDescription}>
              Tap to view login credentials for testing
            </Text>
            <View style={styles.credentialsGrid}>
              {credentialButtons.map((cred) => (
                <TouchableOpacity
                  key={cred.key}
                  style={[styles.credentialButton, { backgroundColor: cred.color }]}
                  onPress={() => showCredentials(cred.key)}
                >
                  <Text style={styles.credentialButtonText}>{cred.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Quick Navigation Tests */}
          {quickTests.map((section, index) => (
            <View key={index} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.testsGrid}>
                {section.tests.map((test, testIndex) => (
                  <TouchableOpacity
                    key={testIndex}
                    style={[styles.testButton, { backgroundColor: test.color }]}
                    onPress={() => navigation.navigate(test.screen as never)}
                  >
                    <Ionicons name={test.icon as any} size={24} color="#FFFFFF" />
                    <Text style={styles.testButtonText}>{test.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          {/* Testing Instructions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 Testing Instructions</Text>
            <View style={styles.instructionCard}>
              <Text style={styles.instructionTitle}>Complete Testing Flow:</Text>
              <Text style={styles.instructionText}>
                1. Get test credentials above{'\n'}
                2. Go to Signup screen{'\n'}
                3. Create account with test data{'\n'}
                4. Select user type (Parent/Sitter){'\n'}
                5. Test all features in main app{'\n'}
                6. Repeat for other user type
              </Text>
            </View>
          </View>

          {/* App URLs */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🌐 Access URLs</Text>
            <View style={styles.urlCard}>
              <Text style={styles.urlTitle}>Web App:</Text>
              <Text style={styles.urlText}>http://localhost:19006</Text>
              <Text style={styles.urlTitle}>Backend API:</Text>
              <Text style={styles.urlText}>http://localhost:3001</Text>
              <Text style={styles.urlTitle}>API Docs:</Text>
              <Text style={styles.urlText}>http://localhost:3001/api/docs</Text>
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 20,
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  content: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  credentialsGrid: {
    gap: 12,
  },
  credentialButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  credentialButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  testsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  testButton: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  instructionCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3A7DFF',
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  urlCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
  },
  urlTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 8,
    marginBottom: 4,
  },
  urlText: {
    fontSize: 14,
    color: '#3A7DFF',
    fontFamily: 'monospace',
  },
});

export default QuickTestScreen;

