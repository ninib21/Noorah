import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  Dimensions,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { paymentService, SitterEarnings, PayoutHistory, StripeConnectStatus } from '../../services/payment.service';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Tabs from '../../components/Tabs';

const { width } = Dimensions.get('window');

interface Payment {
  id: string;
  date: string;
  amount: number;
  hours: number;
  parentName: string;
  status: 'completed' | 'pending' | 'processing';
  bookingId: string;
}

const SitterEarningsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [connectStatus, setConnectStatus] = useState<StripeConnectStatus | null>(null);
  const [earnings, setEarnings] = useState<SitterEarnings | null>(null);
  const [payoutHistory, setPayoutHistory] = useState<PayoutHistory[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [availableBalance, setAvailableBalance] = useState(1250.75);

  // Mock data for payments (in real app, this would come from API)
  const payments: Payment[] = [
    {
      id: '1',
      date: '2024-01-15',
      amount: 125.00,
      hours: 5,
      parentName: 'Jennifer M.',
      status: 'completed',
      bookingId: 'BK001',
    },
    {
      id: '2',
      date: '2024-01-14',
      amount: 75.00,
      hours: 3,
      parentName: 'Michael R.',
      status: 'completed',
      bookingId: 'BK002',
    },
    {
      id: '3',
      date: '2024-01-13',
      amount: 100.00,
      hours: 4,
      parentName: 'Lisa T.',
      status: 'pending',
      bookingId: 'BK003',
    },
  ];

  useEffect(() => {
    loadData();
  }, [selectedPeriod]);

  const loadData = async () => {
    try {
      setLoading(true);
      // In a real app, these would be actual API calls
      // const [statusData, earningsData, payoutsData] = await Promise.all([
      //   paymentService.getSitterConnectStatus(),
      //   paymentService.getSitterEarnings(selectedPeriod),
      //   paymentService.getSitterPayouts(),
      // ]);
      
      // Mock data for now
      const mockEarnings: SitterEarnings = {
        period: selectedPeriod,
        totalEarnings: 8750.50,
        platformFees: 875.05,
        netEarnings: 7875.45,
        paymentCount: 127,
        averagePerBooking: 69.0,
      };

      const mockPayoutHistory: PayoutHistory[] = [
        {
          id: '1',
          amount: 500.00,
          currency: 'usd',
          status: 'paid',
          arrivalDate: new Date('2024-01-10'),
          created: new Date('2024-01-08'),
        },
        {
          id: '2',
          amount: 750.00,
          currency: 'usd',
          status: 'pending',
          arrivalDate: new Date('2024-01-15'),
          created: new Date('2024-01-13'),
        },
      ];

             const mockConnectStatus: StripeConnectStatus = {
         hasAccount: true,
         accountId: 'acct_1234567890',
         status: 'active',
         payoutsEnabled: true,
         requirements: undefined,
         onboardingUrl: undefined,
       };
      
      setConnectStatus(mockConnectStatus);
      setEarnings(mockEarnings);
      setPayoutHistory(mockPayoutHistory);
    } catch (error) {
      Alert.alert('Error', 'Failed to load earnings data');
      console.error('Error loading earnings data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (earnings && amount > earnings.netEarnings) {
      Alert.alert('Error', 'Withdrawal amount exceeds available balance');
      return;
    }

    try {
      // In real app: await paymentService.requestSitterPayout(amount);
      Alert.alert('Success', 'Payout requested successfully');
      setWithdrawAmount('');
      loadData(); // Refresh data
    } catch (error) {
      Alert.alert('Error', 'Failed to request payout');
      console.error('Error requesting payout:', error);
    }
  };

  const handleConnectStripe = async () => {
    try {
      // In real app: const result = await paymentService.createSitterConnectAccount();
      Alert.alert('Success', 'Stripe Connect account created. Please complete onboarding.');
    } catch (error) {
      Alert.alert('Error', 'Failed to create Stripe Connect account');
      console.error('Error creating Stripe Connect account:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'paid':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      case 'processing':
        return '#3A7DFF';
      default:
        return '#64748B';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
      case 'paid':
        return 'Completed';
      case 'pending':
        return 'Pending';
      case 'processing':
        return 'Processing';
      default:
        return 'Unknown';
    }
  };

  const renderPaymentItem = ({ item }: { item: Payment }) => (
    <View style={styles.paymentCard}>
      <View style={styles.paymentHeader}>
        <View style={styles.paymentInfo}>
          <Text style={styles.paymentDate}>{item.date}</Text>
          <Text style={styles.parentName}>{item.parentName}</Text>
          <Text style={styles.bookingId}>Booking #{item.bookingId}</Text>
        </View>
        <View style={styles.paymentAmount}>
          <Text style={styles.amountText}>${item.amount.toFixed(2)}</Text>
          <Text style={styles.hoursText}>{item.hours}h</Text>
        </View>
      </View>
      <View style={styles.paymentFooter}>
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          />
          <Text
            style={[
              styles.statusText,
              { color: getStatusColor(item.status) },
            ]}
          >
            {getStatusText(item.status)}
          </Text>
        </View>
        <TouchableOpacity style={styles.detailsButton}>
          <Text style={styles.detailsButtonText}>Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3A7DFF" />
          <Text style={styles.loadingText}>Loading earnings...</Text>
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
          <Text style={styles.headerTitle}>My Earnings</Text>
          <TouchableOpacity style={styles.analyticsButton}>
            <Ionicons name="analytics" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Stripe Connect Status */}
          {!connectStatus?.hasAccount && (
            <Card variant="outlined" style={styles.connectCard}>
              <View style={styles.connectContent}>
                <Ionicons name="card-outline" size={24} color="#FF7DB9" />
                <View style={styles.connectText}>
                  <Text style={styles.connectTitle}>Set up payments</Text>
                  <Text style={styles.connectSubtitle}>
                    Connect your bank account to receive payments
                  </Text>
                </View>
                <Button
                  title="Connect"
                  variant="primary"
                  size="small"
                  onPress={handleConnectStripe}
                />
              </View>
            </Card>
          )}

          {connectStatus?.hasAccount && !connectStatus?.payoutsEnabled && (
            <Card variant="outlined" style={styles.connectCard}>
              <View style={styles.connectContent}>
                <Ionicons name="warning-outline" size={24} color="#FF9500" />
                <View style={styles.connectText}>
                  <Text style={styles.connectTitle}>Complete verification</Text>
                  <Text style={styles.connectSubtitle}>
                    Complete your Stripe verification to receive payouts
                  </Text>
                </View>
                <Button
                  title="Complete"
                  variant="primary"
                  size="small"
                  onPress={() => {
                    Alert.alert('Info', 'Redirecting to Stripe verification...');
                  }}
                />
              </View>
            </Card>
          )}

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <Tabs
              tabs={[
                { key: 'overview', title: 'Overview' },
                { key: 'payouts', title: 'Payouts' },
                { key: 'history', title: 'History' },
              ]}
              activeTab={activeTab}
              onTabPress={setActiveTab}
            />
          </View>

          {activeTab === 'overview' && earnings && (
            <View style={styles.overviewTab}>
              {/* Available Balance */}
              <View style={styles.balanceCard}>
                <Text style={styles.balanceLabel}>Available Balance</Text>
                <Text style={styles.balanceAmount}>{formatCurrency(earnings.netEarnings)}</Text>
                {connectStatus?.payoutsEnabled && (
                  <TouchableOpacity
                    style={[
                      styles.withdrawButton,
                      earnings.netEarnings < 50 && styles.withdrawButtonDisabled,
                    ]}
                    onPress={() => setActiveTab('payouts')}
                    disabled={earnings.netEarnings < 50}
                  >
                    <Text style={styles.withdrawButtonText}>Withdraw Funds</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Period Selector */}
              <View style={styles.periodSelector}>
                <Text style={styles.sectionTitle}>Earnings Overview</Text>
                <View style={styles.periodTabs}>
                  {[
                    { key: 'week', label: 'Week' },
                    { key: 'month', label: 'Month' },
                    { key: 'year', label: 'Year' },
                  ].map(period => (
                    <TouchableOpacity
                      key={period.key}
                      style={[
                        styles.periodTab,
                        selectedPeriod === period.key && styles.periodTabActive,
                      ]}
                      onPress={() => setSelectedPeriod(period.key)}
                    >
                      <Text
                        style={[
                          styles.periodTabText,
                          selectedPeriod === period.key && styles.periodTabTextActive,
                        ]}
                      >
                        {period.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Earnings Stats */}
              <View style={styles.overviewCard}>
                <View style={styles.statsGrid}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{formatCurrency(earnings.totalEarnings)}</Text>
                    <Text style={styles.statLabel}>Total Earnings</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{formatCurrency(earnings.netEarnings)}</Text>
                    <Text style={styles.statLabel}>Net Earnings</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{earnings.paymentCount}</Text>
                    <Text style={styles.statLabel}>Bookings</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{formatCurrency(earnings.averagePerBooking)}</Text>
                    <Text style={styles.statLabel}>Avg. per Booking</Text>
                  </View>
                </View>
              </View>

              {/* Platform Fees */}
              <Card variant="outlined" style={styles.feesCard}>
                <Text style={styles.feesTitle}>Platform Fees</Text>
                <Text style={styles.feesAmount}>{formatCurrency(earnings.platformFees)}</Text>
                <Text style={styles.feesSubtitle}>
                  {((earnings.platformFees / earnings.totalEarnings) * 100).toFixed(1)}% of total earnings
                </Text>
              </Card>

              {/* Recent Payments */}
              <View style={styles.paymentsSection}>
                <View style={styles.paymentsHeader}>
                  <Text style={styles.sectionTitle}>Recent Payments</Text>
                  <TouchableOpacity onPress={() => setActiveTab('history')}>
                    <Text style={styles.viewAllText}>View All</Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={payments}
                  renderItem={renderPaymentItem}
                  keyExtractor={item => item.id}
                  scrollEnabled={false}
                  showsVerticalScrollIndicator={false}
                />
              </View>
            </View>
          )}

          {activeTab === 'payouts' && (
            <View style={styles.payoutsTab}>
              {/* Withdrawal Section */}
              {connectStatus?.payoutsEnabled && earnings && (
                <Card variant="elevated" style={styles.withdrawalCard}>
                  <Text style={styles.withdrawalTitle}>Available for Withdrawal</Text>
                  <Text style={styles.withdrawalAmount}>{formatCurrency(earnings.netEarnings)}</Text>
                  
                  <View style={styles.withdrawalInput}>
                    <Text style={styles.withdrawalLabel}>Amount to withdraw:</Text>
                    <View style={styles.amountInput}>
                      <Text style={styles.currencySymbol}>$</Text>
                      <TextInput
                        style={styles.amountInputField}
                        value={withdrawAmount}
                        onChangeText={setWithdrawAmount}
                        placeholder="0.00"
                        keyboardType="numeric"
                        placeholderTextColor="#999"
                      />
                    </View>
                  </View>

                  <Button
                    title="Request Payout"
                    variant="primary"
                    onPress={handleWithdraw}
                    disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0}
                    style={styles.withdrawButton}
                  />
                </Card>
              )}

              {/* Payout History */}
              <Card variant="outlined" style={styles.payoutsCard}>
                <Text style={styles.payoutsTitle}>Payout History</Text>
                {payoutHistory.length === 0 ? (
                  <Text style={styles.noPayoutsText}>No payouts yet</Text>
                ) : (
                  payoutHistory.map((payout) => (
                    <View key={payout.id} style={styles.payoutItem}>
                      <View style={styles.payoutInfo}>
                        <Text style={styles.payoutAmount}>{formatCurrency(payout.amount)}</Text>
                        <Text style={styles.payoutDate}>{formatDate(payout.created)}</Text>
                      </View>
                      <View style={[styles.payoutStatus, { backgroundColor: getStatusColor(payout.status) }]}>
                        <Text style={styles.payoutStatusText}>{payout.status}</Text>
                      </View>
                    </View>
                  ))
                )}
              </Card>
            </View>
          )}

          {activeTab === 'history' && (
            <View style={styles.historyTab}>
              <Card variant="outlined" style={styles.historyCard}>
                <Text style={styles.historyTitle}>Payment History</Text>
                <FlatList
                  data={payments}
                  renderItem={renderPaymentItem}
                  keyExtractor={item => item.id}
                  scrollEnabled={false}
                  showsVerticalScrollIndicator={false}
                />
              </Card>
            </View>
          )}

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="card" size={24} color="#3A7DFF" />
                <Text style={styles.actionButtonText}>Payment Methods</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="document-text" size={24} color="#3A7DFF" />
                <Text style={styles.actionButtonText}>Tax Documents</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="settings" size={24} color="#3A7DFF" />
                <Text style={styles.actionButtonText}>Earnings Settings</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  analyticsButton: {
    padding: 8,
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
  connectCard: {
    margin: 20,
    marginBottom: 10,
  },
  connectContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  connectText: {
    flex: 1,
    marginLeft: 12,
  },
  connectTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  connectSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  tabsContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  overviewTab: {
    paddingHorizontal: 20,
  },
  payoutsTab: {
    paddingHorizontal: 20,
  },
  historyTab: {
    paddingHorizontal: 20,
  },
  balanceCard: {
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#3A7DFF',
    marginBottom: 20,
  },
  withdrawButton: {
    backgroundColor: '#3A7DFF',
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  withdrawButtonDisabled: {
    backgroundColor: '#E2E8F0',
  },
  withdrawButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  periodSelector: {
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  periodTabs: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
  },
  periodTab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  periodTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  periodTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  periodTabTextActive: {
    color: '#3A7DFF',
  },
  overviewCard: {
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  feesCard: {
    marginBottom: 20,
    padding: 20,
  },
  feesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  feesAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF7DB9',
    marginBottom: 4,
  },
  feesSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  withdrawalCard: {
    marginBottom: 20,
    padding: 20,
  },
  withdrawalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  withdrawalAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3A7DFF',
    marginBottom: 20,
  },
  withdrawalInput: {
    marginBottom: 20,
  },
  withdrawalLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 8,
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginRight: 8,
  },
  amountInputField: {
    flex: 1,
    fontSize: 18,
    color: '#1E293B',
  },
  payoutsCard: {
    marginBottom: 20,
    padding: 20,
  },
  payoutsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  noPayoutsText: {
    textAlign: 'center',
    color: '#64748B',
    fontSize: 16,
    fontStyle: 'italic',
  },
  payoutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  payoutInfo: {
    flex: 1,
  },
  payoutAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  payoutDate: {
    fontSize: 14,
    color: '#64748B',
  },
  payoutStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  payoutStatusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  historyCard: {
    marginBottom: 20,
    padding: 20,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  paymentsSection: {
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: '#3A7DFF',
    fontWeight: '500',
  },
  paymentCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  parentName: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 2,
  },
  bookingId: {
    fontSize: 12,
    color: '#94A3B8',
  },
  paymentAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3A7DFF',
    marginBottom: 2,
  },
  hoursText: {
    fontSize: 12,
    color: '#64748B',
  },
  paymentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  detailsButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailsButtonText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  quickActions: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default SitterEarningsScreen; 