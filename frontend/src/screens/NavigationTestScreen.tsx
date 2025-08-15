import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Card from '../components/Card';
import Button from '../components/Button';

const NavigationTestScreen: React.FC = () => {
  const navigation = useNavigation();

  const navigationTests = [
    {
      title: 'Parent Flow',
      description: 'Test parent tab navigation',
      icon: 'people',
      color: '#3A7DFF',
      onPress: () => navigation.navigate('ParentTabs' as never),
    },
    {
      title: 'Sitter Flow',
      description: 'Test sitter tab navigation',
      icon: 'person',
      color: '#FF7DB9',
      onPress: () => navigation.navigate('SitterTabs' as never),
    },
    {
      title: 'Security Features',
      description: 'Test security screens',
      icon: 'shield-checkmark',
      color: '#10B981',
      onPress: () => navigation.navigate('SecurityDemo' as never),
    },
    {
      title: 'Emergency SOS',
      description: 'Test emergency functionality',
      icon: 'warning',
      color: '#EF4444',
      onPress: () => navigation.navigate('EmergencySOS' as never),
    },
    {
      title: 'Session Monitoring',
      description: 'Test real-time monitoring',
      icon: 'location',
      color: '#8B5CF6',
      onPress: () => navigation.navigate('SessionMonitoring' as never),
    },
    {
      title: 'Security Test Suite',
      description: 'Test all security features',
      icon: 'settings',
      color: '#F59E0B',
      onPress: () => navigation.navigate('SecurityTest' as never),
    },
  ];

  const componentTests = [
    {
      title: 'Button Component',
      description: 'Test different button variants',
      icon: 'radio-button-on',
      color: '#3A7DFF',
      onPress: () => {
        // Show button variants
        console.log('Button component test');
      },
    },
    {
      title: 'Card Component',
      description: 'Test card layouts',
      icon: 'card',
      color: '#FF7DB9',
      onPress: () => {
        // Show card variants
        console.log('Card component test');
      },
    },
    {
      title: 'Modal Component',
      description: 'Test modal functionality',
      icon: 'albums',
      color: '#10B981',
      onPress: () => {
        // Show modal
        console.log('Modal component test');
      },
    },
    {
      title: 'Calendar Picker',
      description: 'Test date selection',
      icon: 'calendar',
      color: '#8B5CF6',
      onPress: () => {
        // Show calendar picker
        console.log('Calendar picker test');
      },
    },
    {
      title: 'Tabs Component',
      description: 'Test tab navigation',
      icon: 'list',
      color: '#F59E0B',
      onPress: () => {
        // Show tabs
        console.log('Tabs component test');
      },
    },
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
          <Text style={styles.headerTitle}>Navigation Test</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Navigation Tests */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Navigation Flow Tests</Text>
            <Text style={styles.sectionDescription}>
              Test the complete navigation flow between screens and tabs
            </Text>
            {navigationTests.map((test, index) => (
              <Card key={index} style={styles.testCard} onPress={test.onPress}>
                <View style={styles.testCardContent}>
                  <View style={[styles.testIcon, { backgroundColor: test.color }]}>
                    <Ionicons name={test.icon as any} size={24} color="#FFFFFF" />
                  </View>
                  <View style={styles.testInfo}>
                    <Text style={styles.testTitle}>{test.title}</Text>
                    <Text style={styles.testDescription}>{test.description}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
                </View>
              </Card>
            ))}
          </View>

          {/* Component Tests */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Component Tests</Text>
            <Text style={styles.sectionDescription}>
              Test individual UI components and their variants
            </Text>
            {componentTests.map((test, index) => (
              <Card key={index} style={styles.testCard} onPress={test.onPress}>
                <View style={styles.testCardContent}>
                  <View style={[styles.testIcon, { backgroundColor: test.color }]}>
                    <Ionicons name={test.icon as any} size={24} color="#FFFFFF" />
                  </View>
                  <View style={styles.testInfo}>
                    <Text style={styles.testTitle}>{test.title}</Text>
                    <Text style={styles.testDescription}>{test.description}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
                </View>
              </Card>
            ))}
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
              <Button
                title="Go to Parent Home"
                variant="primary"
                onPress={() => navigation.navigate('ParentTabs' as never)}
              />
              <Button
                title="Go to Sitter Home"
                variant="secondary"
                onPress={() => navigation.navigate('SitterTabs' as never)}
              />
              <Button
                title="Back to Login"
                variant="outline"
                onPress={() => navigation.navigate('Login' as never)}
              />
            </View>
          </View>

          {/* Status */}
          <View style={styles.section}>
            <Card style={styles.statusCard}>
              <Text style={styles.statusTitle}>Navigation Status</Text>
              <View style={styles.statusItems}>
                <View style={styles.statusItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  <Text style={styles.statusText}>Stack Navigation</Text>
                </View>
                <View style={styles.statusItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  <Text style={styles.statusText}>Tab Navigation</Text>
                </View>
                <View style={styles.statusItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  <Text style={styles.statusText}>Component Library</Text>
                </View>
                <View style={styles.statusItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  <Text style={styles.statusText}>Color System</Text>
                </View>
              </View>
            </Card>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
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
  testCard: {
    marginBottom: 12,
  },
  testCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  testIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  testInfo: {
    flex: 1,
  },
  testTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  testDescription: {
    fontSize: 14,
    color: '#64748B',
  },
  quickActions: {
    gap: 12,
  },
  statusCard: {
    padding: 20,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  statusItems: {
    gap: 12,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 12,
  },
});

export default NavigationTestScreen; 