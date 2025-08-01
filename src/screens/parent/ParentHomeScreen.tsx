import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const ParentHomeScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back!</Text>
          <Text style={styles.subtitle}>Find trusted sitters for your children</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.card}>
            <Ionicons name="search" size={24} color="#3A7DFF" />
            <Text style={styles.cardTitle}>Find Sitters</Text>
            <Text style={styles.cardDescription}>
              Browse verified sitters in your area
            </Text>
          </View>

          <View style={styles.card}>
            <Ionicons name="calendar" size={24} color="#10B981" />
            <Text style={styles.cardTitle}>Upcoming Sessions</Text>
            <Text style={styles.cardDescription}>
              View your scheduled babysitting sessions
            </Text>
          </View>

          <View style={styles.card}>
            <Ionicons name="shield-checkmark" size={24} color="#F59E0B" />
            <Text style={styles.cardTitle}>Safety Features</Text>
            <Text style={styles.cardDescription}>
              GPS tracking and emergency alerts
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 12,
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});

export default ParentHomeScreen; 