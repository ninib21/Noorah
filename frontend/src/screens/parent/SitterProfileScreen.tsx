import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp, SlideInLeft, SlideInRight, ZoomIn } from 'react-native-reanimated';
import { AnimatedButton, AnimatedCard, AnimatedPulse, AnimatedGradientBackground } from '../../components/AnimatedComponents';
import FeedbackService from '../../services/feedback.service';

const SitterProfileScreen: React.FC = () => {
  const [sitter, setSitter] = useState({
    id: '1',
    name: 'Sarah Johnson',
    rating: 4.8,
    totalReviews: 127,
    hourlyRate: 25,
    experience: '5 years',
    location: 'Downtown',
    availability: 'Available Now',
    bio: 'Experienced and caring babysitter with 5 years of experience working with children of all ages. I love creating fun, educational activities and ensuring a safe environment.',
    specialties: ['Infants', 'Toddlers', 'Special Needs', 'Homework Help'],
    certifications: ['CPR Certified', 'First Aid', 'Child Development'],
    languages: ['English', 'Spanish'],
    reviews: [
      { id: '1', rating: 5, comment: 'Sarah was amazing with our 2-year-old! Very patient and caring.', author: 'Maria L.', date: '2 days ago' },
      { id: '2', rating: 5, comment: 'Highly recommend! My kids love her and she\'s very reliable.', author: 'John D.', date: '1 week ago' },
      { id: '3', rating: 4, comment: 'Great sitter, very professional and punctual.', author: 'Lisa M.', date: '2 weeks ago' },
    ]
  });

  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedTab, setSelectedTab] = useState('about');
  
  const feedbackService = FeedbackService.getInstance();

  useEffect(() => {
    feedbackService.trackScreen('SitterProfileScreen');
  }, []);

  const handleBookNow = () => {
    feedbackService.trackAction('book_sitter', 'SitterProfileScreen', { sitterId: sitter.id });
    Alert.alert('Booking', 'Redirecting to booking flow...');
  };

  const handleMessage = () => {
    feedbackService.trackAction('message_sitter', 'SitterProfileScreen', { sitterId: sitter.id });
    Alert.alert('Message', 'Opening chat...');
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    feedbackService.trackAction('toggle_favorite', 'SitterProfileScreen', { 
      sitterId: sitter.id, 
      isFavorite: !isFavorite 
    });
  };

  const renderHeader = () => (
    <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
      <View style={styles.headerContent}>
        <View style={styles.profileImage}>
          <Ionicons name="person" size={48} color="#3A7DFF" />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.sitterName}>{sitter.name}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.rating}>{sitter.rating}</Text>
            <Text style={styles.reviewCount}>({sitter.totalReviews} reviews)</Text>
          </View>
          <Text style={styles.location}>{sitter.location}</Text>
          <AnimatedPulse style={styles.availabilityBadge}>
            <Text style={styles.availabilityText}>{sitter.availability}</Text>
          </AnimatedPulse>
        </View>
        <TouchableOpacity onPress={handleToggleFavorite} style={styles.favoriteButton}>
          <Ionicons 
            name={isFavorite ? "heart" : "heart-outline"} 
            size={24} 
            color={isFavorite ? "#EF4444" : "#FFFFFF"} 
          />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderQuickActions = () => (
    <Animated.View entering={FadeInUp.delay(200)} style={styles.quickActions}>
      <AnimatedButton
        title="Book Now"
        onPress={handleBookNow}
        variant="primary"
        size="large"
        style={styles.bookButton}
      />
      <AnimatedButton
        title="Message"
        onPress={handleMessage}
        variant="secondary"
        size="large"
        icon="chatbubble"
      />
    </Animated.View>
  );

  const renderTabs = () => (
    <Animated.View entering={FadeInUp.delay(300)} style={styles.tabContainer}>
      {[
        { id: 'about', title: 'About', icon: 'person' },
        { id: 'reviews', title: 'Reviews', icon: 'star' },
        { id: 'certifications', title: 'Certifications', icon: 'shield-checkmark' },
      ].map((tab, index) => (
        <TouchableOpacity
          key={tab.id}
          style={[styles.tab, selectedTab === tab.id && styles.tabActive]}
          onPress={() => setSelectedTab(tab.id)}
        >
          <Ionicons 
            name={tab.icon as any} 
            size={20} 
            color={selectedTab === tab.id ? "#3A7DFF" : "#6B7280"} 
          />
          <Text style={[styles.tabText, selectedTab === tab.id && styles.tabTextActive]}>
            {tab.title}
          </Text>
        </TouchableOpacity>
      ))}
    </Animated.View>
  );

  const renderAboutTab = () => (
    <Animated.View entering={SlideInLeft.delay(400)} style={styles.tabContent}>
      <AnimatedCard direction="up" delay={100}>
        <Text style={styles.sectionTitle}>About {sitter.name}</Text>
        <Text style={styles.bio}>{sitter.bio}</Text>
      </AnimatedCard>

      <AnimatedCard direction="up" delay={200}>
        <Text style={styles.sectionTitle}>Specialties</Text>
        <View style={styles.specialtiesContainer}>
          {sitter.specialties.map((specialty, index) => (
            <Animated.View key={specialty} entering={ZoomIn.delay(index * 100)}>
              <View style={styles.specialtyTag}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text style={styles.specialtyText}>{specialty}</Text>
              </View>
            </Animated.View>
          ))}
        </View>
      </AnimatedCard>

      <AnimatedCard direction="up" delay={300}>
        <Text style={styles.sectionTitle}>Languages</Text>
        <View style={styles.languagesContainer}>
          {sitter.languages.map((language, index) => (
            <Animated.View key={language} entering={ZoomIn.delay(index * 100)}>
              <View style={styles.languageTag}>
                <Text style={styles.languageText}>{language}</Text>
              </View>
            </Animated.View>
          ))}
        </View>
      </AnimatedCard>

      <AnimatedCard direction="up" delay={400}>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{sitter.experience}</Text>
            <Text style={styles.statLabel}>Experience</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>${sitter.hourlyRate}</Text>
            <Text style={styles.statLabel}>Per Hour</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{sitter.totalReviews}</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
        </View>
      </AnimatedCard>
    </Animated.View>
  );

  const renderReviewsTab = () => (
    <Animated.View entering={SlideInRight.delay(400)} style={styles.tabContent}>
      {sitter.reviews.map((review, index) => (
        <AnimatedCard key={review.id} direction="up" delay={index * 100} style={styles.reviewCard}>
          <View style={styles.reviewHeader}>
            <View style={styles.reviewAuthor}>
              <View style={styles.authorAvatar}>
                <Ionicons name="person" size={20} color="#6B7280" />
              </View>
              <View>
                <Text style={styles.authorName}>{review.author}</Text>
                <Text style={styles.reviewDate}>{review.date}</Text>
              </View>
            </View>
            <View style={styles.reviewRating}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= review.rating ? "star" : "star-outline"}
                  size={16}
                  color="#FFD700"
                />
              ))}
            </View>
          </View>
          <Text style={styles.reviewComment}>{review.comment}</Text>
        </AnimatedCard>
      ))}
    </Animated.View>
  );

  const renderCertificationsTab = () => (
    <Animated.View entering={SlideInLeft.delay(400)} style={styles.tabContent}>
      {sitter.certifications.map((cert, index) => (
        <AnimatedCard key={cert} direction="up" delay={index * 100} style={styles.certificationCard}>
          <View style={styles.certificationContent}>
            <View style={styles.certificationIcon}>
              <Ionicons name="shield-checkmark" size={24} color="#10B981" />
            </View>
            <View style={styles.certificationInfo}>
              <Text style={styles.certificationTitle}>{cert}</Text>
              <Text style={styles.certificationStatus}>Verified</Text>
            </View>
            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
          </View>
        </AnimatedCard>
      ))}
    </Animated.View>
  );

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'about':
        return renderAboutTab();
      case 'reviews':
        return renderReviewsTab();
      case 'certifications':
        return renderCertificationsTab();
      default:
        return null;
    }
  };

  return (
    <AnimatedGradientBackground>
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {renderHeader()}
          {renderQuickActions()}
          {renderTabs()}
          {renderTabContent()}
          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </AnimatedGradientBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20 },
  headerContent: { flexDirection: 'row', alignItems: 'center' },
  profileImage: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    backgroundColor: '#F3F4F6', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: 16 
  },
  profileInfo: { flex: 1 },
  sitterName: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 4 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  rating: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginLeft: 4 },
  reviewCount: { fontSize: 14, color: '#FFFFFF', opacity: 0.8, marginLeft: 4 },
  location: { fontSize: 14, color: '#FFFFFF', opacity: 0.8, marginBottom: 8 },
  availabilityBadge: { 
    alignSelf: 'flex-start', 
    backgroundColor: '#10B981', 
    paddingHorizontal: 12, 
    paddingVertical: 4, 
    borderRadius: 12 
  },
  availabilityText: { fontSize: 12, color: '#FFFFFF', fontWeight: '600' },
  favoriteButton: { padding: 8 },
  quickActions: { 
    flexDirection: 'row', 
    paddingHorizontal: 20, 
    gap: 12, 
    marginBottom: 20 
  },
  bookButton: { flex: 1 },
  tabContainer: { 
    flexDirection: 'row', 
    paddingHorizontal: 20, 
    marginBottom: 20 
  },
  tab: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 12, 
    borderRadius: 8 
  },
  tabActive: { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
  tabText: { fontSize: 14, color: '#FFFFFF', marginLeft: 4 },
  tabTextActive: { fontWeight: '600' },
  tabContent: { paddingHorizontal: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#FFFFFF', marginBottom: 12 },
  bio: { fontSize: 16, color: '#FFFFFF', lineHeight: 24, marginBottom: 16 },
  specialtiesContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  specialtyTag: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(16, 185, 129, 0.2)', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 16 
  },
  specialtyText: { fontSize: 14, color: '#10B981', marginLeft: 4, fontWeight: '500' },
  languagesContainer: { flexDirection: 'row', gap: 8 },
  languageTag: { 
    backgroundColor: 'rgba(59, 130, 246, 0.2)', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 16 
  },
  languageText: { fontSize: 14, color: '#3B82F6', fontWeight: '500' },
  statsContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    alignItems: 'center' 
  },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#FFFFFF', opacity: 0.8 },
  statDivider: { width: 1, height: 40, backgroundColor: 'rgba(255, 255, 255, 0.2)' },
  reviewCard: { marginBottom: 16 },
  reviewHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  reviewAuthor: { flexDirection: 'row', alignItems: 'center' },
  authorAvatar: { 
    width: 32, 
    height: 32, 
    borderRadius: 16, 
    backgroundColor: '#F3F4F6', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: 8 
  },
  authorName: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  reviewDate: { fontSize: 12, color: '#6B7280' },
  reviewRating: { flexDirection: 'row' },
  reviewComment: { fontSize: 14, color: '#374151', lineHeight: 20 },
  certificationCard: { marginBottom: 12 },
  certificationContent: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16 
  },
  certificationIcon: { marginRight: 12 },
  certificationInfo: { flex: 1 },
  certificationTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 2 },
  certificationStatus: { fontSize: 12, color: '#10B981', fontWeight: '500' },
});

export default SitterProfileScreen; 
