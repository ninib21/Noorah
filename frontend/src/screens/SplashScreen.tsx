import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { AnimatedGradientBackground, AnimatedPulse } from '../components/AnimatedComponents';
import type { RootStackParamList } from '../navigation/types';
import { theme } from '../styles/theme';

const { width } = Dimensions.get('window');

const SplashScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'Splash'>>();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const slideAnim = useRef(new Animated.Value(60)).current;
  const orbitAnim = useRef(new Animated.Value(0)).current;
  const spinnerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: theme.animations.duration.ultra,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        damping: 12,
        stiffness: 120,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: theme.animations.duration.slow,
        useNativeDriver: true,
      }),
    ]).start();

    const orbitLoop = Animated.loop(
      Animated.timing(orbitAnim, {
        toValue: 1,
        duration: 9000,
        useNativeDriver: true,
      })
    );
    orbitLoop.start();

    const spinnerLoop = Animated.loop(
      Animated.timing(spinnerAnim, {
        toValue: 1,
        duration: 2200,
        useNativeDriver: true,
      })
    );
    spinnerLoop.start();

    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 3200);

    return () => {
      orbitLoop.stop();
      spinnerLoop.stop();
      clearTimeout(timer);
    };
  }, [fadeAnim, scaleAnim, slideAnim, orbitAnim, spinnerAnim, navigation]);

  const orbitRotation = orbitAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const spinnerRotation = spinnerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <AnimatedGradientBackground colors={theme.colors.gradientAurora}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

        <View style={styles.decorLayer}>
          <Animated.View
            style={[
              styles.orbLarge,
              { transform: [{ rotate: orbitRotation }] },
            ]}
          />
          <Animated.View
            style={[
              styles.orbSmall,
              {
                transform: [
                  { rotate: orbitRotation },
                  { translateX: width * 0.1 },
                ],
              },
            ]}
          />
          <View style={styles.halo} />
        </View>

        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { translateY: slideAnim },
              ],
            },
          ]}
        >
          <AnimatedPulse style={styles.logoContainer}>
            <Ionicons name="planet" size={72} color={theme.colors.white} />
          </AnimatedPulse>
          <Text style={styles.appName}>Noorah Quantum</Text>
          <Text style={styles.tagline}>Trusted care powered by cosmic-grade agents</Text>

          <View style={styles.metricsRow}>
            <View style={styles.metricChip}>
              <Ionicons name="sparkles" size={18} color={theme.colors.white} />
              <Text style={styles.metricText}>6 AI sitters on standby</Text>
            </View>
            <View style={[styles.metricChip, styles.metricChipAlt]}>
              <Ionicons name="shield-checkmark" size={18} color={theme.colors.white} />
              <Text style={styles.metricText}>Quantum-secure sessions</Text>
            </View>
          </View>

          <View style={styles.loadingRing}>
            <Animated.View
              style={[
                styles.loadingOrbit,
                { transform: [{ rotate: spinnerRotation }] },
              ]}
            />
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.bottomPanel,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 60],
                    outputRange: [0, 40],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.versionText}>Version 1.0.0 · Aurora build</Text>
          <TouchableOpacity
            style={styles.quickTestButton}
            onPress={() => navigation.navigate('QuickTest')}
          >
            <Ionicons name="flash" size={18} color={theme.colors.primaryDark} />
            <Text style={styles.quickTestText}>Launch Quantum Diagnostics</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </AnimatedGradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  decorLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbLarge: {
    position: 'absolute',
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: width,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.18)',
  },
  orbSmall: {
    position: 'absolute',
    width: width * 0.55,
    height: width * 0.55,
    borderRadius: width,
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.25)',
  },
  halo: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width,
    backgroundColor: 'rgba(124, 58, 237, 0.18)',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  logoContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.glow,
  },
  appName: {
    fontFamily: theme.typography.fontFamily.display,
    fontSize: theme.typography.fontSize.display,
    fontWeight: theme.typography.fontWeight.black,
    color: theme.colors.white,
    textAlign: 'center',
    letterSpacing: 1.5,
  },
  tagline: {
    marginTop: theme.spacing.sm,
    fontSize: theme.typography.fontSize.lg,
    color: 'rgba(226, 232, 240, 0.82)',
    textAlign: 'center',
  },
  metricsRow: {
    flexDirection: 'row',
    marginTop: theme.spacing.lg,
  },
  metricChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.full,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.25)',
    marginRight: 12,
  },
  metricChipAlt: {
    backgroundColor: 'rgba(14, 165, 233, 0.35)',
    borderColor: 'rgba(14, 165, 233, 0.45)',
    marginRight: 0,
  },
  metricText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    marginLeft: 6,
    letterSpacing: 0.6,
  },
  loadingRing: {
    marginTop: theme.spacing['2xl'],
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingOrbit: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 3,
    borderColor: 'rgba(14, 165, 233, 0.35)',
    borderTopColor: theme.colors.white,
  },
  bottomPanel: {
    position: 'absolute',
    bottom: theme.spacing['2xl'],
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  versionText: {
    color: 'rgba(226, 232, 240, 0.7)',
    marginBottom: theme.spacing.sm,
    fontSize: theme.typography.fontSize.sm,
    letterSpacing: 0.5,
  },
  quickTestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.white,
  },
  quickTestText: {
    color: theme.colors.primaryDark,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    marginLeft: 8,
    letterSpacing: 0.4,
  },
});

export default SplashScreen;

