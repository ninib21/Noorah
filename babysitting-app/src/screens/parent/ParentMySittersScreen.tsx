import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Tabs from '../../components/Tabs';

const ParentMySittersScreen: React.FC = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('favorites');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data
  const favoriteSitters = [
    {
      id: '1',
      name: 'Sarah Johnson',
      avatar: 'https://via.placeholder.com/80',
      rating: 4.8,
      reviews: 127,
      hourlyRate: 25,
      experience: '5 years',
      skills: ['Infant Care', 'CPR Certified', 'First Aid'],
      isOnline: true,
      lastBooked: '2 days ago',
      totalBookings: 15,
    },
    {
      id: '2',
      name: 'Emily Chen',
      avatar: 'https://via.placeholder.com/80',
      rating: 4.9,
      reviews: 89,
      hourlyRate: 30,
      experience: '3 years',
      skills: ['Special Needs', 'Early Education', 'Bilingual'],
      isOnline: false,
      lastBooked: '1 week ago',
      totalBookings: 8,
    },
  ];

  const recentSitters = [
    {
      id: '3',
      name: 'Maria Rodriguez',
      avatar: 'https://via.placeholder.com/80',
      rating: 4.7,
      reviews: 203,
      hourlyRate: 22,
      experience: '7 years',
      skills: ['Infant Care', 'Meal Prep', 'Housekeeping'],
      isOnline: true,
      lastBooked: '3 days ago',
      totalBookings: 3,
    },
  ];

  const tabs = [
    { key: 'favorites', title: 'Favorites' },
    { key: 'recent', title: 'Recent' },
    { key: 'all', title: 'All Sitters' },
  ];

  const renderSitterCard = (sitter: any) => (
    <Card key={sitter.id} style={styles.sitterCard}>
      <View style={styles.sitterHeader}>
        <Image source={{ uri: sitter.avatar }} style={styles.sitterAvatar} />
        <View style={styles.sitterInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.sitterName}>{sitter.name}</Text>
            <View style={styles.onlineIndicator}>
              <View style={[
                styles.onlineDot,
                { backgroundColor: sitter.isOnline ? '#10B981' : '#94A3B8' }
              ]} />
            </View>
          </View>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>{sitter.rating}</Text>
            <Text style={styles.reviewsText}>({sitter.reviews} reviews)</Text>
          </View>
          <Text style={styles.experienceText}>{sitter.experience} experience</Text>
        </View>
        <View style={styles.rateContainer}>
          <Text style={styles.rateText}>${sitter.hourlyRate}</Text>
          <Text style={styles.rateLabel}>/hour</Text>
        </View>
      </View>

      <View style={styles.skillsContainer}>
        {sitter.skills.slice(0, 3).map((skill: string, index: number) => (
          <View key={index} style={styles.skillTag}>
            <Text style={styles.skillText}>{skill}</Text>
          </View>
        ))}
        {sitter.skills.length > 3 && (
          <Text style={styles.moreSkillsText}>+{sitter.skills.length - 3} more</Text>
        )}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Total Bookings</Text>
          <Text style={styles.statValue}>{sitter.totalBookings}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Last Booked</Text>
          <Text style={styles.statValue}>{sitter.lastBooked}</Text>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <Button
          title="Book Now"
          variant="primary"
          size="small"
          onPress={() => navigation.navigate('ParentBook' as never)}
        />
        <Button
          title="Message"
          variant="outline"
          size="small"
          onPress={() => navigation.navigate('ParentMessages' as never)}
        />
        <TouchableOpacity style={styles.favoriteButton}>
          <Ionicons name="heart" size={20} color="#FF7DB9" />
        </TouchableOpacity>
      </View>
    </Card>
  );

  const getSittersToShow = () => {
    switch (activeTab) {
      case 'favorites':
        return favoriteSitters;
      case 'recent':
        return recentSitters;
      case 'all':
        return [...favoriteSitters, ...recentSitters];
      default:
        return [];
    }
  };

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
          <Text style={styles.headerTitle}>My Sitters</Text>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Ionicons name="search" size={20} color="#64748B" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search sitters..."
                placeholderTextColor="#64748B"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <Tabs
              tabs={tabs}
              activeTab={activeTab}
              onTabPress={setActiveTab}
              variant="pills"
            />
          </View>

          {/* Sitters List */}
          <ScrollView style={styles.sittersList} showsVerticalScrollIndicator={false}>
            {getSittersToShow().map(renderSitterCard)}
            
            {getSittersToShow().length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="people" size={64} color="#CBD5E1" />
                <Text style={styles.emptyTitle}>No sitters found</Text>
                <Text style={styles.emptySubtitle}>
                  {activeTab === 'favorites' 
                    ? 'Add sitters to your favorites to see them here'
                    : 'Start booking sitters to build your list'
                  }
                </Text>
                <Button
                  title="Find Sitters"
                  variant="primary"
                  onPress={() => navigation.navigate('ParentBook' as never)}
                />
              </View>
            )}
          </ScrollView>
        </View>
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
  addButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  searchContainer: {
    padding: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1E293B',
  },
  tabsContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sittersList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sitterCard: {
    marginBottom: 16,
  },
  sitterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sitterAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  sitterInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sitterName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginRight: 8,
  },
  onlineIndicator: {
    alignItems: 'center',
  },
  onlineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  ratingRow: {
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
  reviewsText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 4,
  },
  experienceText: {
    fontSize: 14,
    color: '#64748B',
  },
  rateContainer: {
    alignItems: 'flex-end',
  },
  rateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3A7DFF',
  },
  rateLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
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
  moreSkillsText: {
    fontSize: 12,
    color: '#3A7DFF',
    fontWeight: '500',
    alignSelf: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  favoriteButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#64748B',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 40,
  },
});

export default ParentMySittersScreen; 