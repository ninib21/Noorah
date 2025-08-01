import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeInDown,
  SlideInUp,
} from 'react-native-reanimated';
import FeedbackService, { UserSurvey, SurveyQuestion, SurveyResponse } from '../services/feedback.service';

const { width: screenWidth } = Dimensions.get('window');

interface UserSurveyProps {
  visible: boolean;
  onClose: () => void;
  surveyType: 'onboarding' | 'post-booking' | 'monthly' | 'feature';
  onComplete?: (responses: SurveyResponse[]) => void;
}

const UserSurvey: React.FC<UserSurveyProps> = ({
  visible,
  onClose,
  surveyType,
  onComplete,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [survey, setSurvey] = useState<UserSurvey | null>(null);

  const feedbackService = FeedbackService.getInstance();
  const modalOpacity = useSharedValue(0);
  const modalScale = useSharedValue(0.8);

  const modalStyle = useAnimatedStyle(() => ({
    opacity: modalOpacity.value,
    transform: [{ scale: modalScale.value }],
  }));

  useEffect(() => {
    if (visible) {
      modalOpacity.value = withTiming(1, { duration: 300 });
      modalScale.value = withSpring(1, { damping: 15, stiffness: 300 });
      initializeSurvey();
    } else {
      modalOpacity.value = withTiming(0, { duration: 300 });
      modalScale.value = withSpring(0.8, { damping: 15, stiffness: 300 });
    }
  }, [visible]);

  const initializeSurvey = async () => {
    const surveyQuestions = getSurveyQuestions(surveyType);
    const surveyData = {
      userId: 'current-user', // Replace with actual user ID
      surveyType,
      questions: surveyQuestions,
      responses: [],
      completed: false,
    };

    const surveyId = await feedbackService.createSurvey(surveyData);
    // Create survey object locally since getSurvey is private
    const createdSurvey: UserSurvey = {
      ...surveyData,
      id: surveyId,
      createdAt: Date.now(),
    };
    setSurvey(createdSurvey);
    setCurrentQuestionIndex(0);
    setResponses([]);
  };

  const getSurveyQuestions = (type: string): SurveyQuestion[] => {
    switch (type) {
      case 'onboarding':
        return [
          {
            id: 'onboarding_1',
            type: 'rating',
            question: 'How easy was it to set up your profile?',
            required: true,
            order: 1,
          },
          {
            id: 'onboarding_2',
            type: 'multiple-choice',
            question: 'What was the most challenging part of onboarding?',
            options: ['Profile setup', 'Verification process', 'Finding sitters', 'Payment setup', 'None'],
            required: true,
            order: 2,
          },
          {
            id: 'onboarding_3',
            type: 'text',
            question: 'What would make the onboarding process better?',
            required: false,
            order: 3,
          },
        ];

      case 'post-booking':
        return [
          {
            id: 'booking_1',
            type: 'rating',
            question: 'How satisfied were you with your recent booking?',
            required: true,
            order: 1,
          },
          {
            id: 'booking_2',
            type: 'multiple-choice',
            question: 'What was the best part of your experience?',
            options: ['Sitter quality', 'App ease of use', 'Communication', 'Safety features', 'Pricing'],
            required: true,
            order: 2,
          },
          {
            id: 'booking_3',
            type: 'yes-no',
            question: 'Would you recommend our service to friends and family?',
            required: true,
            order: 3,
          },
          {
            id: 'booking_4',
            type: 'text',
            question: 'Any additional comments about your experience?',
            required: false,
            order: 4,
          },
        ];

      case 'monthly':
        return [
          {
            id: 'monthly_1',
            type: 'rating',
            question: 'Overall, how satisfied are you with GuardianNest?',
            required: true,
            order: 1,
          },
          {
            id: 'monthly_2',
            type: 'multiple-choice',
            question: 'How often do you use the app?',
            options: ['Daily', 'Weekly', 'Monthly', 'Rarely', 'Never'],
            required: true,
            order: 2,
          },
          {
            id: 'monthly_3',
            type: 'multiple-choice',
            question: 'What features do you use most?',
            options: ['Booking sitters', 'Messaging', 'Safety tracking', 'Payment', 'Reviews'],
            required: true,
            order: 3,
          },
          {
            id: 'monthly_4',
            type: 'text',
            question: 'What improvements would you like to see?',
            required: false,
            order: 4,
          },
        ];

      case 'feature':
        return [
          {
            id: 'feature_1',
            type: 'rating',
            question: 'How useful is this new feature?',
            required: true,
            order: 1,
          },
          {
            id: 'feature_2',
            type: 'multiple-choice',
            question: 'How often do you use this feature?',
            options: ['Always', 'Often', 'Sometimes', 'Rarely', 'Never'],
            required: true,
            order: 2,
          },
          {
            id: 'feature_3',
            type: 'text',
            question: 'What would make this feature better?',
            required: false,
            order: 3,
          },
        ];

      default:
        return [];
    }
  };

  const handleClose = () => {
    modalOpacity.value = withTiming(0, { duration: 300 });
    modalScale.value = withSpring(0.8, { damping: 15, stiffness: 300 });
    setTimeout(() => {
      onClose();
      resetSurvey();
    }, 300);
  };

  const resetSurvey = () => {
    setCurrentQuestionIndex(0);
    setResponses([]);
    setSurvey(null);
    setIsSubmitting(false);
  };

  const handleAnswer = (answer: string | number | string[]) => {
    if (!survey) return;

    const currentQuestion = survey.questions[currentQuestionIndex];
    const newResponse: SurveyResponse = {
      questionId: currentQuestion.id,
      answer,
      timestamp: Date.now(),
    };

    // Update or add response
    const updatedResponses = responses.filter(r => r.questionId !== currentQuestion.id);
    updatedResponses.push(newResponse);
    setResponses(updatedResponses);
  };

  const handleNext = () => {
    if (!survey) return;

    const currentQuestion = survey.questions[currentQuestionIndex];
    const hasResponse = responses.some(r => r.questionId === currentQuestion.id);

    if (currentQuestion.required && !hasResponse) {
      Alert.alert('Required Question', 'Please answer this question before continuing.');
      return;
    }

    if (currentQuestionIndex < survey.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!survey) return;

    setIsSubmitting(true);

    try {
      await feedbackService.submitSurveyResponse(survey.id, responses);
      
      if (onComplete) {
        onComplete(responses);
      }

      // Show completion message
      Alert.alert(
        'Thank You!',
        'Your survey responses have been submitted successfully.',
        [{ text: 'OK', onPress: handleClose }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit survey. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestion = (question: SurveyQuestion) => {
    const currentResponse = responses.find(r => r.questionId === question.id);

    switch (question.type) {
      case 'rating':
        return (
          <Animated.View entering={FadeInDown.delay(100)} style={styles.ratingContainer}>
            <Text style={styles.questionText}>{question.question}</Text>
            <View style={styles.ratingGrid}>
              {[1, 2, 3, 4, 5].map((rating) => (
                <TouchableOpacity
                  key={rating}
                  style={[
                    styles.ratingButton,
                    currentResponse?.answer === rating && styles.ratingButtonActive,
                  ]}
                  onPress={() => handleAnswer(rating)}
                >
                  <Ionicons
                    name={(currentResponse?.answer as number) >= rating ? 'star' : 'star-outline'}
                    size={32}
                    color={(currentResponse?.answer as number) >= rating ? '#FFD700' : '#D1D5DB'}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.ratingLabels}>
              <Text style={styles.ratingLabel}>Poor</Text>
              <Text style={styles.ratingLabel}>Excellent</Text>
            </View>
          </Animated.View>
        );

      case 'multiple-choice':
        return (
          <Animated.View entering={FadeInDown.delay(100)} style={styles.choiceContainer}>
            <Text style={styles.questionText}>{question.question}</Text>
            <View style={styles.choiceGrid}>
              {question.options?.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.choiceButton,
                    currentResponse?.answer === option && styles.choiceButtonActive,
                  ]}
                  onPress={() => handleAnswer(option)}
                >
                  <Text style={[
                    styles.choiceText,
                    currentResponse?.answer === option && styles.choiceTextActive,
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        );

      case 'yes-no':
        return (
          <Animated.View entering={FadeInDown.delay(100)} style={styles.yesNoContainer}>
            <Text style={styles.questionText}>{question.question}</Text>
            <View style={styles.yesNoGrid}>
              {['Yes', 'No'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.yesNoButton,
                    currentResponse?.answer === option && styles.yesNoButtonActive,
                  ]}
                  onPress={() => handleAnswer(option)}
                >
                  <Text style={[
                    styles.yesNoText,
                    currentResponse?.answer === option && styles.yesNoTextActive,
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        );

      case 'text':
        return (
          <Animated.View entering={FadeInDown.delay(100)} style={styles.textContainer}>
            <Text style={styles.questionText}>{question.question}</Text>
            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.textInput}
                value={currentResponse?.answer as string || ''}
                onChangeText={(text) => handleAnswer(text)}
                placeholder="Type your answer here..."
                multiline
                numberOfLines={4}
                maxLength={500}
              />
            </View>
          </Animated.View>
        );

      default:
        return null;
    }
  };

  if (!survey) return null;

  const currentQuestion = survey.questions[currentQuestionIndex];
  const progress = (currentQuestionIndex + 1) / survey.questions.length;
  const isLastQuestion = currentQuestionIndex === survey.questions.length - 1;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <Animated.View style={[styles.overlay, modalStyle]}>
        <TouchableOpacity style={styles.backdrop} onPress={handleClose} />
        <Animated.View entering={SlideInUp} style={styles.modalContainer}>
          <LinearGradient
            colors={['#3A7DFF', '#FF7DB9']}
            style={styles.modalHeader}
          >
            <View style={styles.headerContent}>
              <Text style={styles.modalTitle}>Survey</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeIcon}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
              </View>
              <Text style={styles.progressText}>
                {currentQuestionIndex + 1} of {survey.questions.length}
              </Text>
            </View>
          </LinearGradient>

          <SafeAreaView style={styles.modalBody}>
            <ScrollView showsVerticalScrollIndicator={false} style={styles.questionContainer}>
              {renderQuestion(currentQuestion)}
            </ScrollView>

            <View style={styles.buttonContainer}>
              {currentQuestionIndex > 0 && (
                <TouchableOpacity style={styles.previousButton} onPress={handlePrevious}>
                  <Ionicons name="arrow-back" size={20} color="#374151" />
                  <Text style={styles.previousButtonText}>Previous</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={[
                  styles.nextButton,
                  isSubmitting && styles.nextButtonDisabled,
                ]}
                onPress={handleNext}
                disabled={isSubmitting}
              >
                <Text style={styles.nextButtonText}>
                  {isSubmitting ? 'Submitting...' : isLastQuestion ? 'Submit' : 'Next'}
                </Text>
                {!isLastQuestion && <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />}
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeIcon: {
    padding: 5,
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginTop: 15,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  modalBody: {
    flex: 1,
  },
  questionContainer: {
    flex: 1,
    padding: 20,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 24,
    lineHeight: 28,
  },
  ratingContainer: {
    alignItems: 'center',
  },
  ratingGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  ratingButton: {
    padding: 8,
    marginHorizontal: 4,
  },
  ratingButtonActive: {
    // Active state styling
  },
  ratingLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  ratingLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  choiceContainer: {
    // Container styling
  },
  choiceGrid: {
    gap: 12,
  },
  choiceButton: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  choiceButtonActive: {
    backgroundColor: '#3A7DFF',
    borderColor: '#3A7DFF',
  },
  choiceText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
  },
  choiceTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  yesNoContainer: {
    alignItems: 'center',
  },
  yesNoGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  yesNoButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    minWidth: 100,
  },
  yesNoButtonActive: {
    backgroundColor: '#3A7DFF',
    borderColor: '#3A7DFF',
  },
  yesNoText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    fontWeight: '500',
  },
  yesNoTextActive: {
    color: '#FFFFFF',
  },
  textContainer: {
    // Container styling
  },
  textInputContainer: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  textInput: {
    padding: 16,
    fontSize: 16,
    color: '#374151',
    textAlignVertical: 'top',
    minHeight: 120,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  previousButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  previousButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#3A7DFF',
    borderRadius: 8,
    minWidth: 100,
    justifyContent: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  nextButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    marginRight: 8,
  },
});

export default UserSurvey; 