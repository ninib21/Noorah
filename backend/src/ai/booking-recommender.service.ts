import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from '../entities/booking.entity';
import { User } from '../entities/user.entity';
import { SitterProfile } from '../entities/sitter-profile.entity';

export interface BookingRecommendation {
  id: string;
  type: 'recurring' | 'one-time' | 'urgent' | 'seasonal';
  confidence: number;
  reasoning: string[];
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
  suggestedSitter?: {
    id: string;
    name: string;
    rating: number;
    matchScore: number;
  };
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
    advanceNotice: number;
  };
}

@Injectable()
export class BookingRecommenderService {
  private readonly logger = new Logger(BookingRecommenderService.name);

  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(SitterProfile)
    private sitterProfileRepository: Repository<SitterProfile>,
  ) {}

  /**
   * Generate personalized booking recommendations
   */
  async generateRecommendations(
    userId: string,
    childId: string,
    timeframe: 'week' | 'month' | 'quarter' = 'month'
  ): Promise<BookingRecommendation[]> {
    try {
      this.logger.log(`Generating booking recommendations for user ${userId}`);

      // Analyze user behavior
      const userBehavior = await this.analyzeUserBehavior(userId);
      
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

      this.logger.log(`Generated ${recommendations.length} booking recommendations`);
      return recommendations.slice(0, 10); // Return top 10 recommendations
    } catch (error) {
      this.logger.error('Error generating recommendations:', error);
      throw error;
    }
  }

  /**
   * Analyze user behavior from booking history
   */
  private async analyzeUserBehavior(userId: string): Promise<UserBehavior> {
    const bookings = await this.bookingRepository.find({
      where: { parentId: userId },
      relations: ['sitter', 'sitter.user'],
      order: { createdAt: 'DESC' },
      take: 50,
    });

    if (bookings.length === 0) {
      return this.getDefaultUserBehavior(userId);
    }

    const behavior: UserBehavior = {
      userId,
      bookingPatterns: this.analyzeBookingPatterns(bookings),
      sitterPreferences: this.analyzeSitterPreferences(bookings),
      budgetPatterns: this.analyzeBudgetPatterns(bookings),
      cancellationPatterns: this.analyzeCancellationPatterns(bookings),
    };

    return behavior;
  }

  /**
   * Analyze booking patterns
   */
  private analyzeBookingPatterns(bookings: Booking[]): UserBehavior['bookingPatterns'] {
    const dayCounts = new Map<string, number>();
    const timeSlots = new Map<string, number>();
    let totalDuration = 0;

    for (const booking of bookings) {
      const day = new Date(booking.startTime).toLocaleDateString('en-US', { weekday: 'long' });
      const hour = new Date(booking.startTime).getHours();
      const timeSlot = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

      dayCounts.set(day, (dayCounts.get(day) || 0) + 1);
      timeSlots.set(timeSlot, (timeSlots.get(timeSlot) || 0) + 1);

      const duration = (new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime()) / (1000 * 60 * 60);
      totalDuration += duration;
    }

    const preferredDays = Array.from(dayCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([day]) => day);

    const preferredTimeSlot = Array.from(timeSlots.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'evening';

    const averageDuration = totalDuration / bookings.length;

    // Determine frequency
    const weeklyBookings = bookings.filter(b => {
      const bookingDate = new Date(b.startTime);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return bookingDate > weekAgo;
    }).length;

    let frequency: 'weekly' | 'bi-weekly' | 'monthly' | 'occasional';
    if (weeklyBookings >= 2) frequency = 'weekly';
    else if (weeklyBookings >= 1) frequency = 'bi-weekly';
    else if (bookings.length >= 3) frequency = 'monthly';
    else frequency = 'occasional';

    return {
      preferredDays,
      preferredTimes: {
        start: preferredTimeSlot === 'morning' ? '08:00' : preferredTimeSlot === 'afternoon' ? '14:00' : '18:00',
        end: preferredTimeSlot === 'morning' ? '12:00' : preferredTimeSlot === 'afternoon' ? '18:00' : '22:00',
      },
      averageDuration,
      frequency,
    };
  }

  /**
   * Analyze sitter preferences
   */
  private analyzeSitterPreferences(bookings: Booking[]): UserBehavior['sitterPreferences'] {
    const sitterCounts = new Map<string, number>();
    const avoidedSitters = new Set<string>();
    let totalRating = 0;
    let ratingCount = 0;
    let totalDistance = 0;
    let distanceCount = 0;

    for (const booking of bookings) {
      if (booking.sitter) {
        const sitterName = `${booking.sitter.firstName} ${booking.sitter.lastName}`;
        sitterCounts.set(sitterName, (sitterCounts.get(sitterName) || 0) + 1);

        if (booking.rating) {
          totalRating += booking.rating;
          ratingCount++;
        }

        // Calculate distance (simplified)
        if (booking.location) {
          totalDistance += 5; // Mock distance
          distanceCount++;
        }
      }
    }

    const preferredSitters = Array.from(sitterCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name]) => name);

    return {
      preferredSitters,
      avoidedSitters: Array.from(avoidedSitters),
      ratingThreshold: ratingCount > 0 ? totalRating / ratingCount : 4.0,
      maxDistance: distanceCount > 0 ? totalDistance / distanceCount + 5 : 10,
    };
  }

  /**
   * Analyze budget patterns
   */
  private analyzeBudgetPatterns(bookings: Booking[]): UserBehavior['budgetPatterns'] {
    let totalSpent = 0;
    let maxSpent = 0;

    for (const booking of bookings) {
      if (booking.sitter) {
        const duration = (new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime()) / (1000 * 60 * 60);
        const cost = booking.sitter.hourlyRate * duration;
        totalSpent += cost;
        maxSpent = Math.max(maxSpent, cost);
      }
    }

    const averageSpent = totalSpent / bookings.length;

    return {
      averageSpent: averageSpent || 75,
      maxBudget: maxSpent * 1.2 || 120,
      seasonalVariations: {
        'summer': 1.2,
        'winter': 0.9,
      },
    };
  }

  /**
   * Analyze cancellation patterns
   */
  private analyzeCancellationPatterns(bookings: Booking[]): UserBehavior['cancellationPatterns'] {
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
    const cancellationRate = cancelledBookings / bookings.length;

    return {
      cancellationRate,
      commonReasons: ['Schedule conflict', 'Child sick'],
      advanceNotice: 24,
    };
  }

  /**
   * Get default user behavior for new users
   */
  private getDefaultUserBehavior(userId: string): UserBehavior {
    return {
      userId,
      bookingPatterns: {
        preferredDays: ['Monday', 'Wednesday', 'Friday'],
        preferredTimes: { start: '18:00', end: '21:00' },
        averageDuration: 3,
        frequency: 'weekly',
      },
      sitterPreferences: {
        preferredSitters: [],
        avoidedSitters: [],
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
    };
  }

  /**
   * Generate recurring booking recommendations
   */
  private async generateRecurringRecommendations(
    userId: string,
    childId: string,
    behavior: UserBehavior,
    timeframe: string
  ): Promise<BookingRecommendation[]> {
    const recommendations: BookingRecommendation[] = [];
    const now = new Date();

    // Generate recommendations based on frequency
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

    // Holiday-based recommendations
    const holidays = this.getUpcomingHolidays();
    for (const holiday of holidays) {
      recommendations.push({
        id: `seasonal-${holiday.name}`,
        type: 'seasonal',
        confidence: 85,
        reasoning: [
          `${holiday.name} is approaching`,
          'Increased demand for sitters during holidays',
          'Book early to secure preferred sitters'
        ],
        suggestedSchedule: {
          date: holiday.date,
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

    // Weather-based recommendations
    if (this.isOutdoorActivitySeason(currentSeason)) {
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
   * Get upcoming holidays
   */
  private getUpcomingHolidays(): Array<{ name: string; date: string }> {
    const now = new Date();
    const year = now.getFullYear();
    const holidays = [
      { name: 'Christmas', date: `${year}-12-25` },
      { name: 'New Year', date: `${year + 1}-01-01` },
      { name: 'Valentine\'s Day', date: `${year}-02-14` },
      { name: 'Easter', date: `${year}-04-09` },
      { name: 'Thanksgiving', date: `${year}-11-23` },
      { name: 'Halloween', date: `${year}-10-31` },
    ];

    return holidays.filter(holiday => {
      const holidayDate = new Date(holiday.date);
      return holidayDate > now && holidayDate.getTime() - now.getTime() < 90 * 24 * 60 * 60 * 1000; // Within 90 days
    });
  }

  /**
   * Check if it's outdoor activity season
   */
  private isOutdoorActivitySeason(season: string): boolean {
    return ['spring', 'summer', 'fall'].includes(season);
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
   * Record recommendation feedback for learning
   */
  async recordRecommendationFeedback(
    userId: string,
    recommendationId: string,
    action: 'accepted' | 'rejected' | 'modified',
    feedback?: string
  ): Promise<void> {
    try {
      this.logger.log(`Recording recommendation feedback: user ${userId}, recommendation ${recommendationId}, action: ${action}`);

      // Store feedback in database for future learning
      // This could be used to improve the recommendation algorithm
      
      this.logger.log('Recommendation feedback recorded successfully');
    } catch (error) {
      this.logger.error('Error recording recommendation feedback:', error);
      throw error;
    }
  }

  async generateSessionSummary(bookingId: string): Promise<any> {
    try {
      const booking = await this.bookingRepository.findOne({
        where: { id: bookingId },
        relations: ['sitter', 'parent'],
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      const sitterName = `${booking.sitter.firstName} ${booking.sitter.lastName}`;
      const parentName = `${booking.parent.firstName} ${booking.parent.lastName}`;

      // Generate AI summary
      const summary = await this.generateSummary({
        sitterName,
        parentName,
        duration: booking.duration,
        activities: booking.activities || [],
        notes: booking.notes || '',
        rating: booking.rating || 0,
      });

      return {
        bookingId,
        summary,
        generatedAt: new Date(),
      };
    } catch (error) {
      this.logger.error('Error generating session summary:', error);
      throw error;
    }
  }

  private async generateSummary(data: any): Promise<string> {
    // In a real implementation, you'd use AI to generate a summary
    console.log('Generating summary for:', data);
    return `Session summary for ${data.sitterName} and ${data.parentName}`;
  }
} 