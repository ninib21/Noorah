import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

import Tabs from '../../components/Tabs';
import Button from '../../components/Button';
import { NeonBackground } from '../../components/ui/NeonBackground';
import { GlassCard } from '../../components/ui/GlassCard';
import { AnimatedCard } from '../../components/AnimatedComponents';
import type { RootStackParamList } from '../../navigation/types';
import { theme } from '../../styles/theme';

interface Booking {
  id: string;
  sitterName: string;
  sitterAvatar: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending';
  children: string[];
}

const ParentHomeScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  const bookings = useMemo<Booking[]>(
    () => [
      {
        id: '1',
        sitterName: 'Sarah Johnson',
        sitterAvatar: 'https://i.pravatar.cc/120?img=47',
        date: 'Today',
        time: '2:00 PM - 6:00 PM',
        status: 'confirmed',
        children: ['Emma (5)', 'Liam (3)'],
      },
      {
        id: '2',
        sitterName: 'Emily Chen',
        sitterAvatar: 'https://i.pravatar.cc/120?img=32',
        date: 'Tomorrow',
        time: '9:00 AM - 1:00 PM',
        status: 'pending',
        children: ['Emma (5)'],
      },
    ],
    [],
  );

  const quickActions = useMemo(
    () => [
      {
        id: 'book',
        title: 'Book a Sitter',
        icon: 'planet',
        gradient: ['rgba(124, 58, 237, 0.5)', 'rgba(14, 165, 233, 0.4)'],
        onPress: () => navigation.navigate('ParentBook'),
      },
      {
        id: 'messages',
        title: 'Messages',
        icon: 'chatbubbles',
        gradient: ['rgba(236, 72, 153, 0.42)', 'rgba(14, 165, 233, 0.28)'],
        onPress: () => navigation.navigate('ParentMessages'),
      },
      {
        id: 'my-sitters',
        title: 'My Sitters',
        icon: 'people',
        gradient: ['rgba(236, 72, 153, 0.38)', 'rgba(245, 158, 11, 0.34)'],
        onPress: () => navigation.navigate('ParentMySitters'),
      },
      {
        id: 'sos',
        title: 'Emergency SOS',
        icon: 'warning',
        gradient: ['rgba(248, 113, 113, 0.35)', 'rgba(236, 72, 153, 0.26)'],
        onPress: () => navigation.navigate('EmergencySOS'),
      },
    ],
    [navigation],
  );

  const renderBookingCard = (booking: Booking) => (
    <AnimatedCard key={booking.id} direction="up">
      <GlassCard style={styles.bookingCard}>
        <View style={styles.bookingHeader}>
          <Image source={{ uri: booking.sitterAvatar }} style={styles.bookingAvatar} />
          <View style={styles.bookingInfo}>
            <Text style={styles.bookingName}>{booking.sitterName}</Text>
            <Text style={styles.bookingMeta}>{booking.date} - {booking.time}</Text>
            <Text style={styles.bookingChildren}>{booking.children.join(', ')}</Text>
          </View>
          <View style={[styles.statusBadge, booking.status === 'confirmed' ? styles.statusConfirmed : styles.statusPending]}>
            <Text style={styles.statusText}>{booking.status === 'confirmed' ? 'Confirmed' : 'Pending'}</Text>
          </View>
        </View>
        <View style={styles.bookingActions}>
          <Button title="Message" variant="outline" size="small" onPress={() => navigation.navigate('ParentMessages')} />
          <Button
            title="View Details"
            variant="ghost"
            size="small"
            onPress={() => navigation.navigate('BookingFlow', {
              sitterId: booking.id,
              date: booking.date,
              time: booking.time,
            })}
          />
        </View>
      </GlassCard>
    </AnimatedCard>
  );

  return (
    <NeonBackground>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.hero}>
            <View style={styles.heroTextGroup}>
              <Text style={styles.heroGreeting}>Welcome back, Jennifer</Text>
              <Text style={styles.heroSubtitle}>Here's what Guardian Mode orchestrated for your family today.</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('ParentProfile')} style={styles.heroAvatarWrap}>
              <Image source={{ uri: 'https://i.pravatar.cc/120?img=12' }} style={styles.heroAvatar} />
            </TouchableOpacity>
          </View>

          <GlassCard intensity="bold" style={styles.insightCard}>
            <View style={styles.insightRow}>
              <View style={styles.insightBadge}>
                <Ionicons name="sparkles" size={20} color={theme.colors.white} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.insightTitle}>Guardian Insight</Text>
                <Text style={styles.insightCopy}>Emma's bedtime shifted 20 minutes last week. Noorah suggests a calming sitter session tonight.</Text>
              </View>
              <Button title="Schedule" variant="outline" size="small" onPress={() => navigation.navigate('ParentBook')} />
            </View>
          </GlassCard>

          <View style={styles.quickActionsGrid}>
            {quickActions.map(action => (
              <TouchableOpacity key={action.id} onPress={action.onPress} activeOpacity={0.85}>
                <GlassCard
                  style={styles.quickActionCard}
                  intensity="bold"
                  gradient={action.gradient as readonly [string, string]}
                >
                  <View style={styles.quickIconWrap}>
                    <Ionicons name={action.icon as any} size={26} color={theme.colors.white} />
                  </View>
                  <Text style={styles.quickTitle}>{action.title}</Text>
                </GlassCard>
              </TouchableOpacity>
            ))}
          </View>

          <GlassCard style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Bookings Orbit</Text>
              <Tabs
                tabs={[{ key: 'upcoming', title: 'Upcoming' }, { key: 'past', title: 'Past' }]}
                activeTab={activeTab}
                onTabPress={tab => setActiveTab(tab as 'upcoming' | 'past')}
                variant="pills"
              />
            </View>
            <View style={styles.sectionBody}>
              {(activeTab === 'upcoming' ? bookings : [])
                .map(renderBookingCard)}
            </View>
          </GlassCard>

          <GlassCard style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Safety Systems</Text>
              <Button title="Emergency SOS" variant="secondary" size="small" onPress={() => navigation.navigate('EmergencySOS')} />
            </View>
            <View style={styles.safetyRow}>
              <View style={styles.safetyPoint}>
                <Ionicons name="shield-checkmark" size={20} color={theme.colors.accent} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.safetyLabel}>Guardian Mode</Text>
                  <Text style={styles.safetyCopy}>Live telemetry & biometric alerts active.</Text>
                </View>
              </View>
              <View style={styles.safetyPoint}>
                <Ionicons name="location" size={20} color={theme.colors.accent} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.safetyLabel}>Geo Shields</Text>
                  <Text style={styles.safetyCopy}>Home radius locked - 2 fallback contacts armed.</Text>
                </View>
              </View>
            </View>
          </GlassCard>
        </ScrollView>
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
  hero: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroTextGroup: {
    flex: 1,
    marginRight: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  heroGreeting: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.white,
  },
  heroSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    lineHeight: 20,
    color: 'rgba(226,232,240,0.78)',
  },
  heroAvatarWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    borderColor: 'rgba(124, 58, 237, 0.6)',
    padding: 3,
  },
  heroAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 26,
  },
  insightCard: {
    padding: theme.spacing.lg,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  insightBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(236, 72, 153, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightTitle: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.white,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  insightCopy: {
    color: 'rgba(226,232,240,0.75)',
    fontSize: theme.typography.fontSize.sm,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  quickActionCard: {
    width: (width - theme.spacing.lg * 2 - theme.spacing.md) / 2 - 4,
    minHeight: 120,
    justifyContent: 'space-between',
  },
  quickIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickTitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.white,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  sectionCard: {
    gap: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.white,
  },
  sectionBody: {
    gap: theme.spacing.md,
  },
  bookingCard: {
    gap: theme.spacing.md,
  },
  bookingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  bookingAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  bookingInfo: {
    flex: 1,
    gap: 4,
  },
  bookingName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.white,
  },
  bookingMeta: {
    fontSize: theme.typography.fontSize.sm,
    color: 'rgba(226,232,240,0.78)',
  },
  bookingChildren: {
    fontSize: theme.typography.fontSize.xs,
    color: 'rgba(226,232,240,0.65)',
  },
  bookingActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusConfirmed: {
    backgroundColor: 'rgba(34, 211, 238, 0.3)',
  },
  statusPending: {
    backgroundColor: 'rgba(245, 158, 11, 0.28)',
  },
  statusText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    letterSpacing: 1,
  },
  safetyRow: {
    gap: theme.spacing.md,
  },
  safetyPoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  safetyLabel: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.white,
  },
  safetyCopy: {
    fontSize: theme.typography.fontSize.sm,
    color: 'rgba(226,232,240,0.7)',
  },
});

export default ParentHomeScreen;


