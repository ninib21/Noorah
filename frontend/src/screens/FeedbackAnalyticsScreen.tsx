import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  FadeInUp,
  SlideInRight,
} from 'react-native-reanimated';
import FeedbackService, {
  FeedbackData,
  ChurnAnalysis,
  SessionData,
} from '../services/feedback.service';
import { AnimatedCard, AnimatedProgressBar, AnimatedGradientBackground } from '../components/AnimatedComponents';

const { width: screenWidth } = Dimensions.get('window');

interface AnalyticsData {
  totalFeedback: number;
  feedbackByType: { [key: string]: number };
  feedbackBySeverity: { [key: string]: number };
  averageRating: number;
  churnRate: number;
  activeUsers: number;
  totalSessions: number;
  dropoffPoints: { [key: string]: number };
  topIssues: Array<{ category: string; count: number }>;
}

const FeedbackAnalyticsScreen: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [churnAnalysis, setChurnAnalysis] = useState<ChurnAnalysis[]>([]);
  const [userFlow, setUserFlow] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d'>('30d');

  const feedbackService = FeedbackService.getInstance();

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedTimeframe]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Load all data in parallel
      const [feedback, churn, flow] = await Promise.all([
        loadFeedbackData(),
        feedbackService.analyzeChurn(),
        feedbackService.analyzeUserFlow(),
      ]);

      const analytics = processAnalyticsData(feedback, churn, flow);
      setAnalyticsData(analytics);
      setChurnAnalysis(churn);
      setUserFlow(flow);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFeedbackData = async (): Promise<FeedbackData[]> => {
    // Mock data - replace with actual API call
    return [
      {
        id: '1',
        userId: 'user1',
        type: 'bug',
        category: 'App Crash',
        title: 'App crashes on startup',
        description: 'App crashes immediately after launch',
        severity: 'high',
        status: 'pending',
        priority: 'high',
        tags: ['bug', 'App Crash'],
        deviceInfo: { platform: 'iOS', version: '1.0.0', model: 'iPhone', osVersion: '15.0' },
        userInfo: { userType: 'parent', subscriptionTier: 'free', appVersion: '1.0.0' },
        metadata: { screen: 'Home', action: 'app_launch', timestamp: Date.now(), sessionId: 'session1', userFlow: [] },
        createdAt: Date.now() - 86400000, // 1 day ago
        updatedAt: Date.now() - 86400000,
      },
      // Add more mock feedback data...
    ];
  };

  const processAnalyticsData = (
    feedback: FeedbackData[],
    churn: ChurnAnalysis[],
    flow: any
  ): AnalyticsData => {
    const feedbackByType = feedback.reduce((acc, f) => {
      acc[f.type] = (acc[f.type] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const feedbackBySeverity = feedback.reduce((acc, f) => {
      acc[f.severity] = (acc[f.severity] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const highRiskUsers = churn.filter(c => c.churnRisk === 'high').length;
    const churnRate = churn.length > 0 ? (highRiskUsers / churn.length) * 100 : 0;

    const topIssues = Object.entries(feedbackByType)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalFeedback: feedback.length,
      feedbackByType,
      feedbackBySeverity,
      averageRating: 4.2, // Mock data
      churnRate,
      activeUsers: churn.filter(c => c.churnRisk === 'low').length,
      totalSessions: Object.keys(flow).length,
      dropoffPoints: extractDropoffPoints(churn),
      topIssues,
    };
  };

  const extractDropoffPoints = (churn: ChurnAnalysis[]): { [key: string]: number } => {
    return churn.reduce((acc, user) => {
      acc[user.dropoffPoint] = (acc[user.dropoffPoint] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnalyticsData();
    setRefreshing(false);
  };

  const renderMetricCard = (title: string, value: string | number, icon: string, color: string, delay: number = 0) => (
    <Animated.View entering={FadeInDown.delay(delay)} style={styles.metricCard}>
      <View style={styles.metricHeader}>
        <View style={[styles.metricIcon, { backgroundColor: color }]}>
          <Ionicons name={icon as any} size={24} color="#FFFFFF" />
        </View>
        <Text style={styles.metricTitle}>{title}</Text>
      </View>
      <Text style={styles.metricValue}>{value}</Text>
    </Animated.View>
  );

  const renderFeedbackChart = () => (
    <AnimatedCard direction="up" delay={200}>
      <Text style={styles.sectionTitle}>Feedback by Type</Text>
      <View style={styles.chartContainer}>
        {analyticsData && Object.entries(analyticsData.feedbackByType).map(([type, count], index) => (
          <View key={type} style={styles.chartBar}>
            <View style={styles.chartBarHeader}>
              <Text style={styles.chartBarLabel}>{type}</Text>
              <Text style={styles.chartBarValue}>{count}</Text>
            </View>
            <AnimatedProgressBar
              progress={count / analyticsData.totalFeedback}
              height={8}
              progressColor={getTypeColor(type)}
            />
          </View>
        ))}
      </View>
    </AnimatedCard>
  );

  const renderChurnAnalysis = () => (
    <AnimatedCard direction="up" delay={300}>
      <Text style={styles.sectionTitle}>Churn Risk Analysis</Text>
      <View style={styles.churnContainer}>
        {churnAnalysis.slice(0, 5).map((user, index) => (
          <View key={user.userId} style={styles.churnItem}>
            <View style={styles.churnUserInfo}>
              <Text style={styles.churnUserName}>User {user.userId.slice(-4)}</Text>
              <Text style={styles.churnUserType}>{user.userType}</Text>
            </View>
            <View style={styles.churnMetrics}>
              <Text style={styles.churnMetric}>Sessions: {user.sessionCount}</Text>
              <Text style={styles.churnMetric}>Bookings: {user.totalBookings}</Text>
            </View>
            <View style={[styles.churnRiskBadge, { backgroundColor: getChurnRiskColor(user.churnRisk) }]}>
              <Text style={styles.churnRiskText}>{user.churnRisk.toUpperCase()}</Text>
            </View>
          </View>
        ))}
      </View>
    </AnimatedCard>
  );

  const renderDropoffPoints = () => (
    <AnimatedCard direction="up" delay={400}>
      <Text style={styles.sectionTitle}>User Dropoff Points</Text>
      <View style={styles.dropoffContainer}>
        {analyticsData && Object.entries(analyticsData.dropoffPoints)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([point, count], index) => (
            <View key={point} style={styles.dropoffItem}>
              <View style={styles.dropoffInfo}>
                <Text style={styles.dropoffPoint}>{formatDropoffPoint(point)}</Text>
                <Text style={styles.dropoffCount}>{count} users</Text>
              </View>
              <AnimatedProgressBar
                progress={count / Math.max(...Object.values(analyticsData.dropoffPoints))}
                height={6}
                progressColor="#EF4444"
              />
            </View>
          ))}
      </View>
    </AnimatedCard>
  );

  const renderTopIssues = () => (
    <AnimatedCard direction="up" delay={500}>
      <Text style={styles.sectionTitle}>Top Issues</Text>
      <View style={styles.issuesContainer}>
        {analyticsData?.topIssues.map((issue, index) => (
          <View key={issue.category} style={styles.issueItem}>
            <View style={styles.issueRank}>
              <Text style={styles.issueRankText}>{index + 1}</Text>
            </View>
            <View style={styles.issueInfo}>
              <Text style={styles.issueCategory}>{issue.category}</Text>
              <Text style={styles.issueCount}>{issue.count} reports</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </View>
        ))}
      </View>
    </AnimatedCard>
  );

  const getTypeColor = (type: string): string => {
    const colors = {
      bug: '#EF4444',
      feature: '#3A7DFF',
      ux: '#FF7DB9',
      general: '#10B981',
    };
    return colors[type as keyof typeof colors] || '#6B7280';
  };

  const getChurnRiskColor = (risk: string): string => {
    const colors = {
      low: '#10B981',
      medium: '#F59E0B',
      high: '#EF4444',
    };
    return colors[risk as keyof typeof colors] || '#6B7280';
  };

  const formatDropoffPoint = (point: string): string => {
    const mappings: { [key: string]: string } = {
      'never_started': 'Never Started',
      'app_launch': 'App Launch',
      'onboarding': 'Onboarding',
      'profile_setup': 'Profile Setup',
      'booking_flow': 'Booking Flow',
      'payment': 'Payment',
      'verification': 'Verification',
    };
    return mappings[point] || point.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <AnimatedGradientBackground>
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading Analytics...</Text>
          </View>
        </SafeAreaView>
      </AnimatedGradientBackground>
    );
  }

  return (
    <AnimatedGradientBackground>
      <SafeAreaView style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Header */}
          <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
            <Text style={styles.headerTitle}>Analytics Dashboard</Text>
            <Text style={styles.headerSubtitle}>User Feedback & Insights</Text>
          </Animated.View>

          {/* Timeframe Selector */}
          <Animated.View entering={FadeInDown.delay(150)} style={styles.timeframeContainer}>
            {(['7d', '30d', '90d'] as const).map((timeframe) => (
              <TouchableOpacity
                key={timeframe}
                style={[
                  styles.timeframeButton,
                  selectedTimeframe === timeframe && styles.timeframeButtonActive,
                ]}
                onPress={() => setSelectedTimeframe(timeframe)}
              >
                <Text style={[
                  styles.timeframeText,
                  selectedTimeframe === timeframe && styles.timeframeTextActive,
                ]}>
                  {timeframe}
                </Text>
              </TouchableOpacity>
            ))}
          </Animated.View>

          {/* Key Metrics */}
          <Animated.View entering={FadeInDown.delay(200)} style={styles.metricsGrid}>
            {analyticsData && (
              <>
                {renderMetricCard('Total Feedback', analyticsData.totalFeedback, 'chatbubbles', '#3A7DFF', 0)}
                {renderMetricCard('Churn Rate', `${analyticsData.churnRate.toFixed(1)}%`, 'trending-down', '#EF4444', 100)}
                {renderMetricCard('Active Users', analyticsData.activeUsers, 'people', '#10B981', 200)}
                {renderMetricCard('Avg Rating', analyticsData.averageRating.toFixed(1), 'star', '#FFD700', 300)}
              </>
            )}
          </Animated.View>

          {/* Charts and Analysis */}
          {renderFeedbackChart()}
          {renderChurnAnalysis()}
          {renderDropoffPoints()}
          {renderTopIssues()}

          {/* Spacer */}
          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </AnimatedGradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '500',
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
  timeframeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  timeframeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  timeframeButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  timeframeText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  timeframeTextActive: {
    color: '#3A7DFF',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    width: (screenWidth - 52) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  metricTitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  chartContainer: {
    gap: 16,
  },
  chartBar: {
    // Chart bar styling
  },
  chartBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  chartBarLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  chartBarValue: {
    fontSize: 14,
    color: '#6B7280',
  },
  churnContainer: {
    gap: 12,
  },
  churnItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  churnUserInfo: {
    flex: 1,
  },
  churnUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  churnUserType: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  churnMetrics: {
    marginRight: 12,
  },
  churnMetric: {
    fontSize: 12,
    color: '#6B7280',
  },
  churnRiskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  churnRiskText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  dropoffContainer: {
    gap: 12,
  },
  dropoffItem: {
    // Dropoff item styling
  },
  dropoffInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dropoffPoint: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  dropoffCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  issuesContainer: {
    gap: 12,
  },
  issueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  issueRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3A7DFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  issueRankText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  issueInfo: {
    flex: 1,
  },
  issueCategory: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  issueCount: {
    fontSize: 12,
    color: '#6B7280',
  },
});

export default FeedbackAnalyticsScreen; 

