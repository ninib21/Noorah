import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

export default function App() {
  const testBackend = async () => {
    try {
      const response = await fetch('http://localhost:3001/');
      const data = await response.json();
      Alert.alert('Backend Connected!', JSON.stringify(data, null, 2));
    } catch (error) {
      Alert.alert('Backend Error', error.message);
    }
  };

  const testHealth = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/v1/health');
      const data = await response.json();
      Alert.alert('Health Check', JSON.stringify(data, null, 2));
    } catch (error) {
      Alert.alert('Health Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🚀 Noorah Quantum App</Text>
      <Text style={styles.subtitle}>Backend & Frontend Connected!</Text>
      
      <TouchableOpacity style={styles.button} onPress={testBackend}>
        <Text style={styles.buttonText}>Test Backend Root</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={testHealth}>
        <Text style={styles.buttonText}>Test Health Endpoint</Text>
      </TouchableOpacity>
      
      <Text style={styles.status}>✅ Backend: http://localhost:3001</Text>
      <Text style={styles.status}>✅ Frontend: http://localhost:3000</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  status: {
    fontSize: 14,
    color: '#28a745',
    marginTop: 10,
  },
});

