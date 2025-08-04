import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const SplashScreen: React.FC = () => {
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate to next screen after 3 seconds
    const timer = setTimeout(() => {
      navigation.replace('Onboarding' as never);
    }, 3000);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, slideAnim, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3A7DFF" />
      <LinearGradient
        colors={['#3A7DFF', '#FF7DB9']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
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
          {/* App Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="shield-checkmark" size={80} color="#FFFFFF" />
          </View>

          {/* App Name */}
          <Text style={styles.appName}>NannyRadar</Text>
          
          {/* Tagline */}
          <Text style={styles.tagline}>Find Trusted Babysitters</Text>

          {/* Loading Indicator */}
          <View style={styles.loadingContainer}>
            <View style={styles.loadingDot} />
            <View style={styles.loadingDot} />
            <View style={styles.loadingDot} />
          </View>
        </Animated.View>

        {/* Bottom Text */}
        <Animated.View
          style={[
            styles.bottomText,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.versionText}>Version 1.0.0</Text>
          <Text style={styles.copyrightText}>© 2024 NannyRadar</Text>
        </Animated.View>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 48,
    textAlign: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 4,
    opacity: 0.7,
  },
  bottomText: {
    position: 'absolute',
    bottom: 60,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
});

export default SplashScreen; 