import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Tabs from '../../components/Tabs';

const ParentHomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('upcoming');

  // Mock data
  const upcomingBookings = [
    {
      id: '1',
      sitterName: 'Sarah Johnson',
      sitterAvatar: 'https://via.placeholder.com/50',
      date: 'Today',
      time: '2:00 PM - 6:00 PM',
      status: 'confirmed',
      children: ['Emma (5)', 'Liam (3)'],
    },
    {
      id: '2',
      sitterName: 'Emily Chen',
      sitterAvatar: 'https://via.placeholder.com/50',
      date: 'Tomorrow',
      time: '9:00 AM - 1:00 PM',
      status: 'pending',
      children: ['Emma (5)'],
    },
  ];

  const recentSitters = [
    {
      id: '1',
      name: 'Sarah Johnson',
      avatar: 'https://via.placeholder.com/60',
      rating: 4.8,
      lastBooked: '2 days ago',
      isOnline: true,
    },
    {
      id: '2',
      name: 'Emily Chen',
      avatar: 'https://via.placeholder.com/60',
      rating: 4.9,
      lastBooked: '1 week ago',
      isOnline: false,
    },
  ];

  const quickActions = [
    {
      id: '1',
      title: 'Book a Sitter',
      icon: 'person-add',
      color: '#3A7DFF',
      onPress: () => navigation.navigate('ParentBook' as never),
    },
    {
      id: '2',
      title: 'My Sitters',
      icon: 'people',
      color: '#FF7DB9',
      onPress: () => navigation.navigate('ParentMySitters' as never),
    },
    {
      id: '3',
      title: 'Messages',
      icon: 'chatbubbles',
      color: '#10B981',
      onPress: () => navigation.navigate('ParentMessages' as never),
    },
    {
      id: '4',
      title: 'Emergency',
      icon: 'warning',
      color: '#EF4444',
      onPress: () => navigation.navigate('EmergencySOS' as never),
    },
  ];

  const tabs = [
    { key: 'upcoming', title: 'Upcoming' },
    { key: 'past', title: 'Past' },
  ];

  const renderBookingCard = (booking: any) => (
    <Card key={booking.id} style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <Image source={{ uri: booking.sitterAvatar }} style={styles.sitterAvatar} />
        <View style={styles.bookingInfo}>
          <Text style={styles.sitterName}>{booking.sitterName}</Text>
          <Text style={styles.bookingTime}>{booking.date} • {booking.time}</Text>
          <Text style={styles.childrenText}>{booking.children.join(', ')}</Text>
        </View>
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusBadge,
            { backgroundColor: booking.status === 'confirmed' ? '#10B981' : '#F59E0B' }
          ]}>
            <Text style={styles.statusText}>
              {booking.status === 'confirmed' ? 'Confirmed' : 'Pending'}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.bookingActions}>
        <Button
          title="Message"
          variant="outline"
          size="small"
          onPress={() => navigation.navigate('ParentMessages' as never)}
        />
        <Button
          title="View Details"
          variant="ghost"
          size="small"
          onPress={() => {}}
        />
      </View>
    </Card>
  );

  const renderSitterCard = (sitter: any) => (
    <TouchableOpacity key={sitter.id} style={styles.sitterCard}>
      <Image source={{ uri: sitter.avatar }} style={styles.sitterCardAvatar} />
      <View style={styles.sitterCardInfo}>
        <Text style={styles.sitterCardName}>{sitter.name}</Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text style={styles.ratingText}>{sitter.rating}</Text>
        </View>
        <Text style={styles.lastBookedText}>{sitter.lastBooked}</Text>
      </View>
      <View style={styles.onlineIndicator}>
        <View style={[
          styles.onlineDot,
          { backgroundColor: sitter.isOnline ? '#10B981' : '#94A3B8' }
        ]} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#3A7DFF', '#FF7DB9']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.greeting}>Good morning, Jennifer!</Text>
            <Text style={styles.subtitle}>Ready to find a sitter?</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('ParentProfile' as never)}
          >
            <Image
              source={{ uri: 'https://via.placeholder.com/40' }}
              style={styles.profileAvatar}
            />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              {quickActions.map(action => (
                <TouchableOpacity
                  key={action.id}
                  style={[styles.quickActionCard, { backgroundColor: action.color }]}
                  onPress={action.onPress}
                >
                  <Ionicons name={action.icon as any} size={24} color="#FFFFFF" />
                  <Text style={styles.quickActionText}>{action.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Bookings */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Bookings</Text>
              <TouchableOpacity>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            <Tabs
              tabs={tabs}
              activeTab={activeTab}
              onTabPress={setActiveTab}
              variant="pills"
            />
            <View style={styles.bookingsList}>
              {upcomingBookings.map(renderBookingCard)}
            </View>
          </View>

          {/* Recent Sitters */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Sitters</Text>
              <TouchableOpacity onPress={() => navigation.navigate('ParentMySitters' as never)}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.sittersList}>
              {recentSitters.map(renderSitterCard)}
            </View>
          </View>

          {/* Safety Features */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Safety Features</Text>
            <Card style={styles.safetyCard}>
              <View style={styles.safetyContent}>
                <View style={styles.safetyIcon}>
                  <Ionicons name="shield-checkmark" size={32} color="#3A7DFF" />
                </View>
                <View style={styles.safetyInfo}>
                  <Text style={styles.safetyTitle}>Guardian Mode Active</Text>
                  <Text style={styles.safetySubtitle}>
                    Real-time monitoring and emergency alerts enabled
                  </Text>
                </View>
              </View>
              <Button
                title="Emergency SOS"
                variant="secondary"
                size="small"
                onPress={() => navigation.navigate('EmergencySOS' as never)}
              />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  profileButton: {
    padding: 4,
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: '#3A7DFF',
    fontWeight: '600',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: '48%',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  bookingsList: {
    marginTop: 16,
  },
  bookingCard: {
    marginBottom: 12,
  },
  bookingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sitterAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  bookingInfo: {
    flex: 1,
  },
  sitterName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  bookingTime: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 2,
  },
  childrenText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bookingActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sittersList: {
    marginTop: 16,
  },
  sitterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sitterCardAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  sitterCardInfo: {
    flex: 1,
  },
  sitterCardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 4,
  },
  lastBookedText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  onlineIndicator: {
    alignItems: 'center',
  },
  onlineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  safetyCard: {
    padding: 20,
  },
  safetyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  safetyIcon: {
    marginRight: 16,
  },
  safetyInfo: {
    flex: 1,
  },
  safetyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  safetySubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
});

export default ParentHomeScreen; 