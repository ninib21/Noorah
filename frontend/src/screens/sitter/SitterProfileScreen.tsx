import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface Review {
  id: string;
  parentName: string;
  rating: number;
  comment: string;
  date: string;
}

const SitterProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const [isAvailable, setIsAvailable] = useState(true);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);

  // Mock data
  const sitterData = {
    name: 'Sarah Johnson',
    avatar: 'https://via.placeholder.com/120',
    rating: 4.8,
    totalReviews: 127,
    hourlyRate: 25,
    experience: '5 years',
    location: 'Downtown, New York',
    bio: 'Experienced and caring babysitter with 5 years of experience working with children of all ages. I love creating fun and educational activities while ensuring safety and comfort.',
    skills: [
      'Infant Care (0-12 months)',
      'Toddler Care (1-3 years)',
      'Preschool Care (3-5 years)',
      'School Age Care (5-12 years)',
      'CPR Certified',
      'First Aid Certified',
      'Early Childhood Education',
      'Meal Preparation',
      'Light Housekeeping',
      'Homework Help',
    ],
    availability: {
      monday: { morning: true, afternoon: true, evening: false },
      tuesday: { morning: false, afternoon: true, evening: true },
      wednesday: { morning: true, afternoon: true, evening: false },
      thursday: { morning: false, afternoon: true, evening: true },
      friday: { morning: true, afternoon: true, evening: false },
      saturday: { morning: true, afternoon: false, evening: false },
      sunday: { morning: false, afternoon: false, evening: false },
    },
    certifications: [
      'CPR Certification - American Red Cross',
      'First Aid Certification - American Red Cross',
      'Early Childhood Education Certificate',
      'Background Check Verified',
    ],
    languages: ['English', 'Spanish'],
  };

  const reviews: Review[] = [
    {
      id: '1',
      parentName: 'Jennifer M.',
      rating: 5,
      comment: 'Sarah was amazing with our 3-year-old! She kept him engaged with educational activities and was very patient. Highly recommend!',
      date: '2 days ago',
    },
    {
      id: '2',
      parentName: 'Michael R.',
      rating: 5,
      comment: 'Very professional and caring. Our kids loved her and we felt completely safe leaving them in her care.',
      date: '1 week ago',
    },
    {
      id: '3',
      parentName: 'Lisa T.',
      rating: 4,
      comment: 'Great sitter! She was punctual and followed all our instructions perfectly. Will definitely book again.',
      date: '2 weeks ago',
    },
  ];

  const handleEditProfile = () => {
    // TODO: Navigate to edit profile screen
    Alert.alert('Edit Profile', 'Edit profile functionality coming soon!');
  };

  const handleViewAllReviews = () => {
    // TODO: Navigate to all reviews screen
    Alert.alert('Reviews', 'View all reviews functionality coming soon!');
  };

  const handleAvailabilityToggle = () => {
    setIsAvailable(!isAvailable);
    Alert.alert(
      'Availability Updated',
      `You are now ${!isAvailable ? 'available' : 'unavailable'} for bookings`
    );
  };

  const renderAvailabilityDay = (day: string, times: any) => {
    const dayName = day.charAt(0).toUpperCase() + day.slice(1);
    const isAvailable = times.morning || times.afternoon || times.evening;
    
    return (
      <View key={day} style={styles.availabilityDay}>
        <Text style={[styles.dayText, !isAvailable && styles.unavailableDay]}>
          {dayName}
        </Text>
        <View style={styles.timeSlots}>
          {times.morning && <View style={styles.timeSlot}><Text style={styles.timeText}>AM</Text></View>}
          {times.afternoon && <View style={styles.timeSlot}><Text style={styles.timeText}>PM</Text></View>}
          {times.evening && <View style={styles.timeSlot}><Text style={styles.timeText}>Eve</Text></View>}
          {!isAvailable && <Text style={styles.unavailableText}>Unavailable</Text>}
        </View>
      </View>
    );
  };

  const renderReview = (review: Review) => (
    <View key={review.id} style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Text style={styles.reviewerName}>{review.parentName}</Text>
        <View style={styles.reviewRating}>
          {[1, 2, 3, 4, 5].map(star => (
            <Ionicons
              key={star}
              name={star <= review.rating ? 'star' : 'star-outline'}
              size={14}
              color="#FFD700"
            />
          ))}
        </View>
      </View>
      <Text style={styles.reviewComment}>{review.comment}</Text>
      <Text style={styles.reviewDate}>{review.date}</Text>
    </View>
  );

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
          <Text style={styles.headerTitle}>My Profile</Text>
          <TouchableOpacity onPress={handleEditProfile} style={styles.editButton}>
            <Ionicons name="create" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <Image source={{ uri: sitterData.avatar }} style={styles.profileAvatar} />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{sitterData.name}</Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.ratingText}>{sitterData.rating}</Text>
                <Text style={styles.reviewsCount}>({sitterData.totalReviews} reviews)</Text>
              </View>
              <Text style={styles.profileLocation}>{sitterData.location}</Text>
              <Text style={styles.profileRate}>${sitterData.hourlyRate}/hour</Text>
            </View>
          </View>

          {/* Availability Toggle */}
          <View style={styles.availabilityToggle}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleTitle}>Available for Bookings</Text>
              <Text style={styles.toggleSubtitle}>
                {isAvailable ? 'Parents can book you' : 'You won\'t receive booking requests'}
              </Text>
            </View>
            <Switch
              value={isAvailable}
              onValueChange={handleAvailabilityToggle}
              trackColor={{ false: '#E2E8F0', true: '#3A7DFF' }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Bio */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About Me</Text>
            <Text style={styles.bioText}>{sitterData.bio}</Text>
          </View>

          {/* Skills */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills & Certifications</Text>
            <View style={styles.skillsContainer}>
              {sitterData.skills.map((skill, index) => (
                <View key={index} style={styles.skillTag}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Certifications */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            {sitterData.certifications.map((cert, index) => (
              <View key={index} style={styles.certificationItem}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.certificationText}>{cert}</Text>
              </View>
            ))}
          </View>

          {/* Languages */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Languages</Text>
            <View style={styles.languagesContainer}>
              {sitterData.languages.map((language, index) => (
                <View key={index} style={styles.languageTag}>
                  <Text style={styles.languageText}>{language}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Availability */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Weekly Availability</Text>
            <View style={styles.availabilityContainer}>
              {Object.entries(sitterData.availability).map(([day, times]) =>
                renderAvailabilityDay(day, times)
              )}
            </View>
          </View>

          {/* Recent Reviews */}
          <View style={styles.section}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.sectionTitle}>Recent Reviews</Text>
              <TouchableOpacity onPress={handleViewAllReviews}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            {reviews.map(renderReview)}
          </View>

          {/* Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Settings</Text>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="notifications" size={20} color="#64748B" />
                <Text style={styles.settingText}>Push Notifications</Text>
              </View>
              <Switch
                value={isNotificationsEnabled}
                onValueChange={setIsNotificationsEnabled}
                trackColor={{ false: '#E2E8F0', true: '#3A7DFF' }}
                thumbColor="#FFFFFF"
              />
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
  editButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 4,
  },
  reviewsCount: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 4,
  },
  profileLocation: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  profileRate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3A7DFF',
  },
  availabilityToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleInfo: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  toggleSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  bioText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillTag: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  certificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  certificationText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 12,
  },
  languagesContainer: {
    flexDirection: 'row',
  },
  languageTag: {
    backgroundColor: '#3A7DFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  languageText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  availabilityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  availabilityDay: {
    width: '30%',
    marginBottom: 16,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  unavailableDay: {
    color: '#94A3B8',
  },
  timeSlots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  timeSlot: {
    backgroundColor: '#3A7DFF',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 4,
    marginBottom: 4,
  },
  timeText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  unavailableText: {
    fontSize: 10,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: '#3A7DFF',
    fontWeight: '500',
  },
  reviewCard: {
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 16,
    marginBottom: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  reviewRating: {
    flexDirection: 'row',
  },
  reviewComment: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 8,
  },
  reviewDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 12,
  },
});

export default SitterProfileScreen; 
