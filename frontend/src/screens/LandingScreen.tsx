import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/ui/Button';
import { AnimatedGradientBackground, AnimatedCard, AnimatedPulse } from '../components/AnimatedComponents';
import { theme } from '../styles/theme';

const { width } = Dimensions.get('window');

interface LandingScreenProps {
  navigation: any;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({ navigation }) => {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10,
          duration: 2800,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 10,
          duration: 2800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [floatAnim]);

  const handleGetStarted = () => {
    navigation.navigate('Auth', { mode: 'parent' });
  };

  const handleSitterSignup = () => {
    navigation.navigate('Auth', { mode: 'sitter' });
  };

  return (
    <AnimatedGradientBackground colors={theme.colors.gradientNebula}>
      <SafeAreaView style={styles.container}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

        <View style={styles.backgroundOrbs}>
          <View style={[styles.blob, styles.blobPrimary]} />
          <View style={[styles.blob, styles.blobSecondary]} />
          <View style={[styles.blob, styles.blobTertiary]} />
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.badge}>Quantum Edition</Text>
            <Text style={styles.logo}>Noorah</Text>
            <Text style={styles.tagline}>
              Match with elite sitters, monitor sessions in real-time, and pay securely — all in one luminous experience.
            </Text>
          </View>

          <Animated.View style={{ transform: [{ translateY: floatAnim }] }}>
            <AnimatedPulse style={styles.heroAura}>
              <View style={styles.heroImage}>
                <Ionicons name="planet" size={86} color={theme.colors.white} />
              </View>
            </AnimatedPulse>
          </Animated.View>
          <Text style={styles.heroText}>Care that glows with you.</Text>

          <View style={styles.ctaSection}>
            <Button
              title="Get Started as Parent"
              onPress={handleGetStarted}
              variant="primary"
              size="large"
              style={styles.primaryButton}
              accessibilityLabel="Get started as a parent"
              accessibilityHint="Navigate to the parent onboarding flow"
            />

            <Button
              title="I'm a Babysitter"
              onPress={handleSitterSignup}
              variant="secondary"
              size="large"
              style={styles.secondaryButton}
              accessibilityLabel="Get started as a babysitter"
              accessibilityHint="Navigate to the sitter onboarding flow"
            />

            <Button
              title="Explore Pricing Constellations"
              onPress={() => navigation.navigate('Pricing')}
              variant="ghost"
              size="medium"
              style={styles.ghostButton}
              accessibilityLabel="View Noorah pricing tiers"
              accessibilityHint="Opens detailed comparison of pricing tiers"
            />

            <View style={styles.statsRow}>
              <View style={[styles.statCard, styles.statCardLeft]}>
                <Ionicons name="sparkles" size={18} color={theme.colors.white} />
                <Text style={styles.statValue}>+4.9</Text>
                <Text style={styles.statLabel}>average sitter rating</Text>
              </View>
              <View style={[styles.statCard, styles.statCardRight]}>
                <Ionicons name="shield-checkmark" size={18} color={theme.colors.white} />
                <Text style={styles.statValue}>100%</Text>
                <Text style={styles.statLabel}>background verified</Text>
              </View>
            </View>
          </View>

          <View style={styles.featuresGrid}>
            <AnimatedCard direction="up" delay={150} style={styles.featureCard}>
              <Ionicons name="pulse" size={28} color={theme.colors.accent} />
              <Text style={styles.featureTitle}>Live session telemetry</Text>
              <Text style={styles.featureCopy}>Heartbeats, location, and alerts streamed directly to your command center.</Text>
            </AnimatedCard>
            <AnimatedCard direction="up" delay={250} style={styles.featureCard}>
              <Ionicons name="chatbubbles" size={28} color={theme.colors.accent} />
              <Text style={styles.featureTitle}>Immersive chat</Text>
              <Text style={styles.featureCopy}>Voice notes, rich media, and SOS automations keep you instantly connected.</Text>
            </AnimatedCard>
            <AnimatedCard direction="up" delay={350} style={styles.featureCard}>
              <Ionicons name="card" size={28} color={theme.colors.accent} />
              <Text style={styles.featureTitle}>Holographic payments</Text>
              <Text style={styles.featureCopy}>Schedule, split, and tip with quantum-secure Stripe infrastructure.</Text>
            </AnimatedCard>
          </View>
        </View>
      </SafeAreaView>
    </AnimatedGradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundOrbs: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
    borderRadius: width,
    opacity: 0.45,
  },
  blobPrimary: {
    width: width * 1.2,
    height: width * 1.2,
    top: -width * 0.4,
    left: -width * 0.3,
    backgroundColor: 'rgba(124, 58, 237, 0.4)',
  },
  blobSecondary: {
    width: width,
    height: width,
    bottom: -width * 0.4,
    right: -width * 0.2,
    backgroundColor: 'rgba(14, 165, 233, 0.35)',
  },
  blobTertiary: {
    width: width * 0.7,
    height: width * 0.7,
    top: width * 0.2,
    right: -width * 0.25,
    backgroundColor: 'rgba(236, 72, 153, 0.3)',
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing['2xl'],
    paddingBottom: theme.spacing['2xl'],
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'flex-start',
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.sm,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  logo: {
    fontFamily: theme.typography.fontFamily.display,
    fontSize: theme.typography.fontSize['4xl'],
    fontWeight: theme.typography.fontWeight.black,
    color: theme.colors.white,
    marginTop: theme.spacing.sm,
  },
  tagline: {
    fontSize: theme.typography.fontSize.lg,
    color: 'rgba(226, 232, 240, 0.85)',
    maxWidth: width * 0.8,
    lineHeight: 26,
    marginTop: theme.spacing.md,
  },
  heroAura: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderRadius: width,
    padding: 30,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    ...theme.shadows.glow,
  },
  heroImage: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: {
    marginTop: theme.spacing.lg,
    fontSize: theme.typography.fontSize['2xl'],
    color: theme.colors.white,
    fontFamily: theme.typography.fontFamily.secondary,
    textAlign: 'center',
  },
  ctaSection: {
    marginTop: theme.spacing['2xl'],
  },
  primaryButton: {
    marginBottom: theme.spacing.md,
  },
  secondaryButton: {
    marginTop: 12,
  },
  ghostButton: {
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: theme.spacing.lg,
  },
  statCard: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: 14,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.25)',
    width: (width - theme.spacing.lg * 2 - 12) / 2,
  },
  statCardLeft: {
    marginRight: 12,
  },
  statCardRight: {
    marginRight: 0,
  },
  statValue: {
    marginTop: 8,
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.white,
  },
  statLabel: {
    marginTop: 4,
    color: 'rgba(226, 232, 240, 0.75)',
    fontSize: theme.typography.fontSize.sm,
    lineHeight: 18,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  featuresGrid: {
    marginTop: theme.spacing['2xl'],
  },
  featureCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    marginBottom: 16,
  },
  featureTitle: {
    marginTop: 12,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.white,
  },
  featureCopy: {
    marginTop: 8,
    fontSize: theme.typography.fontSize.sm,
    color: 'rgba(226, 232, 240, 0.75)',
    lineHeight: 20,
  },
});

export default LandingScreen;

