import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { EncryptionService } from '../services/encryption.service';
import { GPSTrackingService } from '../services/gps-tracking.service';
import { EmergencySOSService } from '../services/emergency-sos.service';

const SecurityTestScreen: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const clearTestResults = () => {
    setTestResults([]);
  };

  const testEncryption = async () => {
    setIsLoading(true);
    try {
      const testData = 'This is a test of the encryption system';
      const key = await EncryptionService.generateKey();
      const encrypted = await EncryptionService.encrypt(testData, key);
      const decrypted = await EncryptionService.decrypt(encrypted, key);
      
      if (testData === decrypted) {
        addTestResult('✅ Encryption test passed');
      } else {
        addTestResult('❌ Encryption test failed');
      }
    } catch (error) {
      addTestResult(`❌ Encryption test error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testGPSLocation = async () => {
    setIsLoading(true);
    try {
      const location = await GPSTrackingService.getCurrentLocation();
      if (location) {
        addTestResult(`✅ GPS location: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`);
      } else {
        addTestResult('❌ GPS location test failed');
      }
    } catch (error) {
      addTestResult(`❌ GPS location test error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testEmergencySystem = async () => {
    setIsLoading(true);
    try {
      const success = await EmergencySOSService.testEmergencySystem();
      if (success) {
        addTestResult('✅ Emergency system test passed');
      } else {
        addTestResult('❌ Emergency system test failed');
      }
    } catch (error) {
      addTestResult(`❌ Emergency system test error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testSecureStorage = async () => {
    setIsLoading(true);
    try {
      const testKey = 'test_secure_key';
      const testValue = 'test_secure_value';
      
      await EncryptionService.secureStore(testKey, testValue);
      const retrieved = await EncryptionService.secureRetrieve(testKey);
      
      if (retrieved === testValue) {
        addTestResult('✅ Secure storage test passed');
      } else {
        addTestResult('❌ Secure storage test failed');
      }
    } catch (error) {
      addTestResult(`❌ Secure storage test error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const runAllTests = async () => {
    clearTestResults();
    addTestResult('🚀 Starting security tests...');
    
    await testEncryption();
    await testGPSLocation();
    await testSecureStorage();
    await testEmergencySystem();
    
    addTestResult('🏁 All tests completed');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#3A7DFF', '#FF7DB9']} style={styles.gradient}>
        <View style={styles.header}>
          <Text style={styles.title}>Security Test Suite</Text>
          <Text style={styles.subtitle}>
            Test military-grade security features
          </Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Test Controls */}
          <View style={styles.testControls}>
            <TouchableOpacity
              style={[styles.testButton, styles.runAllButton]}
              onPress={runAllTests}
              disabled={isLoading}
            >
              <Ionicons name="play" size={24} color="#FFFFFF" />
              <Text style={styles.buttonText}>
                {isLoading ? 'Running Tests...' : 'Run All Tests'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearTestResults}
            >
              <Ionicons name="trash" size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>Clear Results</Text>
            </TouchableOpacity>
          </View>

          {/* Individual Test Buttons */}
          <View style={styles.individualTests}>
            <Text style={styles.sectionTitle}>Individual Tests</Text>
            
            <TouchableOpacity
              style={styles.testButton}
              onPress={testEncryption}
              disabled={isLoading}
            >
              <Ionicons name="lock-closed" size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>Test Encryption</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.testButton}
              onPress={testGPSLocation}
              disabled={isLoading}
            >
              <Ionicons name="location" size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>Test GPS Location</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.testButton}
              onPress={testSecureStorage}
              disabled={isLoading}
            >
              <Ionicons name="shield-checkmark" size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>Test Secure Storage</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.testButton}
              onPress={testEmergencySystem}
              disabled={isLoading}
            >
              <Ionicons name="warning" size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>Test Emergency System</Text>
            </TouchableOpacity>
          </View>

          {/* Test Results */}
          <View style={styles.resultsContainer}>
            <Text style={styles.sectionTitle}>Test Results</Text>
            <View style={styles.resultsList}>
              {testResults.length === 0 ? (
                <Text style={styles.noResults}>No test results yet. Run tests to see results.</Text>
              ) : (
                testResults.map((result, index) => (
                  <View key={index} style={styles.resultItem}>
                    <Text style={styles.resultText}>{result}</Text>
                  </View>
                ))
              )}
            </View>
          </View>

          {/* Security Features Info */}
          <View style={styles.infoContainer}>
            <Text style={styles.sectionTitle}>Security Features</Text>
            
            <View style={styles.featureItem}>
              <Ionicons name="lock-closed" size={20} color="#FFFFFF" />
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>AES-GCM Encryption</Text>
                <Text style={styles.featureDescription}>
                  Military-grade 256-bit encryption for all sensitive data
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Ionicons name="location" size={20} color="#FFFFFF" />
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>GPS Tracking</Text>
                <Text style={styles.featureDescription}>
                  Real-time location tracking with geofencing capabilities
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Ionicons name="warning" size={20} color="#FFFFFF" />
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Emergency SOS</Text>
                <Text style={styles.featureDescription}>
                  One-tap emergency alert with automatic escalation
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Ionicons name="shield-checkmark" size={20} color="#FFFFFF" />
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Secure Storage</Text>
                <Text style={styles.featureDescription}>
                  Biometric-protected secure storage for sensitive data
                </Text>
              </View>
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
  testControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  runAllButton: {
    backgroundColor: '#10B981',
    flex: 2,
    marginRight: 10,
  },
  clearButton: {
    backgroundColor: '#6B7280',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  individualTests: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  testButton: {
    backgroundColor: '#3A7DFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  resultsContainer: {
    marginBottom: 20,
  },
  resultsList: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 16,
    maxHeight: 200,
  },
  noResults: {
    color: '#FFFFFF',
    opacity: 0.7,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  resultItem: {
    marginBottom: 8,
  },
  resultText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  infoContainer: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 8,
  },
  featureContent: {
    flex: 1,
    marginLeft: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
});

export default SecurityTestScreen; 
