import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  FlatList,
  Alert,
  Dimensions,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { RootStackParamList } from '../../navigation/types';
import Button from '../../components/Button';

const { width } = Dimensions.get('window');

interface Sitter {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  hourlyRate: number;
  experience: string;
  location: string;
  availability: string[];
  skills: string[];
  verified: boolean;
  reviews: number;
}

const ParentBookScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'ParentBook'>>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDateValue, setSelectedDateValue] = useState<Date | null>(null);
  const [selectedTimeValue, setSelectedTimeValue] = useState<Date | null>(null);
  const [selectedDuration, setSelectedDuration] = useState(2);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [sitters, setSitters] = useState<Sitter[]>([]);
  const [filteredSitters, setFilteredSitters] = useState<Sitter[]>([]);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time' | null>(null);
  const [pickerTempValue, setPickerTempValue] = useState<Date>(new Date());

  // Mock data
  useEffect(() => {
    const mockSitters: Sitter[] = [
      {
        id: '1',
        name: 'Sarah Johnson',
        avatar: 'https://via.placeholder.com/60',
        rating: 4.8,
        hourlyRate: 25,
        experience: '5 years',
        location: 'Downtown',
        availability: ['Mon', 'Wed', 'Fri'],
        skills: ['Infant Care', 'CPR Certified', 'First Aid'],
        verified: true,
        reviews: 127,
      },
      {
        id: '2',
        name: 'Emily Chen',
        avatar: 'https://via.placeholder.com/60',
        rating: 4.9,
        hourlyRate: 30,
        experience: '3 years',
        location: 'Midtown',
        availability: ['Tue', 'Thu', 'Sat'],
        skills: ['Special Needs', 'Early Education', 'Bilingual'],
        verified: true,
        reviews: 89,
      },
      {
        id: '3',
        name: 'Maria Rodriguez',
        avatar: 'https://via.placeholder.com/60',
        rating: 4.7,
        hourlyRate: 22,
        experience: '7 years',
        location: 'Uptown',
        availability: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        skills: ['Infant Care', 'Meal Prep', 'Housekeeping'],
        verified: true,
        reviews: 203,
      },
    ];
    setSitters(mockSitters);
    setFilteredSitters(mockSitters);
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterToggle = (filter: string) => {
    const updatedFilters = selectedFilters.includes(filter)
      ? selectedFilters.filter(f => f !== filter)
      : [...selectedFilters, filter];
    setSelectedFilters(updatedFilters);
  };

  useEffect(() => {
    const filtered = sitters.filter(sitter => {
      const matchesQuery = !searchQuery ||
        sitter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sitter.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sitter.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesFilters = selectedFilters.length === 0 || selectedFilters.every(filter =>
        filter === 'Verified'
          ? sitter.verified
          : sitter.skills.some(skill => skill.toLowerCase().includes(filter.toLowerCase()))
      );

      return matchesQuery && matchesFilters;
    });

    setFilteredSitters(filtered);
  }, [searchQuery, selectedFilters, sitters]);

  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });

  const formattedDate = selectedDateValue ? formatDate(selectedDateValue) : '';
  const formattedTime = selectedTimeValue ? formatTime(selectedTimeValue) : '';

  const openPicker = (mode: 'date' | 'time') => {
    setPickerMode(mode);
    const baseValue =
      mode === 'date'
        ? selectedDateValue ?? new Date()
        : selectedTimeValue ?? selectedDateValue ?? new Date();
    setPickerTempValue(baseValue);
    setPickerVisible(true);
  };

  const closePicker = () => {
    setPickerVisible(false);
    setPickerMode(null);
  };

  const handlePickerChange = (_: any, nextValue?: Date) => {
    if (nextValue) {
      setPickerTempValue(nextValue);
    }
  };

  const handlePickerConfirm = () => {
    if (pickerMode === 'date') {
      setSelectedDateValue(pickerTempValue);
      if (!selectedTimeValue) {
        setSelectedTimeValue(pickerTempValue);
      }
    } else if (pickerMode === 'time') {
      setSelectedTimeValue(pickerTempValue);
    }
    closePicker();
  };

  const handleBookSitter = (sitter: Sitter) => {
    if (!selectedDateValue || !selectedTimeValue) {
      Alert.alert('Select Date & Time', 'Choose when you need care to continue booking.');
      if (!selectedDateValue) {
        openPicker('date');
      } else {
        openPicker('time');
      }
      return;
    }
    const dateDisplay = formattedDate;
    const timeDisplay = formattedTime;

    navigation.navigate('BookingFlow', {
      sitterId: sitter.id,
      date: dateDisplay,
      time: timeDisplay,
    });

    Alert.alert('Booking Created', `Booking ${sitter.name} for ${dateDisplay} at ${timeDisplay}`);
  };

  const renderSitterCard = ({ item }: { item: Sitter }) => (
    <View style={styles.sitterCard}>
      <View style={styles.sitterHeader}>
        <Image source={{ uri: item.avatar }} style={styles.sitterAvatar} />
        <View style={styles.sitterInfo}>
          <View style={styles.sitterNameRow}>
            <Text style={styles.sitterName}>{item.name}</Text>
            {item.verified && (
              <Ionicons name="checkmark-circle" size={16} color="#3A7DFF" />
            )}
          </View>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingText}>{item.rating}</Text>
            <Text style={styles.reviewsText}>({item.reviews} reviews)</Text>
          </View>
          <Text style={styles.sitterLocation}>{item.location}</Text>
        </View>
        <View style={styles.rateContainer}>
          <Text style={styles.rateText}>${item.hourlyRate}</Text>
          <Text style={styles.rateLabel}>/hour</Text>
        </View>
      </View>

      <View style={styles.sitterDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="time" size={14} color="#64748B" />
          <Text style={styles.detailText}>{item.experience} experience</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="calendar" size={14} color="#64748B" />
          <Text style={styles.detailText}>Available: {item.availability.join(', ')}</Text>
        </View>
      </View>

      <View style={styles.skillsContainer}>
        {item.skills.slice(0, 3).map((skill, index) => (
          <View key={index} style={styles.skillTag}>
            <Text style={styles.skillText}>{skill}</Text>
          </View>
        ))}
        {item.skills.length > 3 && (
          <Text style={styles.moreSkillsText}>+{item.skills.length - 3} more</Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.bookButton}
        onPress={() => handleBookSitter(item)}
      >
        <Text style={styles.bookButtonText}>Book Now</Text>
      </TouchableOpacity>
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
          <Text style={styles.headerTitle}>Find a Sitter</Text>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="filter" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Ionicons name="search" size={20} color="#64748B" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search sitters, skills, or location..."
                placeholderTextColor="#64748B"
                value={searchQuery}
                onChangeText={handleSearch}
              />
            </View>
          </View>

          {/* Date and Time Selection */}
          <View style={styles.selectionContainer}>
            <Text style={styles.sectionTitle}>When do you need care?</Text>
            
            <View style={styles.dateTimeRow}>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => openPicker('date')}
              >
                <Ionicons name="calendar" size={20} color="#3A7DFF" />
                <Text style={styles.dateButtonText}>
                  {formattedDate || 'Select Date'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => openPicker('time')}
              >
                <Ionicons name="time" size={20} color="#3A7DFF" />
                <Text style={styles.timeButtonText}>
                  {formattedTime || 'Select Time'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.durationContainer}>
              <Text style={styles.durationLabel}>Duration: {selectedDuration} hours</Text>
              <View style={styles.durationSlider}>
                {[2, 3, 4, 5, 6].map(hours => (
                  <TouchableOpacity
                    key={hours}
                    style={[
                      styles.durationButton,
                      selectedDuration === hours && styles.durationButtonActive,
                    ]}
                    onPress={() => setSelectedDuration(hours)}
                  >
                    <Text
                      style={[
                        styles.durationButtonText,
                        selectedDuration === hours && styles.durationButtonTextActive,
                      ]}
                    >
                      {hours}h
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Filters */}
          <View style={styles.filtersContainer}>
            <Text style={styles.sectionTitle}>Filters</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {['CPR Certified', 'First Aid', 'Infant Care', 'Special Needs', 'Bilingual'].map(filter => (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterTag,
                    selectedFilters.includes(filter) && styles.filterTagActive,
                  ]}
                  onPress={() => handleFilterToggle(filter)}
                >
                  <Text
                    style={[
                      styles.filterTagText,
                      selectedFilters.includes(filter) && styles.filterTagTextActive,
                    ]}
                  >
                    {filter}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Sitters List */}
          <View style={styles.sittersContainer}>
            <Text style={styles.sectionTitle}>
              Available Sitters ({filteredSitters.length})
            </Text>
            <FlatList
              data={filteredSitters}
              renderItem={renderSitterCard}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </View>

          <View style={styles.backButtonContainer}>
            <Button
              title="Back"
              variant="outline"
              size="medium"
              onPress={() => navigation.goBack()}
            />
          </View>
        </ScrollView>
      </LinearGradient>
      <Modal
        transparent
        visible={pickerVisible}
        animationType="fade"
        onRequestClose={closePicker}
      >
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerCard}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>
                {pickerMode === 'time' ? 'Select Time' : 'Select Date'}
              </Text>
              <TouchableOpacity onPress={closePicker}>
                <Ionicons name="close" size={22} color="#94A3B8" />
              </TouchableOpacity>
            </View>
            {pickerMode && (
              <DateTimePicker
                value={pickerTempValue}
                mode={pickerMode}
                display="spinner"
                onChange={handlePickerChange}
              />
            )}
            <View style={styles.pickerActions}>
              <Button title="Confirm" variant="primary" size="medium" onPress={handlePickerConfirm} />
            </View>
          </View>
        </View>
      </Modal>
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
  filterButton: {
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
  selectionContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginLeft: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dateButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
  },
  timeButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
  },
  durationContainer: {
    marginBottom: 20,
  },
  durationLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
  },
  durationSlider: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  durationButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  durationButtonActive: {
    backgroundColor: '#3A7DFF',
    borderColor: '#3A7DFF',
  },
  durationButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  durationButtonTextActive: {
    color: '#FFFFFF',
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButtonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  pickerCard: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  pickerActions: {
    marginTop: 16,
  },
  filterTag: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterTagActive: {
    backgroundColor: '#3A7DFF',
    borderColor: '#3A7DFF',
  },
  filterTagText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  filterTagTextActive: {
    color: '#FFFFFF',
  },
  sittersContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sitterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sitterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sitterAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  sitterInfo: {
    flex: 1,
  },
  sitterNameRow: {
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
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
    marginLeft: 4,
  },
  reviewsText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 4,
  },
  sitterLocation: {
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
  sitterDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 8,
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
  bookButton: {
    backgroundColor: '#3A7DFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ParentBookScreen; 
