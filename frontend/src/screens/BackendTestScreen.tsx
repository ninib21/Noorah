import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { apiService } from '../services/api.service';

const BackendTestScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testHealthEndpoint = async () => {
    setLoading(true);
    try {
      const response = await apiService.healthCheck();
      if (response.success) {
        addResult('✅ Health endpoint: Connected successfully');
      } else {
        addResult(`❌ Health endpoint: ${response.error}`);
      }
    } catch (error: any) {
      addResult(`❌ Health endpoint: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testAuthEndpoint = async () => {
    setLoading(true);
    try {
      // Test with invalid credentials to see if endpoint responds
      const response = await apiService.login({
        email: 'test@example.com',
        password: 'invalidpassword'
      });
      
      if (response.success) {
        addResult('✅ Auth endpoint: Connected (unexpected success)');
      } else {
        addResult('✅ Auth endpoint: Connected (expected auth failure)');
      }
    } catch (error: any) {
      addResult(`❌ Auth endpoint: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testSittersEndpoint = async () => {
    setLoading(true);
    try {
      const response = await apiService.getSitters();
      if (response.success) {
        addResult('✅ Sitters endpoint: Connected successfully');
      } else {
        addResult(`❌ Sitters endpoint: ${response.error}`);
      }
    } catch (error: any) {
      addResult(`❌ Sitters endpoint: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testBookingsEndpoint = async () => {
    setLoading(true);
    try {
      const response = await apiService.getBookings();
      if (response.success) {
        addResult('✅ Bookings endpoint: Connected successfully');
      } else {
        addResult(`❌ Bookings endpoint: ${response.error}`);
      }
    } catch (error: any) {
      addResult(`❌ Bookings endpoint: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testPaymentsEndpoint = async () => {
    setLoading(true);
    try {
      const response = await apiService.getPayments();
      if (response.success) {
        addResult('✅ Payments endpoint: Connected successfully');
      } else {
        addResult(`❌ Payments endpoint: ${response.error}`);
      }
    } catch (error: any) {
      addResult(`❌ Payments endpoint: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const runAllTests = async () => {
    setTestResults([]);
    addResult('🚀 Starting backend connectivity tests...');
    
    await testHealthEndpoint();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testAuthEndpoint();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testSittersEndpoint();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testBookingsEndpoint();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testPaymentsEndpoint();
    
    addResult('🏁 All tests completed!');
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <Text style={styles.title}>🔗 Backend Connectivity Test</Text>
            <Text style={styles.subtitle}>Test connection to Noorah API</Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={runAllTests}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>🚀 Run All Tests</Text>
              )}
            </TouchableOpacity>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={testHealthEndpoint}
                disabled={loading}
              >
                <Text style={styles.secondaryButtonText}>🏥 Health</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={testAuthEndpoint}
                disabled={loading}
              >
                <Text style={styles.secondaryButtonText}>🔐 Auth</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={testSittersEndpoint}
                disabled={loading}
              >
                <Text style={styles.secondaryButtonText}>👶 Sitters</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={testBookingsEndpoint}
                disabled={loading}
              >
                <Text style={styles.secondaryButtonText}>📅 Bookings</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={testPaymentsEndpoint}
                disabled={loading}
              >
                <Text style={styles.secondaryButtonText}>💳 Payments</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.clearButton]}
                onPress={clearResults}
                disabled={loading}
              >
                <Text style={styles.clearButtonText}>🗑️ Clear</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>📊 Test Results</Text>
            <View style={styles.resultsList}>
              {testResults.length === 0 ? (
                <Text style={styles.noResults}>No tests run yet. Tap "Run All Tests" to start.</Text>
              ) : (
                testResults.map((result, index) => (
                  <Text key={index} style={styles.resultItem}>
                    {result}
                  </Text>
                ))
              )}
            </View>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>ℹ️ Backend Information</Text>
            <Text style={styles.infoText}>API URL: http://localhost:3001</Text>
            <Text style={styles.infoText}>Status: {loading ? 'Testing...' : 'Ready'}</Text>
            <Text style={styles.infoText}>Total Tests: {testResults.length}</Text>
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
  scrollView: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#e0e0e0',
    textAlign: 'center',
  },
  buttonContainer: {
    marginBottom: 30,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    marginBottom: 20,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    flex: 1,
    marginHorizontal: 5,
  },
  clearButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
    flex: 1,
    marginHorizontal: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  resultsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  resultsList: {
    maxHeight: 300,
  },
  resultItem: {
    color: '#e0e0e0',
    fontSize: 12,
    marginBottom: 5,
    fontFamily: 'monospace',
  },
  noResults: {
    color: '#ccc',
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  infoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  infoText: {
    color: '#e0e0e0',
    fontSize: 14,
    marginBottom: 5,
  },
});

export default BackendTestScreen;

