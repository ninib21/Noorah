import AsyncStorage from '@react-native-async-storage/async-storage';
// import * as Analytics from 'expo-analytics';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Types for feedback data
export interface FeedbackData {
  id: string;
  userId: string;
  type: 'bug' | 'feature' | 'ux' | 'general';
  category: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'reviewed' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  screenshots?: string[];
  deviceInfo: {
    platform: string;
    version: string;
    model: string;
    osVersion: string;
  };
  userInfo: {
    userType: 'parent' | 'sitter';
    subscriptionTier: string;
    appVersion: string;
  };
  metadata: {
    screen: string;
    action: string;
    timestamp: number;
    sessionId: string;
    userFlow: string[];
  };
  createdAt: number;
  updatedAt: number;
}

export interface UserSurvey {
  id: string;
  userId: string;
  surveyType: 'onboarding' | 'post-booking' | 'monthly' | 'feature';
  questions: SurveyQuestion[];
  responses: SurveyResponse[];
  completed: boolean;
  createdAt: number;
  completedAt?: number;
}

export interface SurveyQuestion {
  id: string;
  type: 'rating' | 'multiple-choice' | 'text' | 'yes-no';
  question: string;
  options?: string[];
  required: boolean;
  order: number;
}

export interface SurveyResponse {
  questionId: string;
  answer: string | number | string[];
  timestamp: number;
}

export interface SessionData {
  sessionId: string;
  userId: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  screens: ScreenVisit[];
  actions: UserAction[];
  errors: AppError[];
  performance: PerformanceMetrics;
}

export interface ScreenVisit {
  screen: string;
  enterTime: number;
  exitTime?: number;
  duration?: number;
}

export interface UserAction {
  action: string;
  screen: string;
  timestamp: number;
  metadata?: any;
}

export interface AppError {
  error: string;
  screen: string;
  timestamp: number;
  stack?: string;
  metadata?: any;
}

export interface PerformanceMetrics {
  loadTimes: { [screen: string]: number };
  memoryUsage: number;
  batteryLevel: number;
  networkType: string;
}

export interface ChurnAnalysis {
  userId: string;
  userType: 'parent' | 'sitter';
  dropoffPoint: string;
  dropoffReason?: string;
  sessionCount: number;
  lastActive: number;
  totalBookings: number;
  feedbackScore?: number;
  churnRisk: 'low' | 'medium' | 'high';
}

class FeedbackService {
  private static instance: FeedbackService;
  private currentSession: SessionData | null = null;
  private sessionStartTime: number = Date.now();
  private screenVisits: ScreenVisit[] = [];
  private userActions: UserAction[] = [];
  private errors: AppError[] = [];

  private constructor() {
    this.initializeSession();
  }

  public static getInstance(): FeedbackService {
    if (!FeedbackService.instance) {
      FeedbackService.instance = new FeedbackService();
    }
    return FeedbackService.instance;
  }

  // 🎯 Session Tracking
  private async initializeSession(): Promise<void> {
    const sessionId = this.generateSessionId();
    this.currentSession = {
      sessionId,
      userId: await this.getUserId(),
      startTime: Date.now(),
      screens: [],
      actions: [],
      errors: [],
      performance: {
        loadTimes: {},
        memoryUsage: 0,
        batteryLevel: 0,
        networkType: 'unknown',
      },
    };

    // Track session start
    this.trackEvent('session_start', {
      sessionId,
      timestamp: Date.now(),
    });
  }

  public async endSession(): Promise<void> {
    if (!this.currentSession) return;

    this.currentSession.endTime = Date.now();
    this.currentSession.duration = this.currentSession.endTime - this.currentSession.startTime;

    // Save session data
    await this.saveSessionData(this.currentSession);

    // Track session end
    this.trackEvent('session_end', {
      sessionId: this.currentSession.sessionId,
      duration: this.currentSession.duration,
      screenCount: this.currentSession.screens.length,
      actionCount: this.currentSession.actions.length,
      errorCount: this.currentSession.errors.length,
    });

    // Reset for next session
    this.currentSession = null;
    this.screenVisits = [];
    this.userActions = [];
    this.errors = [];
  }

  // 🎯 Screen Tracking
  public trackScreen(screen: string): void {
    const visit: ScreenVisit = {
      screen,
      enterTime: Date.now(),
    };

    this.screenVisits.push(visit);
    
    if (this.currentSession) {
      this.currentSession.screens.push(visit);
    }

    this.trackEvent('screen_view', {
      screen,
      timestamp: Date.now(),
    });
  }

  public exitScreen(screen: string): void {
    const visit = this.screenVisits.find(v => v.screen === screen && !v.exitTime);
    if (visit) {
      visit.exitTime = Date.now();
      visit.duration = visit.exitTime - visit.enterTime;
    }
  }

  // 🎯 Action Tracking
  public trackAction(action: string, screen: string, metadata?: any): void {
    const userAction: UserAction = {
      action,
      screen,
      timestamp: Date.now(),
      metadata,
    };

    this.userActions.push(userAction);
    
    if (this.currentSession) {
      this.currentSession.actions.push(userAction);
    }

    this.trackEvent('user_action', {
      action,
      screen,
      timestamp: Date.now(),
      metadata,
    });
  }

  // 🎯 Error Tracking
  public trackError(error: string, screen: string, stack?: string, metadata?: any): void {
    const appError: AppError = {
      error,
      screen,
      timestamp: Date.now(),
      stack,
      metadata,
    };

    this.errors.push(appError);
    
    if (this.currentSession) {
      this.currentSession.errors.push(appError);
    }

    this.trackEvent('app_error', {
      error,
      screen,
      timestamp: Date.now(),
      stack,
      metadata,
    });
  }

  // 🎯 Feedback Submission
  public async submitFeedback(feedback: Omit<FeedbackData, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const feedbackData: FeedbackData = {
      ...feedback,
      id: this.generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Save locally
    await this.saveFeedback(feedbackData);

    // Send to backend
    await this.sendFeedbackToBackend(feedbackData);

    // Track feedback submission
    this.trackEvent('feedback_submitted', {
      type: feedback.type,
      category: feedback.category,
      severity: feedback.severity,
      priority: feedback.priority,
    });

    return feedbackData.id;
  }

  // 🎯 Survey Management
  public async createSurvey(survey: Omit<UserSurvey, 'id' | 'createdAt'>): Promise<string> {
    const surveyData: UserSurvey = {
      ...survey,
      id: this.generateId(),
      createdAt: Date.now(),
    };

    await this.saveSurvey(surveyData);
    return surveyData.id;
  }

  public async submitSurveyResponse(surveyId: string, responses: SurveyResponse[]): Promise<void> {
    const survey = await this.getSurvey(surveyId);
    if (!survey) throw new Error('Survey not found');

    survey.responses = responses;
    survey.completed = true;
    survey.completedAt = Date.now();

    await this.saveSurvey(survey);

    // Track survey completion
    this.trackEvent('survey_completed', {
      surveyId,
      surveyType: survey.surveyType,
      responseCount: responses.length,
    });
  }

  // 🎯 Churn Analysis
  public async analyzeChurn(): Promise<ChurnAnalysis[]> {
    const sessions = await this.getAllSessions();
    const feedback = await this.getAllFeedback();
    const users = await this.getUserData();

    const churnAnalysis: ChurnAnalysis[] = [];

    for (const user of users) {
      const userSessions = sessions.filter(s => s.userId === user.id);
      const userFeedback = feedback.filter(f => f.userId === user.id);
      
      const lastSession = userSessions.sort((a, b) => b.startTime - a.startTime)[0];
      const daysSinceLastActive = lastSession ? (Date.now() - lastSession.startTime) / (1000 * 60 * 60 * 24) : 0;
      
      const dropoffPoint = this.identifyDropoffPoint(userSessions);
      const churnRisk = this.calculateChurnRisk(userSessions, userFeedback, daysSinceLastActive);

      churnAnalysis.push({
        userId: user.id,
        userType: user.userType,
        dropoffPoint,
        sessionCount: userSessions.length,
        lastActive: lastSession?.startTime || 0,
        totalBookings: user.totalBookings || 0,
        feedbackScore: this.calculateFeedbackScore(userFeedback),
        churnRisk,
      });
    }

    return churnAnalysis;
  }

  // 🎯 Analytics Events
  private async trackEvent(eventName: string, properties: any): Promise<void> {
    try {
      // Track with Expo Analytics
      // await Analytics.logEvent(eventName, properties);

      // Save locally for offline analysis
      await this.saveAnalyticsEvent(eventName, properties);
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  // 🎯 In-App Feedback Widget
  public async showFeedbackWidget(): Promise<void> {
    // Trigger feedback modal
    this.trackEvent('feedback_widget_opened', {
      timestamp: Date.now(),
    });
  }

  // 🎯 Performance Monitoring
  public async trackPerformance(metrics: Partial<PerformanceMetrics>): Promise<void> {
    if (this.currentSession) {
      this.currentSession.performance = {
        ...this.currentSession.performance,
        ...metrics,
      };
    }

    this.trackEvent('performance_metrics', {
      ...metrics,
      timestamp: Date.now(),
    });
  }

  // 🎯 User Flow Analysis
  public async analyzeUserFlow(): Promise<any> {
    const sessions = await this.getAllSessions();
    const flowAnalysis: any = {};

    for (const session of sessions) {
      const flow = session.screens.map(s => s.screen);
      const flowKey = flow.join(' -> ');
      
      if (!flowAnalysis[flowKey]) {
        flowAnalysis[flowKey] = {
          count: 0,
          avgDuration: 0,
          dropoffRate: 0,
        };
      }
      
      flowAnalysis[flowKey].count++;
      flowAnalysis[flowKey].avgDuration += session.duration || 0;
    }

    // Calculate averages
    Object.keys(flowAnalysis).forEach(flow => {
      flowAnalysis[flow].avgDuration /= flowAnalysis[flow].count;
    });

    return flowAnalysis;
  }

  // 🎯 Utility Methods
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async getUserId(): Promise<string> {
    try {
      return await AsyncStorage.getItem('userId') || 'anonymous';
    } catch {
      return 'anonymous';
    }
  }

  private identifyDropoffPoint(sessions: SessionData[]): string {
    if (sessions.length === 0) return 'never_started';

    const lastSession = sessions[sessions.length - 1];
    const screens = lastSession.screens;
    
    if (screens.length === 0) return 'app_launch';
    
    const lastScreen = screens[screens.length - 1];
    return lastScreen.screen;
  }

  private calculateChurnRisk(sessions: SessionData[], feedback: FeedbackData[], daysSinceLastActive: number): 'low' | 'medium' | 'high' {
    const sessionCount = sessions.length;
    const negativeFeedback = feedback.filter(f => f.severity === 'high' || f.severity === 'critical').length;
    
    if (daysSinceLastActive > 30 || negativeFeedback > 3) return 'high';
    if (daysSinceLastActive > 7 || negativeFeedback > 1) return 'medium';
    return 'low';
  }

  private calculateFeedbackScore(feedback: FeedbackData[]): number {
    if (feedback.length === 0) return 0;
    
    const scores = feedback.map(f => {
      switch (f.severity) {
        case 'critical': return 1;
        case 'high': return 2;
        case 'medium': return 3;
        case 'low': return 4;
        default: return 3;
      }
    });
    
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  // 🎯 Data Persistence
  private async saveFeedback(feedback: FeedbackData): Promise<void> {
    try {
      const key = `feedback_${feedback.id}`;
      await AsyncStorage.setItem(key, JSON.stringify(feedback));
    } catch (error) {
      console.error('Failed to save feedback:', error);
    }
  }

  private async saveSurvey(survey: UserSurvey): Promise<void> {
    try {
      const key = `survey_${survey.id}`;
      await AsyncStorage.setItem(key, JSON.stringify(survey));
    } catch (error) {
      console.error('Failed to save survey:', error);
    }
  }

  private async saveSessionData(session: SessionData): Promise<void> {
    try {
      const key = `session_${session.sessionId}`;
      await AsyncStorage.setItem(key, JSON.stringify(session));
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }

  private async saveAnalyticsEvent(eventName: string, properties: any): Promise<void> {
    try {
      const events = await this.getAnalyticsEvents();
      events.push({ eventName, properties, timestamp: Date.now() });
      await AsyncStorage.setItem('analytics_events', JSON.stringify(events));
    } catch (error) {
      console.error('Failed to save analytics event:', error);
    }
  }

  private async getSurvey(surveyId: string): Promise<UserSurvey | null> {
    try {
      const key = `survey_${surveyId}`;
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  private async getAllSessions(): Promise<SessionData[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const sessionKeys = keys.filter(key => key.startsWith('session_'));
      const sessions = await AsyncStorage.multiGet(sessionKeys);
      return sessions.map(([_, value]) => value ? JSON.parse(value) : null).filter(Boolean);
    } catch {
      return [];
    }
  }

  private async getAllFeedback(): Promise<FeedbackData[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const feedbackKeys = keys.filter(key => key.startsWith('feedback_'));
      const feedback = await AsyncStorage.multiGet(feedbackKeys);
      return feedback.map(([_, value]) => value ? JSON.parse(value) : null).filter(Boolean);
    } catch {
      return [];
    }
  }

  private async getAnalyticsEvents(): Promise<any[]> {
    try {
      const data = await AsyncStorage.getItem('analytics_events');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private async getUserData(): Promise<any[]> {
    // Mock user data - replace with actual user data source
    return [];
  }

  private async sendFeedbackToBackend(feedback: FeedbackData): Promise<void> {
    // TODO: Implement backend API call
    console.log('Sending feedback to backend:', feedback);
  }
}

export default FeedbackService; 