import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

import Button from '../../components/Button';
import { NeonBackground } from '../../components/ui/NeonBackground';
import { GlassCard } from '../../components/ui/GlassCard';
import { AnimatedCard } from '../../components/AnimatedComponents';
import type { RootStackParamList } from '../../navigation/types';
import { theme } from '../../styles/theme';

interface Sitter {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  hourlyRate: number;
  experience: string;
  location: string;
  skills: string[];
  verified: boolean;
}

export const ParentBookScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'ParentBook'>>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [duration, setDuration] = useState(3);
  const [selectedFilters, setSelectedFilters] = useState<string[]>(['Verified']);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time' | null>(null);
  const [pickerValue, setPickerValue] = useState<Date>(new Date());

  const sitters = useMemo<Sitter[]>(
    () => [
      {
        id: '1',
        name: 'Sarah Johnson',
        avatar: 'https://i.pravatar.cc/120?img=48',
        rating: 4.8,
        hourlyRate: 25,
        experience: '5 years',
        location: 'Aurora District',
        skills: ['Infant Care', 'CPR Certified', 'First Aid', 'Night Routine'],
        verified: true,
      },
      {
        id: '2',
        name: 'Emily Chen',
        avatar: 'https://i.pravatar.cc/120?img=38',
        rating: 4.9,
        hourlyRate: 30,
        experience: '3 years',
        location: 'Nebula Heights',
        skills: ['Special Needs', 'STEM Play', 'Bilingual'],
        verified: true,
      },
      {
        id: '3',
        name: 'Maria Rodriguez',
        avatar: 'https://i.pravatar.cc/120?img=21',
        rating: 4.7,
        hourlyRate: 22,
        experience: '7 years',
        location: 'Cosmic Gardens',
        skills: ['Infant Care', 'Meal Prep', 'Homework'],
        verified: true,
      },
    ],
    [],
  );

  const filters = ['Verified', 'Infant Care', 'Special Needs', 'Bilingual', 'Homework'];

  const handleFilterToggle = (filter: string) => {
    setSelectedFilters(prev =>
      prev.includes(filter)
        ? prev.filter(item => item !== filter)
        : [...prev, filter]
    );
  };

  const openPicker = (mode: 'date' | 'time') => {
    setPickerMode(mode);
    const base = mode === 'date' ? selectedDate ?? new Date() : selectedTime ?? selectedDate ?? new Date();
    setPickerValue(base);
    setPickerVisible(true);
  };

  const closePicker = () => {
    setPickerVisible(false);
    setPickerMode(null);
  };

  const confirmPicker = () => {
    if (pickerMode === 'date') {
      setSelectedDate(pickerValue);
      if (!selectedTime) setSelectedTime(pickerValue);
    } else if (pickerMode === 'time') {
      setSelectedTime(pickerValue);
    }
    closePicker();
  };

  const formattedDate = selectedDate
    ? selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    : '';

  const formattedTime = selectedTime
    ? selectedTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    : '';

  const filteredSitters = sitters.filter(sitter => {
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

  const handleBookSitter = (sitter: Sitter) => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Select Date & Time', 'Choose when you need care to continue booking.');
      openPicker(selectedDate ? 'time' : 'date');
      return;
    }

    const dateDisplay = formattedDate;
    const timeDisplay = formattedTime;

    navigation.navigate('BookingFlow', {
      sitterId: sitter.id,
      date: dateDisplay,
      time: timeDisplay,
    });

    Alert.alert('Quantum Booking Created', `${sitter.name} reserved for ${dateDisplay} - ${timeDisplay}`);
  };

  return (
    <NeonBackground>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={22} color={theme.colors.white} />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Find a Sitter</Text>
            <TouchableOpacity onPress={() => Alert.alert('Filters', 'Advanced filters coming soon.')} style={styles.filterButton}>
              <Ionicons name="settings-outline" size={22} color={theme.colors.white} />
            </TouchableOpacity>
          </View>

          <GlassCard style={styles.searchCard}>
            <View style={styles.searchInputWrap}>
              <Ionicons name="search" size={20} color="rgba(255,255,255,0.6)" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search sitter, skill, or constellation..."
                placeholderTextColor="rgba(226,232,240,0.5)"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <Text style={styles.searchHelper}>Try "STEM play" - "Evening" - "Bilingual"</Text>
          </GlassCard>

          <GlassCard intensity="bold" style={styles.scheduleCard}>
            <Text style={styles.sectionTitle}>Schedule Session</Text>
            <View style={styles.scheduleRow}>
              <TouchableOpacity style={styles.scheduleSelector} onPress={() => openPicker('date')}>
                <Ionicons name="calendar" size={20} color={theme.colors.white} />
                <Text style={styles.selectorLabel}>{formattedDate || 'Select Date'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.scheduleSelector} onPress={() => openPicker('time')}>
                <Ionicons name="time" size={20} color={theme.colors.white} />
                <Text style={styles.selectorLabel}>{formattedTime || 'Select Time'}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.durationRow}>
              {[2, 3, 4, 5].map(hours => (
                <TouchableOpacity
                  key={hours}
                  style={[styles.durationChip, duration === hours && styles.durationChipActive]}
                  onPress={() => setDuration(hours)}
                >
                  <Text style={[styles.durationText, duration === hours && styles.durationTextActive]}>{hours}h</Text>
                </TouchableOpacity>
              ))}
            </View>
          </GlassCard>

          <GlassCard style={styles.filterCard}>
            <Text style={styles.sectionTitle}>Enhance Matching</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
              {filters.map(filter => (
                <TouchableOpacity
                  key={filter}
                  style={[styles.filterChip, selectedFilters.includes(filter) && styles.filterChipActive]}
                  onPress={() => handleFilterToggle(filter)}
                >
                  <Text style={[styles.filterText, selectedFilters.includes(filter) && styles.filterTextActive]}>{filter}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </GlassCard>

          <View style={styles.listHeader}>
            <Text style={styles.sectionTitle}>Available Sitters</Text>
            <Text style={styles.sectionMeta}>{filteredSitters.length} cosmic matches</Text>
          </View>

          <View style={styles.listContainer}>
            {filteredSitters.map((sitter, index) => (
              <AnimatedCard key={sitter.id} direction="up" delay={index * 80}>
                <GlassCard style={styles.sitterCard}>
                  <View style={styles.sitterHeader}>
                    <Image source={{ uri: sitter.avatar }} style={styles.sitterAvatar} />
                    <View style={styles.sitterInfo}>
                      <View style={styles.sitterTopRow}>
                        <Text style={styles.sitterName}>{sitter.name}</Text>
                        {sitter.verified && (
                          <Ionicons name="shield-checkmark" size={18} color={theme.colors.accent} />
                        )}
                      </View>
                      <View style={styles.ratingRow}>
                        <Ionicons name="star" size={16} color="#FBBF24" />
                        <Text style={styles.ratingText}>{sitter.rating} - {sitter.experience}</Text>
                      </View>
                      <Text style={styles.locationText}>{sitter.location}</Text>
                    </View>
                    <View style={styles.rateBubble}>
                      <Text style={styles.rateAmount}>${sitter.hourlyRate}</Text>
                      <Text style={styles.rateUnit}>/hr</Text>
                    </View>
                  </View>
                  <View style={styles.skillRow}>
                    {sitter.skills.slice(0, 3).map(skill => (
                      <View key={skill} style={styles.skillChip}>
                        <Text style={styles.skillText}>{skill}</Text>
                      </View>
                    ))}
                    {sitter.skills.length > 3 && (
                      <Text style={styles.moreSkills}>+{sitter.skills.length - 3} more</Text>
                    )}
                  </View>
                  <Button title="Book Now" variant="primary" size="medium" onPress={() => handleBookSitter(sitter)} />
                </GlassCard>
              </AnimatedCard>
            ))}
          </View>

          <View style={styles.backRow}>
            <Button title="Back" variant="outline" size="medium" onPress={() => navigation.goBack()} />
          </View>
        </ScrollView>

        <Modal
          visible={pickerVisible}
          transparent
          animationType="fade"
          onRequestClose={closePicker}
        >
          <View style={styles.pickerOverlay}>
            <View style={styles.pickerCard}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>{pickerMode === 'time' ? 'Select Time' : 'Select Date'}</Text>
                <TouchableOpacity onPress={closePicker}>
                  <Ionicons name="close" size={22} color="#94A3B8" />
                </TouchableOpacity>
              </View>
              {pickerMode && (
                <DateTimePicker
                  value={pickerValue}
                  mode={pickerMode}
                  display="spinner"
                  onChange={(_, date) => date && setPickerValue(date)}
                />
              )}
              <View style={styles.pickerActions}>
                <Button title="Confirm" variant="primary" size="medium" onPress={confirmPicker} />
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </NeonBackground>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing['2xl'],
    paddingBottom: theme.spacing['3xl'],
    gap: theme.spacing['2xl'],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  backText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.white,
  },
  filterButton: {
    padding: theme.spacing.xs,
  },
  searchCard: {
    gap: theme.spacing.sm,
  },
  searchInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.base,
  },
  searchHelper: {
    fontSize: theme.typography.fontSize.xs,
    color: 'rgba(226,232,240,0.6)',
  },
  scheduleCard: {
    gap: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.white,
  },
  scheduleRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  scheduleSelector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: theme.borderRadius.md,
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  selectorLabel: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.base,
  },
  durationRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  durationChip: {
    flex: 1,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.3)',
  },
  durationChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  durationText: {
    color: 'rgba(226,232,240,0.75)',
    fontSize: theme.typography.fontSize.base,
  },
  durationTextActive: {
    color: theme.colors.white,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  filterCard: {
    gap: theme.spacing.md,
  },
  filterRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  filterChip: {
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.3)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  filterChipActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  filterText: {
    color: 'rgba(226,232,240,0.75)',
    fontSize: theme.typography.fontSize.sm,
  },
  filterTextActive: {
    color: theme.colors.white,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionMeta: {
    color: 'rgba(226,232,240,0.6)',
    fontSize: theme.typography.fontSize.sm,
  },
  listContainer: {
    gap: theme.spacing.lg,
  },
  sitterCard: {
    gap: theme.spacing.lg,
  },
  sitterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  sitterAvatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
  },
  sitterInfo: {
    flex: 1,
    gap: 6,
  },
  sitterTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  sitterName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.white,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  ratingText: {
    fontSize: theme.typography.fontSize.sm,
    color: 'rgba(226,232,240,0.78)',
  },
  locationText: {
    fontSize: theme.typography.fontSize.xs,
    color: 'rgba(226,232,240,0.65)',
  },
  rateBubble: {
    alignItems: 'flex-end',
  },
  rateAmount: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.white,
  },
  rateUnit: {
    fontSize: theme.typography.fontSize.xs,
    color: 'rgba(226,232,240,0.7)',
  },
  skillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  skillChip: {
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  skillText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.xs,
  },
  moreSkills: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.accent,
    alignSelf: 'center',
  },
  backRow: {
    alignItems: 'center',
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(8,5,36,0.7)',
    justifyContent: 'flex-end',
  },
  pickerCard: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: theme.spacing['2xl'],
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  pickerTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.white,
  },
  pickerActions: {
    marginTop: theme.spacing.lg,
  },
});

export default ParentBookScreen;

