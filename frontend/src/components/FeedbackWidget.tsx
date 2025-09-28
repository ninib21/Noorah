import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
  FadeInDown,
  SlideInUp,
} from 'react-native-reanimated';
import FeedbackService, { FeedbackData } from '../services/feedback.service';

const { width: screenWidth } = Dimensions.get('window');

interface FeedbackWidgetProps {
  visible: boolean;
  onClose: () => void;
  initialScreen?: string;
  initialAction?: string;
}

const FeedbackWidget: React.FC<FeedbackWidgetProps> = ({
  visible,
  onClose,
  initialScreen = '',
  initialAction = '',
}) => {
  const [step, setStep] = useState<'type' | 'details' | 'screenshot' | 'success'>('type');
  const [feedbackType, setFeedbackType] = useState<'bug' | 'feature' | 'ux' | 'general'>('general');
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const feedbackService = FeedbackService.getInstance();
  const modalOpacity = useSharedValue(0);
  const modalScale = useSharedValue(0.8);

  const modalStyle = useAnimatedStyle(() => ({
    opacity: modalOpacity.value,
    transform: [{ scale: modalScale.value }],
  }));

  React.useEffect(() => {
    if (visible) {
      modalOpacity.value = withTiming(1, { duration: 300 });
      modalScale.value = withSpring(1, { damping: 15, stiffness: 300 });
    } else {
      modalOpacity.value = withTiming(0, { duration: 300 });
      modalScale.value = withSpring(0.8, { damping: 15, stiffness: 300 });
    }
  }, [visible]);

  const handleClose = () => {
    modalOpacity.value = withTiming(0, { duration: 300 });
    modalScale.value = withSpring(0.8, { damping: 15, stiffness: 300 });
    setTimeout(() => {
      onClose();
      resetForm();
    }, 300);
  };

  const resetForm = () => {
    setStep('type');
    setFeedbackType('general');
    setCategory('');
    setTitle('');
    setDescription('');
    setSeverity('medium');
    setScreenshots([]);
    setIsSubmitting(false);
  };

  const handleTypeSelect = (type: 'bug' | 'feature' | 'ux' | 'general') => {
    setFeedbackType(type);
    setStep('details');
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      const feedback: Omit<FeedbackData, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: 'current-user', // Replace with actual user ID
        type: feedbackType,
        category,
        title: title.trim(),
        description: description.trim(),
        severity,
        status: 'pending',
        priority: severity === 'critical' ? 'urgent' : severity === 'high' ? 'high' : 'medium',
        tags: [feedbackType, category].filter(Boolean),
        screenshots,
        deviceInfo: {
          platform: 'react-native',
          version: '1.0.0',
          model: 'Unknown',
          osVersion: 'Unknown',
        },
        userInfo: {
          userType: 'parent', // Replace with actual user type
          subscriptionTier: 'free',
          appVersion: '1.0.0',
        },
        metadata: {
          screen: initialScreen,
          action: initialAction,
          timestamp: Date.now(),
          sessionId: 'current-session',
          userFlow: [],
        },
      };

      await feedbackService.submitFeedback(feedback);
      setStep('success');
    } catch (error) {
      Alert.alert('Error', 'Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const takeScreenshot = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Camera roll permission is required to add screenshots.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setScreenshots([...screenshots, result.assets[0].uri]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add screenshot. Please try again.');
    }
  };

  const removeScreenshot = (index: number) => {
    setScreenshots(screenshots.filter((_, i) => i !== index));
  };

  const renderTypeSelection = () => (
    <Animated.View entering={FadeInDown.delay(100)} style={styles.stepContainer}>
      <Text style={styles.stepTitle}>What type of feedback do you have?</Text>
      <Text style={styles.stepDescription}>Help us understand your feedback better</Text>
      
      <View style={styles.typeGrid}>
        {[
          { type: 'bug', icon: 'bug', title: 'Bug Report', description: 'Something isn\'t working' },
          { type: 'feature', icon: 'add-circle', title: 'Feature Request', description: 'I want to suggest something' },
          { type: 'ux', icon: 'color-palette', title: 'UX Feedback', description: 'Improve the experience' },
          { type: 'general', icon: 'chatbubble', title: 'General', description: 'Other feedback' },
        ].map((item) => (
          <TouchableOpacity
            key={item.type}
            style={styles.typeCard}
            onPress={() => handleTypeSelect(item.type as any)}
            activeOpacity={0.7}
          >
            <Ionicons name={item.icon as any} size={32} color="#3A7DFF" />
            <Text style={styles.typeTitle}>{item.title}</Text>
            <Text style={styles.typeDescription}>{item.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );

  const renderDetailsForm = () => (
    <Animated.View entering={FadeInDown.delay(100)} style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Tell us more</Text>
      <Text style={styles.stepDescription}>Provide details to help us address your feedback</Text>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Category Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Category</Text>
          <View style={styles.categoryGrid}>
            {getCategoriesForType(feedbackType).map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  category === cat && styles.categoryChipActive,
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[
                  styles.categoryChipText,
                  category === cat && styles.categoryChipTextActive,
                ]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Title Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Title *</Text>
          <TextInput
            style={styles.textInput}
            value={title}
            onChangeText={setTitle}
            placeholder="Brief description of your feedback"
            maxLength={100}
          />
        </View>

        {/* Description Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Description *</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Provide detailed information about your feedback..."
            multiline
            numberOfLines={4}
            maxLength={1000}
          />
        </View>

        {/* Severity Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Severity</Text>
          <View style={styles.severityGrid}>
            {[
              { level: 'low', label: 'Low', color: '#10B981' },
              { level: 'medium', label: 'Medium', color: '#F59E0B' },
              { level: 'high', label: 'High', color: '#EF4444' },
              { level: 'critical', label: 'Critical', color: '#DC2626' },
            ].map((item) => (
              <TouchableOpacity
                key={item.level}
                style={[
                  styles.severityChip,
                  severity === item.level && { backgroundColor: item.color },
                ]}
                onPress={() => setSeverity(item.level as any)}
              >
                <Text style={[
                  styles.severityChipText,
                  severity === item.level && styles.severityChipTextActive,
                ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Screenshots */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Screenshots (Optional)</Text>
          <TouchableOpacity style={styles.screenshotButton} onPress={takeScreenshot}>
            <Ionicons name="camera" size={24} color="#3A7DFF" />
            <Text style={styles.screenshotButtonText}>Add Screenshot</Text>
          </TouchableOpacity>
          
          {screenshots.length > 0 && (
            <View style={styles.screenshotGrid}>
              {screenshots.map((uri, index) => (
                <View key={index} style={styles.screenshotItem}>
                  <Text style={styles.screenshotName}>Screenshot {index + 1}</Text>
                  <TouchableOpacity
                    style={styles.removeScreenshot}
                    onPress={() => removeScreenshot(index)}
                  >
                    <Ionicons name="close-circle" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.buttonGroup}>
        <TouchableOpacity style={styles.backButton} onPress={() => setStep('type')}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderSuccess = () => (
    <Animated.View entering={FadeInDown.delay(100)} style={styles.stepContainer}>
      <View style={styles.successContainer}>
        <Ionicons name="checkmark-circle" size={64} color="#10B981" />
        <Text style={styles.successTitle}>Thank You!</Text>
        <Text style={styles.successDescription}>
          Your feedback has been submitted successfully. We'll review it and get back to you soon.
        </Text>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const getCategoriesForType = (type: string): string[] => {
    switch (type) {
      case 'bug':
        return ['App Crash', 'UI Issue', 'Performance', 'Payment', 'Booking', 'Other'];
      case 'feature':
        return ['New Feature', 'Enhancement', 'Integration', 'Other'];
      case 'ux':
        return ['Navigation', 'Design', 'Usability', 'Accessibility', 'Other'];
      case 'general':
        return ['Praise', 'Suggestion', 'Question', 'Other'];
      default:
        return ['Other'];
    }
  };

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
              <Text style={styles.modalTitle}>Feedback</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeIcon}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <SafeAreaView style={styles.modalBody}>
            {step === 'type' && renderTypeSelection()}
            {step === 'details' && renderDetailsForm()}
            {step === 'success' && renderSuccess()}
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
  modalBody: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
    padding: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  typeCard: {
    width: (screenWidth - 60) / 2,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  typeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 8,
    marginBottom: 4,
  },
  typeDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryChipActive: {
    backgroundColor: '#3A7DFF',
    borderColor: '#3A7DFF',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#374151',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  severityGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  severityChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  severityChipText: {
    fontSize: 14,
    color: '#374151',
  },
  severityChipTextActive: {
    color: '#FFFFFF',
  },
  screenshotButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 2,
    borderColor: '#3A7DFF',
    borderStyle: 'dashed',
    borderRadius: 8,
    backgroundColor: '#F0F9FF',
  },
  screenshotButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#3A7DFF',
    fontWeight: '500',
  },
  screenshotGrid: {
    marginTop: 12,
  },
  screenshotItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
    marginBottom: 4,
  },
  screenshotName: {
    fontSize: 14,
    color: '#374151',
  },
  removeScreenshot: {
    padding: 4,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  backButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  submitButton: {
    flex: 2,
    padding: 12,
    backgroundColor: '#3A7DFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  successDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  closeButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: '#3A7DFF',
    borderRadius: 8,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default FeedbackWidget; 
