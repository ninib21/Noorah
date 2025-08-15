import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AnimatedButton,
  AnimatedCard,
  AnimatedProgressBar,
  AnimatedSpinner,
  AnimatedFAB,
  AnimatedTabBar,
  AnimatedNotificationBadge,
  AnimatedSwipeableCard,
  AnimatedPulse,
  AnimatedShake,
  AnimatedCounter,
  AnimatedGradientBackground,
} from '../components/AnimatedComponents';
import { Ionicons } from '@expo/vector-icons';

const AnimatedExampleScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [progress, setProgress] = useState(0.3);
  const [counter, setCounter] = useState(0);
  const [shakeTrigger, setShakeTrigger] = useState(false);
  const [loading, setLoading] = useState(false);

  const tabs = [
    { key: 'home', title: 'Home', icon: 'home' as const },
    { key: 'book', title: 'Book', icon: 'calendar' as const },
    { key: 'messages', title: 'Messages', icon: 'chatbubbles' as const },
    { key: 'profile', title: 'Profile', icon: 'person' as const },
  ];

  const handleButtonPress = (variant: string) => {
    Alert.alert('Button Pressed', `${variant} button was pressed!`);
  };

  const handleLoadingPress = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 3000);
  };

  const handleSwipeLeft = () => {
    Alert.alert('Swipe Left', 'Card swiped left!');
  };

  const handleSwipeRight = () => {
    Alert.alert('Swipe Right', 'Card swiped right!');
  };

  const handleShake = () => {
    setShakeTrigger(true);
    setTimeout(() => setShakeTrigger(false), 500);
  };

  return (
    <AnimatedGradientBackground>
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Animated Components</Text>
            <Text style={styles.headerSubtitle}>React Native Reanimated Examples</Text>
          </View>

          {/* Animated Buttons Section */}
          <AnimatedCard direction="up" delay={100}>
            <Text style={styles.sectionTitle}>Animated Buttons</Text>
            <View style={styles.buttonGrid}>
              <AnimatedButton
                title="Primary"
                onPress={() => handleButtonPress('Primary')}
                variant="primary"
                icon="checkmark"
              />
              <AnimatedButton
                title="Secondary"
                onPress={() => handleButtonPress('Secondary')}
                variant="secondary"
                icon="settings"
              />
              <AnimatedButton
                title="Danger"
                onPress={() => handleButtonPress('Danger')}
                variant="danger"
                icon="warning"
              />
              <AnimatedButton
                title="Success"
                onPress={() => handleButtonPress('Success')}
                variant="success"
                icon="checkmark-circle"
              />
              <AnimatedButton
                title="Loading"
                onPress={handleLoadingPress}
                loading={loading}
                variant="primary"
              />
              <AnimatedButton
                title="Disabled"
                onPress={() => {}}
                disabled={true}
                variant="primary"
              />
            </View>
          </AnimatedCard>

          {/* Progress Bar Section */}
          <AnimatedCard direction="up" delay={200}>
            <Text style={styles.sectionTitle}>Progress Bar</Text>
            <AnimatedProgressBar progress={progress} />
            <View style={styles.progressControls}>
              <AnimatedButton
                title="25%"
                onPress={() => setProgress(0.25)}
                variant="secondary"
                size="small"
              />
              <AnimatedButton
                title="50%"
                onPress={() => setProgress(0.5)}
                variant="secondary"
                size="small"
              />
              <AnimatedButton
                title="75%"
                onPress={() => setProgress(0.75)}
                variant="secondary"
                size="small"
              />
              <AnimatedButton
                title="100%"
                onPress={() => setProgress(1)}
                variant="secondary"
                size="small"
              />
            </View>
          </AnimatedCard>

          {/* Counter Section */}
          <AnimatedCard direction="up" delay={300}>
            <Text style={styles.sectionTitle}>Animated Counter</Text>
            <View style={styles.counterContainer}>
              <AnimatedCounter
                value={counter}
                style={styles.counterText}
              />
              <View style={styles.counterButtons}>
                <AnimatedButton
                  title="-"
                  onPress={() => setCounter(Math.max(0, counter - 1))}
                  variant="secondary"
                  size="small"
                />
                <AnimatedButton
                  title="+"
                  onPress={() => setCounter(counter + 1)}
                  variant="primary"
                  size="small"
                />
              </View>
            </View>
          </AnimatedCard>

          {/* Swipeable Card Section */}
          <AnimatedCard direction="up" delay={400}>
            <Text style={styles.sectionTitle}>Swipeable Card</Text>
            <Text style={styles.sectionDescription}>
              Swipe left or right to trigger actions
            </Text>
            <AnimatedSwipeableCard
              onSwipeLeft={handleSwipeLeft}
              onSwipeRight={handleSwipeRight}
            >
              <View style={styles.swipeableContent}>
                <Ionicons name="heart" size={24} color="#FF7DB9" />
                <Text style={styles.swipeableText}>
                  Swipe me left or right!
                </Text>
                <Ionicons name="arrow-forward" size={24} color="#3A7DFF" />
              </View>
            </AnimatedSwipeableCard>
          </AnimatedCard>

          {/* Pulse and Shake Effects */}
          <AnimatedCard direction="up" delay={500}>
            <Text style={styles.sectionTitle}>Special Effects</Text>
            <View style={styles.effectsContainer}>
              <AnimatedPulse>
                <View style={styles.pulseBox}>
                  <Text style={styles.effectText}>Pulse Effect</Text>
                </View>
              </AnimatedPulse>
              <AnimatedShake trigger={shakeTrigger}>
                <View style={styles.shakeBox}>
                  <Text style={styles.effectText}>Shake Effect</Text>
                </View>
              </AnimatedShake>
              <AnimatedButton
                title="Trigger Shake"
                onPress={handleShake}
                variant="secondary"
                size="small"
              />
            </View>
          </AnimatedCard>

          {/* Notification Badge Example */}
          <AnimatedCard direction="up" delay={600}>
            <Text style={styles.sectionTitle}>Notification Badge</Text>
            <View style={styles.badgeContainer}>
              <View style={styles.badgeItem}>
                <Ionicons name="notifications" size={24} color="#3A7DFF" />
                <AnimatedNotificationBadge count={5} />
              </View>
              <View style={styles.badgeItem}>
                <Ionicons name="mail" size={24} color="#3A7DFF" />
                <AnimatedNotificationBadge count={12} />
              </View>
              <View style={styles.badgeItem}>
                <Ionicons name="heart" size={24} color="#3A7DFF" />
                <AnimatedNotificationBadge count={0} />
              </View>
            </View>
          </AnimatedCard>

          {/* Loading Spinner */}
          <AnimatedCard direction="up" delay={700}>
            <Text style={styles.sectionTitle}>Loading Spinner</Text>
            <View style={styles.spinnerContainer}>
              <AnimatedSpinner size={32} color="#3A7DFF" />
              <Text style={styles.spinnerText}>Loading...</Text>
            </View>
          </AnimatedCard>

          {/* Spacer for FAB */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Floating Action Button */}
        <AnimatedFAB
          icon="add"
          onPress={() => Alert.alert('FAB', 'Floating Action Button pressed!')}
          color="#FF7DB9"
        />

        {/* Animated Tab Bar */}
        <AnimatedTabBar
          tabs={tabs}
          activeTab={activeTab}
          onTabPress={setActiveTab}
        />
      </SafeAreaView>
    </AnimatedGradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  progressControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  counterContainer: {
    alignItems: 'center',
  },
  counterText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#3A7DFF',
    marginBottom: 16,
  },
  counterButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  swipeableContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  swipeableText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  effectsContainer: {
    alignItems: 'center',
    gap: 16,
  },
  pulseBox: {
    backgroundColor: '#3A7DFF',
    padding: 16,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  shakeBox: {
    backgroundColor: '#FF7DB9',
    padding: 16,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  effectText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  badgeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  badgeItem: {
    position: 'relative',
    padding: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  spinnerContainer: {
    alignItems: 'center',
    gap: 16,
  },
  spinnerText: {
    fontSize: 16,
    color: '#6B7280',
  },
});

export default AnimatedExampleScreen; 