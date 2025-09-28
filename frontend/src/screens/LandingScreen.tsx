import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Dimensions,
  Animated,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Button } from '../components/ui/Button';
import { AnimatedCard, AnimatedPulse } from '../components/AnimatedComponents';
import { GlassCard } from '../components/ui/GlassCard';
import { NeonBackground } from '../components/ui/NeonBackground';
import { theme } from '../styles/theme';

const { width } = Dimensions.get('window');

const FEATURES = [
  {
    icon: 'pulse',
    title: 'Live Session Telemetry',
    copy: 'Heartbeat, GPS, and emotional cues stream into your Guardian dashboard in real-time.',
  },
  {
    icon: 'chatbubbles',
    title: 'Immersive Holo Chat',
    copy: 'Encrypted messaging with voice notes, AR stickers, and instant emergency macros.',
  },
  {
    icon: 'sparkles',
    title: 'Quantum Recommendations',
    copy: 'AI aligns parenting styles, household rhythms, and kid personalities to curate sitter matches.',
  },
  {
    icon: 'card',
    title: 'Vaulted Payments',
    copy: 'Split bookings, micro-tips, and escrow releases all guided by the Noorah payment vault.',
  },
];

interface LandingScreenProps {
  navigation: any;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({ navigation }) => {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -12,
          duration: 2600,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 12,
          duration: 2600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [floatAnim]);

  useEffect(() => {
    Animated.loop(
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 4800,
        useNativeDriver: true,
      })
    ).start();
  }, [pulseAnim]);

  const pulseStyle = {
    transform: [
      {
        translateX: pulseAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-20, width * 0.55],
        }),
      },
    ],
  };

  return (
    <NeonBackground>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          <View style={styles.header}>
            <Text style={styles.badge}>Quantum Edition</Text>
            <Text style={styles.logo}>Noorah</Text>
            <Text style={styles.tagline}>
              Navigate childcare inside an aurora of trust. Noorah synchronizes elite sitters, guardian AI,
              and fully vaulted experiences into one luminous command center.
            </Text>
          </View>

          <Animated.View style={[styles.heroContainer, { transform: [{ translateY: floatAnim }] }]}>
            <AnimatedPulse style={styles.heroAura}>
              <View style={styles.heroGlyph}>
                <Ionicons name="planet" size={86} color={theme.colors.white} />
              </View>
            </AnimatedPulse>
            <Text style={styles.heroText}>Parenting, orchestrated by starlight.</Text>
          </Animated.View>

          <View style={styles.timelineContainer}>
            <View style={styles.timelineTrack}>
              <Animated.View style={[styles.timelinePulse, pulseStyle]} />
            </View>
            <View style={styles.timelineLegends}>
              <Text style={styles.timelineLegend}>Discover</Text>
              <Text style={styles.timelineLegend}>Connect</Text>
              <Text style={styles.timelineLegend}>Glow</Text>
            </View>
          </View>

          <View style={styles.ctaCluster}>
            <Button
              title="Get Started as Parent"
              onPress={() => navigation.navigate('Auth', { mode: 'parent' })}
              variant="primary"
              size="large"
            />
            <Button
              title="I'm a Babysitter"
              onPress={() => navigation.navigate('Auth', { mode: 'sitter' })}
              variant="secondary"
              size="large"
            />
            <Button
              title="Explore Pricing Constellations"
              onPress={() => navigation.navigate('Pricing')}
              variant="ghost"
              size="medium"
              style={styles.pricingButton}
            />

            <View style={styles.statsRow}>
              <GlassCard style={[styles.statCard, styles.statLeft]} intensity="bold">
                <Ionicons name="sparkles" size={20} color={theme.colors.white} />
                <Text style={styles.statValue}>+4.9</Text>
                <Text style={styles.statLabel}>stellar sitter reputation</Text>
              </GlassCard>
              <GlassCard style={styles.statCard} intensity="bold">
                <Ionicons name="shield-checkmark" size={20} color={theme.colors.white} />
                <Text style={styles.statValue}>100%</Text>
                <Text style={styles.statLabel}>quantum safety compliance</Text>
              </GlassCard>
            </View>
          </View>

          <View style={styles.featuresHeader}>
            <Text style={styles.featuresTitle}>Why families orbit Noorah</Text>
            <Text style={styles.featuresSubtitle}>
              Every layer - from sitter vetting to emergency response - is illuminated with guardian-grade design.
            </Text>
          </View>

          <View style={styles.featuresGrid}>
            {FEATURES.map((feature, index) => (
              <AnimatedCard key={feature.title} direction="up" delay={index * 120}>
                <GlassCard style={styles.featureCard}>
                  <View style={styles.featureIconWrap}>
                    <Ionicons name={feature.icon as any} size={26} color={theme.colors.accent} />
                  </View>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureCopy}>{feature.copy}</Text>
                </GlassCard>
              </AnimatedCard>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </NeonBackground>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing['2xl'],
    paddingBottom: theme.spacing['3xl'],
    gap: theme.spacing['2xl'],
  },
  header: {
    gap: theme.spacing.sm,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.sm,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  logo: {
    fontFamily: theme.typography.fontFamily.display,
    fontSize: theme.typography.fontSize['4xl'],
    fontWeight: theme.typography.fontWeight.black,
    color: theme.colors.white,
  },
  tagline: {
    fontSize: theme.typography.fontSize.lg,
    lineHeight: 26,
    color: 'rgba(226, 232, 240, 0.85)',
    maxWidth: width * 0.84,
  },
  heroContainer: {
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  heroAura: {
    borderRadius: width,
    padding: 32,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.32)',
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.glow,
  },
  heroGlyph: {
    width: 164,
    height: 164,
    borderRadius: 82,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  heroText: {
    fontSize: theme.typography.fontSize['2xl'],
    color: theme.colors.white,
    fontFamily: theme.typography.fontFamily.secondary,
    textAlign: 'center',
  },
  timelineContainer: {
    gap: theme.spacing.sm,
  },
  timelineTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.16)',
    overflow: 'hidden',
  },
  timelinePulse: {
    width: 70,
    height: '100%',
    backgroundColor: 'rgba(236, 72, 153, 0.7)',
    borderRadius: 999,
  },
  timelineLegends: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timelineLegend: {
    color: 'rgba(226, 232, 240, 0.65)',
    fontSize: theme.typography.fontSize.xs,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  ctaCluster: {
    gap: theme.spacing.md,
  },
  pricingButton: {
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  statLeft: {
    marginRight: 0,
  },
  statValue: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.white,
  },
  statLabel: {
    color: 'rgba(226, 232, 240, 0.72)',
    fontSize: theme.typography.fontSize.sm,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  featuresHeader: {
    gap: theme.spacing.sm,
  },
  featuresTitle: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.white,
  },
  featuresSubtitle: {
    fontSize: theme.typography.fontSize.base,
    color: 'rgba(226, 232, 240, 0.8)',
    lineHeight: 22,
  },
  featuresGrid: {
    gap: theme.spacing.lg,
  },
  featureCard: {
    gap: theme.spacing.sm,
  },
  featureIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(236, 72, 153, 0.18)',
    marginBottom: theme.spacing.sm,
  },
  featureTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.white,
  },
  featureCopy: {
    fontSize: theme.typography.fontSize.sm,
    color: 'rgba(226, 232, 240, 0.75)',
    lineHeight: 20,
  },
});

export default LandingScreen;

