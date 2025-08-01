import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { paymentService, PaymentIntent } from '../../services/payment.service';
import Button from '../../components/Button';
import Card from '../../components/Card';

interface PaymentScreenProps {
  route: {
    params: {
      bookingId: string;
      amount: number;
      sitterName: string;
      date: string;
      duration: number;
    };
  };
}

const PaymentScreen: React.FC<PaymentScreenProps> = ({ route }) => {
  const navigation = useNavigation();
  const { bookingId, amount, sitterName, date, duration } = route.params;
  
  const [loading, setLoading] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    createPaymentIntent();
  }, []);

  const createPaymentIntent = async () => {
    try {
      setLoading(true);
      // In real app: const intent = await paymentService.createPaymentIntent(bookingId);
      
      // Mock payment intent for demo
      const mockIntent: PaymentIntent = {
        paymentIntentId: 'pi_mock_123456789',
        clientSecret: 'pi_mock_123456789_secret_abcdef',
        amount: amount,
        platformFee: amount * 0.10, // 10% platform fee
        sitterPayout: amount * 0.90, // 90% to sitter
      };
      
      setPaymentIntent(mockIntent);
    } catch (error) {
      Alert.alert('Error', 'Failed to create payment intent');
      console.error('Error creating payment intent:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const validateForm = () => {
    if (!cardNumber.replace(/\s/g, '').match(/^\d{16}$/)) {
      Alert.alert('Error', 'Please enter a valid 16-digit card number');
      return false;
    }
    if (!expiryDate.match(/^\d{2}\/\d{2}$/)) {
      Alert.alert('Error', 'Please enter a valid expiry date (MM/YY)');
      return false;
    }
    if (!cvv.match(/^\d{3,4}$/)) {
      Alert.alert('Error', 'Please enter a valid CVV');
      return false;
    }
    if (!cardholderName.trim()) {
      Alert.alert('Error', 'Please enter the cardholder name');
      return false;
    }
    return true;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;

    try {
      setProcessingPayment(true);
      
      // In real app: await paymentService.processPayment(paymentIntent!.paymentIntentId);
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Payment Successful!',
        'Your payment has been processed successfully. The sitter will receive their payment after the session is completed.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('ParentHome' as never),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Payment Failed', 'There was an error processing your payment. Please try again.');
      console.error('Payment error:', error);
    } finally {
      setProcessingPayment(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3A7DFF" />
          <Text style={styles.loadingText}>Preparing payment...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#3A7DFF', '#FF7DB9']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payment</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Booking Summary */}
          <Card variant="elevated" style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Booking Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Sitter:</Text>
              <Text style={styles.summaryValue}>{sitterName}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Date:</Text>
              <Text style={styles.summaryValue}>{date}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Duration:</Text>
              <Text style={styles.summaryValue}>{duration} hours</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Rate:</Text>
              <Text style={styles.summaryValue}>{formatCurrency(amount / duration)}/hour</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Amount:</Text>
              <Text style={styles.totalAmount}>{formatCurrency(amount)}</Text>
            </View>
          </Card>

          {/* Payment Breakdown */}
          {paymentIntent && (
            <Card variant="outlined" style={styles.breakdownCard}>
              <Text style={styles.breakdownTitle}>Payment Breakdown</Text>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Sitter Payment:</Text>
                <Text style={styles.breakdownValue}>{formatCurrency(paymentIntent.sitterPayout)}</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Platform Fee:</Text>
                <Text style={styles.breakdownValue}>{formatCurrency(paymentIntent.platformFee)}</Text>
              </View>
              <View style={[styles.breakdownRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalAmount}>{formatCurrency(paymentIntent.amount)}</Text>
              </View>
            </Card>
          )}

          {/* Payment Form */}
          <Card variant="elevated" style={styles.paymentCard}>
            <Text style={styles.paymentTitle}>Payment Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Card Number</Text>
              <TextInput
                style={styles.input}
                value={cardNumber}
                onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                placeholder="1234 5678 9012 3456"
                keyboardType="numeric"
                maxLength={19}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.inputLabel}>Expiry Date</Text>
                <TextInput
                  style={styles.input}
                  value={expiryDate}
                  onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
                  placeholder="MM/YY"
                  keyboardType="numeric"
                  maxLength={5}
                  placeholderTextColor="#999"
                />
              </View>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.inputLabel}>CVV</Text>
                <TextInput
                  style={styles.input}
                  value={cvv}
                  onChangeText={setCvv}
                  placeholder="123"
                  keyboardType="numeric"
                  maxLength={4}
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Cardholder Name</Text>
              <TextInput
                style={styles.input}
                value={cardholderName}
                onChangeText={setCardholderName}
                placeholder="John Doe"
                placeholderTextColor="#999"
              />
            </View>
          </Card>

          {/* Security Notice */}
          <Card variant="outlined" style={styles.securityCard}>
            <View style={styles.securityContent}>
              <Ionicons name="shield-checkmark" size={24} color="#10B981" />
              <View style={styles.securityText}>
                <Text style={styles.securityTitle}>Secure Payment</Text>
                <Text style={styles.securitySubtitle}>
                  Your payment information is encrypted and secure. We use Stripe for payment processing.
                </Text>
              </View>
            </View>
          </Card>

          {/* Payment Button */}
          <View style={styles.paymentButtonContainer}>
            <Button
              title={processingPayment ? 'Processing Payment...' : `Pay ${formatCurrency(amount)}`}
              variant="primary"
              size="large"
              onPress={handlePayment}
              disabled={processingPayment}
              loading={processingPayment}
              style={styles.paymentButton}
            />
          </View>

          {/* Terms */}
          <Text style={styles.termsText}>
            By proceeding with this payment, you agree to our Terms of Service and Privacy Policy.
          </Text>
        </ScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
  },
  summaryCard: {
    margin: 20,
    marginBottom: 10,
    padding: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3A7DFF',
  },
  breakdownCard: {
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 20,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  breakdownLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
  },
  paymentCard: {
    margin: 20,
    marginBottom: 10,
    padding: 20,
  },
  paymentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1E293B',
    backgroundColor: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  securityCard: {
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 16,
  },
  securityContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  securityText: {
    flex: 1,
    marginLeft: 12,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  securitySubtitle: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  paymentButtonContainer: {
    margin: 20,
    marginBottom: 10,
  },
  paymentButton: {
    width: '100%',
  },
  termsText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    lineHeight: 18,
  },
});

export default PaymentScreen; 