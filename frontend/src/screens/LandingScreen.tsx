import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../components/ui/Button';
import { theme } from '../styles/theme';

const { width, height } = Dimensions.get('window');

interface LandingScreenProps {
  navigation: any;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({ navigation }) => {
  const handleGetStarted = () => {
    navigation.navigate('Auth', { mode: 'parent' });
  };

  const handleSitterSignup = () => {
    navigation.navigate('Auth', { mode: 'sitter' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={theme.colors.gradientMixed}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          {/* Header Section */}
          <View style={styles.header}>
            <Text style={styles.logo}>🍼 NannyRadar</Text>
            <Text style={styles.tagline}>
              Find trusted babysitters in your neighborhood
            </Text>
          </View>

          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.heroImage}>
              <Text style={styles.heroIcon}>👶</Text>
            </View>
            <Text style={styles.heroText}>
              Safe, reliable childcare at your fingertips
            </Text>
          </View>

          {/* CTA Section */}
          <View style={styles.ctaSection}>
            <Button
              title="Get Started as Parent"
              onPress={handleGetStarted}
              variant="primary"
              size="large"
              style={styles.primaryButton}
            />
            
            <Button
              title="I'm a Babysitter"
              onPress={handleSitterSignup}
              variant="outline"
              size="large"
              style={styles.secondaryButton}
            />

            {/* App Store Badges */}
            <View style={styles.appStores}>
              <Text style={styles.appStoreText}>
                📱 Available on App Store & Google Play
              </Text>
            </View>
          </View>

          {/* Features Preview */}
          <View style={styles.features}>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>🔍</Text>
              <Text style={styles.featureText}>Find Sitters</Text>
            </View>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>✅</Text>
              <Text style={styles.featureText}>Background Checked</Text>
            </View>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>💬</Text>
              <Text style={styles.featureText}>Real-time Chat</Text>
            </View>
          </View>
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
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    justifyContent: 'space-between',
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  logo: {
    fontSize: theme.typography.fontSize['4xl'],
    fontWeight: theme.typography.fontWeight.extrabold,
    color: theme.colors.white,
    fontFamily: theme.typography.fontFamily.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  tagline: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.white,
    textAlign: 'center',
    opacity: 0.9,
    fontFamily: theme.typography.fontFamily.primary,
  },
  heroSection: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  heroImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  heroIcon: {
    fontSize: 80,
  },
  heroText: {
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.white,
    textAlign: 'center',
    fontFamily: theme.typography.fontFamily.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  ctaSection: {
    marginBottom: theme.spacing.xl,
  },
  primaryButton: {
    backgroundColor: theme.colors.white,
    marginBottom: theme.spacing.md,
  },
  secondaryButton: {
    borderColor: theme.colors.white,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: theme.spacing.lg,
  },
  appStores: {
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  appStoreText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.sm,
    opacity: 0.8,
    fontFamily: theme.typography.fontFamily.primary,
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: theme.spacing.md,
  },
  feature: {
    alignItems: 'center',
    flex: 1,
  },
  featureIcon: {
    fontSize: theme.typography.fontSize['2xl'],
    marginBottom: theme.spacing.xs,
  },
  featureText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.sm,
    textAlign: 'center',
    fontFamily: theme.typography.fontFamily.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
});
