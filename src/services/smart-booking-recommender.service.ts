import { Platform } from 'react-native';

export interface BookingRecommendation {
  id: string;
  type: 'recurring' | 'one-time' | 'urgent' | 'seasonal';
  confidence: number; // 0-100
  reasoning: string[];
  suggestedSitter?: {
    id: string;
    name: string;
    rating: number;
    matchScore: number;
  };
  suggestedSchedule: {
    date: string;
    startTime: string;
    endTime: string;
    duration: number;
  };
  estimatedCost: {
    min: number;
    max: number;
    average: number;
  };
  urgency: 'low' | 'medium' | 'high';
  category: 'childcare' | 'date-night' | 'emergency' | 'regular';
}

export interface UserBehavior {
  userId: string;
  bookingPatterns: {
    preferredDays: string[];
    preferredTimes: {
      start: string;
      end: string;
    };
    averageDuration: number;
    frequency: 'weekly' | 'bi-weekly' | 'monthly' | 'occasional';
  };
  sitterPreferences: {
    preferredSitters: string[];
    avoidedSitters: string[];
    ratingThreshold: number;
    maxDistance: number;
  };
  budgetPatterns: {
    averageSpent: number;
    maxBudget: number;
    seasonalVariations: Record<string, number>;
  };
  cancellationPatterns: {
    cancellationRate: number;
    commonReasons: string[];
    advanceNotice: number; // hours
  };
}

export interface SeasonalFactors {
  season: 'spring' | 'summer' | 'fall' | 'winter';
  holidays: string[];
  schoolSchedule: {
    startDate: string;
    endDate: string;
    breaks: Array<{
      name: string;
      startDate: string;
      endDate: string;
    }>;
  };
  weatherPatterns: {
    averageTemperature: number;
    precipitation: number;
    outdoorActivityFriendly: boolean;
  };
}

class SmartBookingRecommenderService {
  private userBehaviors: Map<string, UserBehavior> = new Map();
  private seasonalFactors: SeasonalFactors[] = [];
  private recommendationHistory: Map<string, BookingRecommendation[]> = new Map();

  /**
   * Initialize the smart booking recommender
   */
  async initialize(): Promise<void> {
    try {
      await this.loadUserBehaviors();
      await this.loadSeasonalFactors();
      await this.loadRecommendationHistory();
      
      console.log('Smart Booking Recommender service initialized');
    } catch (error) {
      console.error('Failed to initialize Smart Booking Recommender service:', error);
      throw error;
    }
  }

  /**
   * Generate personalized booking recommendations
   */
  async generateRecommendations(
    userId: string,
    childId: string,
    timeframe: 'week' | 'month' | 'quarter' = 'month'
  ): Promise<BookingRecommendation[]> {
    try {
      const userBehavior = this.userBehaviors.get(userId);
      if (!userBehavior) {
        throw new Error('User behavior data not found');
      }

      const recommendations: BookingRecommendation[] = [];

      // Generate recurring booking recommendations
      const recurringRecommendations = await this.generateRecurringRecommendations(
        userId,
        childId,
        userBehavior,
        timeframe
      );
      recommendations.push(...recurringRecommendations);

      // Generate seasonal recommendations
      const seasonalRecommendations = await this.generateSeasonalRecommendations(
        userId,
        childId,
        userBehavior,
        timeframe
      );
      recommendations.push(...seasonalRecommendations);

      // Generate date night recommendations
      const dateNightRecommendations = await this.generateDateNightRecommendations(
        userId,
        childId,
        userBehavior,
        timeframe
      );
      recommendations.push(...dateNightRecommendations);

      // Sort by confidence and urgency
      recommendations.sort((a, b) => {
        const aScore = a.confidence * (a.urgency === 'high' ? 1.5 : a.urgency === 'medium' ? 1.2 : 1);
        const bScore = b.confidence * (b.urgency === 'high' ? 1.5 : b.urgency === 'medium' ? 1.2 : 1);
        return bScore - aScore;
      });

      // Store recommendations for learning
      this.recommendationHistory.set(userId, recommendations);

      return recommendations.slice(0, 10); // Return top 10 recommendations
    } catch (error) {
      console.error('Error generating recommendations:', error);
      throw error;
    }
  }

  /**
   * Generate recurring booking recommendations based on patterns
   */
  private async generateRecurringRecommendations(
    userId: string,
    childId: string,
    behavior: UserBehavior,
    timeframe: string
  ): Promise<BookingRecommendation[]> {
    const recommendations: BookingRecommendation[] = [];
    const now = new Date();

    // Analyze booking frequency patterns
    if (behavior.bookingPatterns.frequency === 'weekly') {
      for (let i = 0; i < 4; i++) {
        const nextWeek = new Date(now.getTime() + (i + 1) * 7 * 24 * 60 * 60 * 1000);
        const dayName = nextWeek.toLocaleDateString('en-US', { weekday: 'long' });

        if (behavior.bookingPatterns.preferredDays.includes(dayName)) {
          recommendations.push({
            id: `recurring-${i}`,
            type: 'recurring',
            confidence: this.calculateRecurringConfidence(behavior, i),
            reasoning: [
              `Based on your weekly ${dayName} bookings`,
              'Matches your preferred schedule',
              'Consistent with your booking patterns'
            ],
            suggestedSchedule: {
              date: nextWeek.toISOString().split('T')[0],
              startTime: behavior.bookingPatterns.preferredTimes.start,
              endTime: behavior.bookingPatterns.preferredTimes.end,
              duration: behavior.bookingPatterns.averageDuration,
            },
            estimatedCost: {
              min: behavior.budgetPatterns.averageSpent * 0.8,
              max: behavior.budgetPatterns.averageSpent * 1.2,
              average: behavior.budgetPatterns.averageSpent,
            },
            urgency: 'low',
            category: 'regular',
          });
        }
      }
    }

    return recommendations;
  }

  /**
   * Generate seasonal recommendations
   */
  private async generateSeasonalRecommendations(
    userId: string,
    childId: string,
    behavior: UserBehavior,
    timeframe: string
  ): Promise<BookingRecommendation[]> {
    const recommendations: BookingRecommendation[] = [];
    const currentSeason = this.getCurrentSeason();
    const seasonalFactor = this.seasonalFactors.find(s => s.season === currentSeason);

    if (!seasonalFactor) return recommendations;

    // Holiday-based recommendations
    for (const holiday of seasonalFactor.holidays) {
      const holidayDate = this.getHolidayDate(holiday);
      if (holidayDate && holidayDate > new Date()) {
        recommendations.push({
          id: `seasonal-${holiday}`,
          type: 'seasonal',
          confidence: 85,
          reasoning: [
            `${holiday} is approaching`,
            'Increased demand for sitters during holidays',
            'Book early to secure preferred sitters'
          ],
          suggestedSchedule: {
            date: holidayDate.toISOString().split('T')[0],
            startTime: '18:00',
            endTime: '22:00',
            duration: 4,
          },
          estimatedCost: {
            min: behavior.budgetPatterns.averageSpent * 1.3,
            max: behavior.budgetPatterns.averageSpent * 1.8,
            average: behavior.budgetPatterns.averageSpent * 1.5,
          },
          urgency: 'medium',
          category: 'childcare',
        });
      }
    }

    // Weather-based recommendations
    if (seasonalFactor.weatherPatterns.outdoorActivityFriendly) {
      recommendations.push({
        id: `weather-${currentSeason}`,
        type: 'seasonal',
        confidence: 75,
        reasoning: [
          `Great weather for outdoor activities in ${currentSeason}`,
          'Perfect time for park visits and outdoor play',
          'Sitters with outdoor activity experience recommended'
        ],
        suggestedSchedule: {
          date: this.getNextWeekendDate().toISOString().split('T')[0],
          startTime: '10:00',
          endTime: '16:00',
          duration: 6,
        },
        estimatedCost: {
          min: behavior.budgetPatterns.averageSpent * 0.9,
          max: behavior.budgetPatterns.averageSpent * 1.1,
          average: behavior.budgetPatterns.averageSpent,
        },
        urgency: 'low',
        category: 'childcare',
      });
    }

    return recommendations;
  }

  /**
   * Generate date night recommendations
   */
  private async generateDateNightRecommendations(
    userId: string,
    childId: string,
    behavior: UserBehavior,
    timeframe: string
  ): Promise<BookingRecommendation[]> {
    const recommendations: BookingRecommendation[] = [];
    const now = new Date();

    // Weekend date night recommendations
    for (let i = 0; i < 4; i++) {
      const nextWeekend = this.getNextWeekendDate(i);
      
      recommendations.push({
        id: `date-night-${i}`,
        type: 'one-time',
        confidence: 80,
        reasoning: [
          'Weekend date night opportunity',
          'Based on typical family patterns',
          'Extended evening coverage recommended'
        ],
        suggestedSchedule: {
          date: nextWeekend.toISOString().split('T')[0],
          startTime: '18:00',
          endTime: '23:00',
          duration: 5,
        },
        estimatedCost: {
          min: behavior.budgetPatterns.averageSpent * 1.2,
          max: behavior.budgetPatterns.averageSpent * 1.6,
          average: behavior.budgetPatterns.averageSpent * 1.4,
        },
        urgency: 'medium',
        category: 'date-night',
      });
    }

    return recommendations;
  }

  /**
   * Calculate confidence score for recurring recommendations
   */
  private calculateRecurringConfidence(behavior: UserBehavior, weeksAhead: number): number {
    let confidence = 70; // Base confidence

    // Adjust based on booking frequency
    if (behavior.bookingPatterns.frequency === 'weekly') confidence += 15;
    else if (behavior.bookingPatterns.frequency === 'bi-weekly') confidence += 10;

    // Adjust based on cancellation rate
    if (behavior.cancellationPatterns.cancellationRate < 0.1) confidence += 10;
    else if (behavior.cancellationPatterns.cancellationRate > 0.3) confidence -= 15;

    // Adjust based on weeks ahead (further out = lower confidence)
    confidence -= weeksAhead * 5;

    return Math.max(0, Math.min(100, confidence));
  }

  /**
   * Get current season
   */
  private getCurrentSeason(): string {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  }

  /**
   * Get next weekend date
   */
  private getNextWeekendDate(weeksAhead: number = 0): Date {
    const now = new Date();
    const daysUntilSaturday = (6 - now.getDay() + 7) % 7;
    const nextSaturday = new Date(now.getTime() + (daysUntilSaturday + weeksAhead * 7) * 24 * 60 * 60 * 1000);
    return nextSaturday;
  }

  /**
   * Get holiday date (simplified implementation)
   */
  private getHolidayDate(holiday: string): Date | null {
    const now = new Date();
    const year = now.getFullYear();

    // Simplified holiday dates (in real implementation, use a proper holiday library)
    const holidayDates: Record<string, string> = {
      'Christmas': `${year}-12-25`,
      'New Year': `${year + 1}-01-01`,
      'Valentine\'s Day': `${year}-02-14`,
      'Easter': `${year}-04-09`, // Approximate
      'Thanksgiving': `${year}-11-23`, // Approximate
      'Halloween': `${year}-10-31`,
    };

    const dateString = holidayDates[holiday];
    if (!dateString) return null;

    const holidayDate = new Date(dateString);
    return holidayDate > now ? holidayDate : null;
  }

  /**
   * Record recommendation feedback for learning
   */
  async recordRecommendationFeedback(
    userId: string,
    recommendationId: string,
    action: 'accepted' | 'rejected' | 'modified',
    feedback?: string
  ): Promise<void> {
    try {
      const userBehavior = this.userBehaviors.get(userId);
      if (!userBehavior) return;

      // Update user behavior based on feedback
      if (action === 'accepted') {
        // Strengthen the pattern that led to this recommendation
        console.log(`Recommendation ${recommendationId} accepted by user ${userId}`);
      } else if (action === 'rejected') {
        // Weaken the pattern that led to this recommendation
        console.log(`Recommendation ${recommendationId} rejected by user ${userId}`);
      }

      // Store feedback for future learning
      // In a real implementation, this would be stored in a database
    } catch (error) {
      console.error('Error recording recommendation feedback:', error);
    }
  }

  /**
   * Load user behaviors (mock implementation)
   */
  private async loadUserBehaviors(): Promise<void> {
    this.userBehaviors.set('user1', {
      userId: 'user1',
      bookingPatterns: {
        preferredDays: ['Monday', 'Wednesday', 'Friday'],
        preferredTimes: { start: '18:00', end: '21:00' },
        averageDuration: 3,
        frequency: 'weekly',
      },
      sitterPreferences: {
        preferredSitters: ['sitter1', 'sitter3'],
        avoidedSitters: ['sitter5'],
        ratingThreshold: 4.5,
        maxDistance: 10,
      },
      budgetPatterns: {
        averageSpent: 75,
        maxBudget: 120,
        seasonalVariations: {
          'summer': 1.2,
          'winter': 0.9,
        },
      },
      cancellationPatterns: {
        cancellationRate: 0.05,
        commonReasons: ['Schedule conflict', 'Child sick'],
        advanceNotice: 24,
      },
    });
  }

  /**
   * Load seasonal factors (mock implementation)
   */
  private async loadSeasonalFactors(): Promise<void> {
    this.seasonalFactors = [
      {
        season: 'spring',
        holidays: ['Easter'],
        schoolSchedule: {
          startDate: '2024-09-01',
          endDate: '2024-06-15',
          breaks: [
            { name: 'Spring Break', startDate: '2024-03-15', endDate: '2024-03-22' },
          ],
        },
        weatherPatterns: {
          averageTemperature: 15,
          precipitation: 0.3,
          outdoorActivityFriendly: true,
        },
      },
      {
        season: 'summer',
        holidays: ['Independence Day'],
        schoolSchedule: {
          startDate: '2024-09-01',
          endDate: '2024-06-15',
          breaks: [
            { name: 'Summer Break', startDate: '2024-06-15', endDate: '2024-09-01' },
          ],
        },
        weatherPatterns: {
          averageTemperature: 25,
          precipitation: 0.2,
          outdoorActivityFriendly: true,
        },
      },
      {
        season: 'fall',
        holidays: ['Halloween', 'Thanksgiving'],
        schoolSchedule: {
          startDate: '2024-09-01',
          endDate: '2024-06-15',
          breaks: [
            { name: 'Fall Break', startDate: '2024-10-15', endDate: '2024-10-18' },
          ],
        },
        weatherPatterns: {
          averageTemperature: 10,
          precipitation: 0.4,
          outdoorActivityFriendly: true,
        },
      },
      {
        season: 'winter',
        holidays: ['Christmas', 'New Year'],
        schoolSchedule: {
          startDate: '2024-09-01',
          endDate: '2024-06-15',
          breaks: [
            { name: 'Winter Break', startDate: '2024-12-20', endDate: '2025-01-05' },
          ],
        },
        weatherPatterns: {
          averageTemperature: 0,
          precipitation: 0.5,
          outdoorActivityFriendly: false,
        },
      },
    ];
  }

  /**
   * Load recommendation history (mock implementation)
   */
  private async loadRecommendationHistory(): Promise<void> {
    // Mock implementation - in real app, this would load from database
  }
}

export default new SmartBookingRecommenderService(); 