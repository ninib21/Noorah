import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AnimatedGradientBackground } from '../components/AnimatedComponents';
import { theme } from '../styles/theme';

const { width } = Dimensions.get('window');

interface OnboardingSlide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  colors: readonly [string, string];
}

const onboardingData: OnboardingSlide[] = [
  {
    id: 1,
    title: 'Find Trusted Sitters',
    subtitle: 'Safe & Reliable',
    description:
      'Connect with verified babysitters nearby. Every sitter is quantum-screened and reviewed by real families.',
    icon: 'shield-checkmark',
    colors: ['rgba(124, 58, 237, 0.6)', 'rgba(14, 165, 233, 0.6)'],
  },
  {
    id: 2,
    title: 'Real-Time Monitoring',
    subtitle: 'Peace of Mind',
    description:
      'Live telemetry, smart alerts, and instant messaging keep you in the loop from orbit to bedtime.',
    icon: 'eye',
    colors: ['rgba(14, 165, 233, 0.6)', 'rgba(236, 72, 153, 0.6)'],
  },
  {
    id: 3,
    title: 'Secure Payments',
    subtitle: 'Easy & Safe',
    description:
      'Schedule, split, and tip with quantum-secure Stripe payments. Receipts and budgeting built-in.',
    icon: 'card',
    colors: ['rgba(236, 72, 153, 0.6)', 'rgba(245, 158, 11, 0.6)'],
  },
];

const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleNext = () => {
    if (currentSlide < onboardingData.length - 1) {
      const nextSlide = currentSlide + 1;
      setCurrentSlide(nextSlide);
      scrollViewRef.current?.scrollTo({
        x: nextSlide * width,
        animated: true,
      });
    } else {
      navigation.navigate('Signup' as never);
    }
  };

  const handleSkip = () => {
    navigation.navigate('Login' as never);
  };

  const handleScroll = (event: any) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentSlide(slideIndex);
  };

  const renderSlide = (slide: OnboardingSlide) => (
    <View key={slide.id} style={[styles.slide, { width }]}> 
      <View style={styles.slideContent}>
        <LinearGradient colors={slide.colors} style={styles.iconContainer}>
          <Ionicons name={slide.icon as any} size={56} color={theme.colors.white} />
        </LinearGradient>

        <Text style={styles.slideTitle}>{slide.title}</Text>
        <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>
        <Text style={styles.slideDescription}>{slide.description}</Text>
      </View>
    </View>
  );

  return (
    <AnimatedGradientBackground colors={theme.colors.gradientAurora}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.scrollView}
        >
          {onboardingData.map(renderSlide)}
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.pagination}>
            {onboardingData.map((_, index) => (
              <View
                key={`dot-${index}`}
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      index === currentSlide
                        ? theme.colors.white
                        : 'rgba(226, 232, 240, 0.35)',
                  },
                ]}
              />
            ))}
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>
                {currentSlide === onboardingData.length - 1 ? 'Get Started' : 'Next'}
              </Text>
              <Ionicons
                name={currentSlide === onboardingData.length - 1 ? 'rocket' : 'arrow-forward'}
                size={20}
                color={theme.colors.primaryDark}
                style={styles.nextButtonIcon}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => navigation.navigate('Login' as never)}
            >
              <Text style={styles.loginButtonText}>Already have an account?</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </AnimatedGradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    color: 'rgba(226, 232, 240, 0.85)',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  slideContent: {
    alignItems: 'center',
    maxWidth: 320,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 36,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    ...theme.shadows.sm,
  },
  slideTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: theme.colors.white,
    textAlign: 'center',
  },
  slideSubtitle: {
    fontSize: 20,
    color: 'rgba(226, 232, 240, 0.8)',
    marginTop: 12,
    marginBottom: 16,
    textAlign: 'center',
  },
  slideDescription: {
    fontSize: 16,
    color: 'rgba(226, 232, 240, 0.75)',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 6,
  },
  actionButtons: {
    alignItems: 'center',
  },
  nextButton: {
    backgroundColor: theme.colors.white,
    paddingVertical: 16,
    paddingHorizontal: 62,
    borderRadius: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  nextButtonText: {
    color: theme.colors.primaryDark,
    fontSize: 16,
    fontWeight: '700',
  },
  nextButtonIcon: {
    marginLeft: 12,
  },
  loginButton: {
    paddingVertical: 10,
  },
  loginButtonText: {
    color: 'rgba(226, 232, 240, 0.85)',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default OnboardingScreen;

