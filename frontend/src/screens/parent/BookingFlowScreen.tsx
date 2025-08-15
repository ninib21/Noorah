import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp, SlideInRight } from 'react-native-reanimated';
import { AnimatedButton, AnimatedCard, AnimatedProgressBar, AnimatedGradientBackground } from '../../components/AnimatedComponents';
import FeedbackService from '../../services/feedback.service';

const BookingFlowScreen: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedSitter, setSelectedSitter] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const feedbackService = FeedbackService.getInstance();
  
  const steps = [
    { id: 'sitter', title: 'Choose Sitter', description: 'Select your preferred babysitter' },
    { id: 'schedule', title: 'Schedule', description: 'Pick date and time' },
    { id: 'details', title: 'Details', description: 'Add special instructions' },
    { id: 'payment', title: 'Payment', description: 'Complete booking' },
  ];

  const sitters = [
    { id: '1', name: 'Sarah Johnson', rating: 4.8, rate: 25, specialties: ['Infants', 'Toddlers'] },
    { id: '2', name: 'Michael Chen', rating: 4.9, rate: 30, specialties: ['School Age', 'Homework'] },
    { id: '3', name: 'Emma Rodriguez', rating: 4.7, rate: 22, specialties: ['Infants', 'Meal Prep'] },
  ];

  useEffect(() => {
    feedbackService.trackScreen('BookingFlowScreen');
  }, []);

  const handleSitterSelect = (sitter: any) => {
    setSelectedSitter(sitter);
    feedbackService.trackAction('sitter_selected', 'BookingFlowScreen', { sitterId: sitter.id });
    setTimeout(() => setCurrentStep(1), 500);
  };

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleCompleteBooking();
    }
  };

  const handleCompleteBooking = async () => {
    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      feedbackService.trackAction('booking_completed', 'BookingFlowScreen', { sitterId: selectedSitter?.id });
      Alert.alert('Success', 'Booking completed successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to complete booking');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderStepIndicator = () => (
    <Animated.View entering={FadeInDown.delay(100)} style={styles.stepIndicator}>
      <Text style={styles.stepTitle}>Booking Progress</Text>
      <AnimatedProgressBar
        progress={(currentStep + 1) / steps.length}
        height={8}
        progressColor="#3A7DFF"
      />
      <View style={styles.stepList}>
        {steps.map((step, index) => (
          <Animated.View key={step.id} entering={SlideInRight.delay(index * 100)} style={styles.stepItem}>
            <View style={[styles.stepIcon, index <= currentStep && styles.stepIconActive]}>
              {index < currentStep ? (
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              ) : (
                <Text style={styles.stepNumber}>{index + 1}</Text>
              )}
            </View>
            <View style={styles.stepInfo}>
              <Text style={styles.stepName}>{step.title}</Text>
              <Text style={styles.stepDescription}>{step.description}</Text>
            </View>
          </Animated.View>
        ))}
      </View>
    </Animated.View>
  );

  const renderSitterSelection = () => (
    <Animated.View entering={FadeInUp.delay(200)} style={styles.section}>
      <Text style={styles.sectionTitle}>Choose Your Sitter</Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        {sitters.map((sitter, index) => (
          <AnimatedCard key={sitter.id} direction="up" delay={index * 100} style={styles.sitterCard}>
            <TouchableOpacity onPress={() => handleSitterSelect(sitter)} style={styles.sitterContent}>
              <View style={styles.sitterInfo}>
                <View style={styles.sitterAvatar}>
                  <Ionicons name="person" size={32} color="#3A7DFF" />
                </View>
                <View style={styles.sitterDetails}>
                  <Text style={styles.sitterName}>{sitter.name}</Text>
                  <View style={styles.sitterRating}>
                    <Ionicons name="star" size={16} color="#FFD700" />
                    <Text style={styles.ratingText}>{sitter.rating}</Text>
                  </View>
                  <View style={styles.specialties}>
                    {sitter.specialties.map((spec: string, idx: number) => (
                      <View key={idx} style={styles.specialtyTag}>
                        <Text style={styles.specialtyText}>{spec}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                <View style={styles.sitterRate}>
                  <Text style={styles.rateAmount}>${sitter.rate}</Text>
                  <Text style={styles.rateUnit}>/hour</Text>
                </View>
              </View>
              <AnimatedButton title="Select" onPress={() => handleSitterSelect(sitter)} variant="primary" size="small" />
            </TouchableOpacity>
          </AnimatedCard>
        ))}
      </ScrollView>
    </Animated.View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderSitterSelection();
      default:
        return (
          <Animated.View entering={FadeInUp.delay(200)} style={styles.section}>
            <Text style={styles.sectionTitle}>{steps[currentStep].title}</Text>
            <Text style={styles.sectionDescription}>{steps[currentStep].description}</Text>
            <AnimatedButton
              title={isProcessing ? "Processing..." : "Continue"}
              onPress={handleNextStep}
              variant="primary"
              size="large"
              loading={isProcessing}
            />
          </Animated.View>
        );
    }
  };

  return (
    <AnimatedGradientBackground>
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
            <Text style={styles.headerTitle}>Book a Sitter</Text>
            <Text style={styles.headerSubtitle}>{steps[currentStep]?.description}</Text>
          </Animated.View>

          {renderStepIndicator()}
          {renderCurrentStep()}
          
          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </AnimatedGradientBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, alignItems: 'center' },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 8 },
  headerSubtitle: { fontSize: 16, color: '#FFFFFF', opacity: 0.8 },
  stepIndicator: { padding: 20 },
  stepTitle: { fontSize: 18, fontWeight: '600', color: '#FFFFFF', marginBottom: 16 },
  stepList: { marginTop: 20 },
  stepItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  stepIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  stepIconActive: { backgroundColor: '#3A7DFF' },
  stepNumber: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  stepInfo: { flex: 1 },
  stepName: { fontSize: 16, fontWeight: '500', color: '#FFFFFF', marginBottom: 2 },
  stepDescription: { fontSize: 12, color: '#FFFFFF', opacity: 0.7 },
  section: { padding: 20 },
  sectionTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 8 },
  sectionDescription: { fontSize: 16, color: '#FFFFFF', opacity: 0.8, marginBottom: 24 },
  sitterCard: { marginBottom: 16 },
  sitterContent: { padding: 16 },
  sitterInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  sitterAvatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  sitterDetails: { flex: 1 },
  sitterName: { fontSize: 18, fontWeight: '600', color: '#1F2937', marginBottom: 4 },
  sitterRating: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  ratingText: { fontSize: 14, fontWeight: '500', color: '#374151', marginLeft: 4 },
  specialties: { flexDirection: 'row', flexWrap: 'wrap' },
  specialtyTag: { backgroundColor: '#E0F2FE', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginRight: 8, marginBottom: 4 },
  specialtyText: { fontSize: 12, color: '#0369A1', fontWeight: '500' },
  sitterRate: { alignItems: 'flex-end' },
  rateAmount: { fontSize: 20, fontWeight: 'bold', color: '#3A7DFF' },
  rateUnit: { fontSize: 12, color: '#6B7280' },
});

export default BookingFlowScreen; 