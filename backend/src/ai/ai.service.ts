import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SitterMatchService } from './sitter-match.service';
import { BookingRecommenderService } from './booking-recommender.service';
import { User } from '../entities/user.entity';
import { SitterProfile } from '../entities/sitter-profile.entity';
import { Booking } from '../entities/booking.entity';
import { Review } from '../entities/review.entity';

export interface AISitterMatchRequest {
  childId: string;
  parentPreferences: {
    budget: { min: number; max: number };
    location: { latitude: number; longitude: number; maxDistance: number };
    schedule: { date: string; startTime: string; endTime: string; duration: number };
    requirements: {
      languages: string[];
      skills: string[];
      experience: number;
      verified: boolean;
      backgroundCheck: boolean;
    };
    priorities: {
      safety: number;
      experience: number;
      cost: number;
      availability: number;
      personality: number;
    };
    urgency: 'low' | 'medium' | 'high';
  };
  limit?: number;
}

export interface AIBookingRecommendationRequest {
  userId: string;
  childId: string;
  timeframe: 'week' | 'month' | 'quarter';
}

export interface AISitterMatchResponse {
  sitterId: string;
  overallScore: number;
  breakdown: {
    temperament: number;
    availability: number;
    location: number;
    experience: number;
    cost: number;
    safety: number;
    communication: number;
    rating: number;
  };
  reasons: string[];
  warnings: string[];
  distance: number;
  estimatedResponseTime: number;
  compatibilityScore: number;
  sitterInfo: {
    name: string;
    rating: number;
    hourlyRate: number;
    experience: number;
    verified: boolean;
    backgroundCheck: boolean;
  };
}

export interface AIBookingRecommendationResponse {
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

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(SitterProfile)
    private sitterProfileRepository: Repository<SitterProfile>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    private sitterMatchService: SitterMatchService,
    private bookingRecommenderService: BookingRecommenderService,
  ) {}

  /**
   * Find best sitter matches using AI
   */
  async findSitterMatches(request: AISitterMatchRequest): Promise<AISitterMatchResponse[]> {
    try {
      this.logger.log(`Finding sitter matches for child ${request.childId}`);

      // Get matches from AI service
      const matches = await this.sitterMatchService.findBestMatches(
        request.childId,
        request.parentPreferences,
        request.limit || 10
      );

      // Enhance with sitter information
      const enhancedMatches: AISitterMatchResponse[] = [];
      
      for (const match of matches) {
        const sitter = await this.sitterProfileRepository.findOne({
          where: { id: match.sitterId },
          relations: ['user'],
        });

        if (sitter) {
          enhancedMatches.push({
            ...match,
            sitterInfo: {
              name: sitter.user.firstName + ' ' + sitter.user.lastName,
              rating: sitter.rating,
              hourlyRate: sitter.hourlyRate,
              experience: sitter.experience,
              verified: sitter.verified,
              backgroundCheck: sitter.backgroundCheck,
            },
          });
        }
      }

      this.logger.log(`Found ${enhancedMatches.length} sitter matches`);
      return enhancedMatches;
    } catch (error) {
      this.logger.error('Error finding sitter matches:', error);
      throw error;
    }
  }

  /**
   * Generate booking recommendations using AI
   */
  async generateBookingRecommendations(request: AIBookingRecommendationRequest): Promise<AIBookingRecommendationResponse[]> {
    try {
      this.logger.log(`Generating booking recommendations for user ${request.userId}`);

      const recommendations = await this.bookingRecommenderService.generateRecommendations(
        request.userId,
        request.childId,
        request.timeframe
      );

      // Enhance with sitter information for recommendations that suggest sitters
      const enhancedRecommendations: AIBookingRecommendationResponse[] = [];
      
      for (const recommendation of recommendations) {
        if (recommendation.suggestedSitter) {
          const sitter = await this.sitterProfileRepository.findOne({
            where: { id: recommendation.suggestedSitter.id },
            relations: ['user'],
          });

          if (sitter) {
            enhancedRecommendations.push({
              ...recommendation,
              suggestedSitter: {
                ...recommendation.suggestedSitter,
                name: sitter.user.firstName + ' ' + sitter.user.lastName,
              },
            });
          }
        } else {
          enhancedRecommendations.push(recommendation);
        }
      }

      this.logger.log(`Generated ${enhancedRecommendations.length} booking recommendations`);
      return enhancedRecommendations;
    } catch (error) {
      this.logger.error('Error generating booking recommendations:', error);
      throw error;
    }
  }

  /**
   * Record match outcome for AI learning
   */
  async recordMatchOutcome(
    sitterId: string,
    childId: string,
    success: boolean,
    rating?: number
  ): Promise<void> {
    try {
      this.logger.log(`Recording match outcome: sitter ${sitterId}, child ${childId}, success: ${success}`);

      await this.sitterMatchService.recordMatchOutcome(sitterId, childId, success, rating);

      // Store in database for analytics
      const booking = await this.bookingRepository.findOne({
        where: { sitterId, childId },
        order: { createdAt: 'DESC' },
      });

      if (booking) {
        booking.aiMatchScore = success ? 1 : 0;
        if (rating) {
          booking.aiRating = rating;
        }
        await this.bookingRepository.save(booking);
      }

      this.logger.log('Match outcome recorded successfully');
    } catch (error) {
      this.logger.error('Error recording match outcome:', error);
      throw error;
    }
  }

  /**
   * Record recommendation feedback for AI learning
   */
  async recordRecommendationFeedback(
    userId: string,
    recommendationId: string,
    action: 'accepted' | 'rejected' | 'modified',
    feedback?: string
  ): Promise<void> {
    try {
      this.logger.log(`Recording recommendation feedback: user ${userId}, recommendation ${recommendationId}, action: ${action}`);

      await this.bookingRecommenderService.recordRecommendationFeedback(
        userId,
        recommendationId,
        action,
        feedback
      );

      this.logger.log('Recommendation feedback recorded successfully');
    } catch (error) {
      this.logger.error('Error recording recommendation feedback:', error);
      throw error;
    }
  }

  /**
   * Get AI insights for a user
   */
  async getUserInsights(userId: string): Promise<any> {
    try {
      this.logger.log(`Getting AI insights for user ${userId}`);

      // Get user's booking history
      const bookings = await this.bookingRepository.find({
        where: { parentId: userId },
        relations: ['sitter', 'sitter.user'],
        order: { createdAt: 'DESC' },
        take: 50,
      });

      // Get user's reviews
      const reviews = await this.reviewRepository.find({
        where: { reviewerId: userId },
        order: { createdAt: 'DESC' },
        take: 20,
      });

      // Analyze patterns
      const insights = {
        bookingPatterns: this.analyzeBookingPatterns(bookings),
        sitterPreferences: this.analyzeSitterPreferences(bookings),
        satisfactionTrends: this.analyzeSatisfactionTrends(reviews),
        recommendations: await this.generatePersonalizedRecommendations(userId),
      };

      this.logger.log('AI insights generated successfully');
      return insights;
    } catch (error) {
      this.logger.error('Error getting user insights:', error);
      throw error;
    }
  }

  /**
   * Analyze booking patterns
   */
  private analyzeBookingPatterns(bookings: Booking[]): any {
    if (bookings.length === 0) return {};

    const patterns = {
      preferredDays: new Map<string, number>(),
      preferredTimes: new Map<string, number>(),
      averageDuration: 0,
      totalBookings: bookings.length,
      averageRating: 0,
    };

    let totalDuration = 0;
    let totalRating = 0;
    let ratingCount = 0;

    for (const booking of bookings) {
      const day = new Date(booking.startTime).toLocaleDateString('en-US', { weekday: 'long' });
      const hour = new Date(booking.startTime).getHours();
      const timeSlot = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

      patterns.preferredDays.set(day, (patterns.preferredDays.get(day) || 0) + 1);
      patterns.preferredTimes.set(timeSlot, (patterns.preferredTimes.get(timeSlot) || 0) + 1);

      const duration = (new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime()) / (1000 * 60 * 60);
      totalDuration += duration;

      if (booking.rating) {
        totalRating += booking.rating;
        ratingCount++;
      }
    }

    patterns.averageDuration = totalDuration / bookings.length;
    patterns.averageRating = ratingCount > 0 ? totalRating / ratingCount : 0;

    return {
      ...patterns,
      preferredDays: Object.fromEntries(patterns.preferredDays),
      preferredTimes: Object.fromEntries(patterns.preferredTimes),
    };
  }

  /**
   * Analyze sitter preferences
   */
  private analyzeSitterPreferences(bookings: Booking[]): any {
    if (bookings.length === 0) return {};

    const preferences = {
      preferredSitters: new Map<string, number>(),
      averageHourlyRate: 0,
      preferredExperience: 0,
      totalSpent: 0,
    };

    let totalRate = 0;
    let totalExperience = 0;
    let totalSpent = 0;

    for (const booking of bookings) {
      if (booking.sitter) {
        const sitterName = `${booking.sitter.user.firstName} ${booking.sitter.user.lastName}`;
        preferences.preferredSitters.set(sitterName, (preferences.preferredSitters.get(sitterName) || 0) + 1);

        totalRate += booking.sitter.hourlyRate;
        totalExperience += booking.sitter.experience;

        const duration = (new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime()) / (1000 * 60 * 60);
        totalSpent += booking.sitter.hourlyRate * duration;
      }
    }

    preferences.averageHourlyRate = totalRate / bookings.length;
    preferences.preferredExperience = totalExperience / bookings.length;
    preferences.totalSpent = totalSpent;

    return {
      ...preferences,
      preferredSitters: Object.fromEntries(preferences.preferredSitters),
    };
  }

  /**
   * Analyze satisfaction trends
   */
  private analyzeSatisfactionTrends(reviews: Review[]): any {
    if (reviews.length === 0) return {};

    const trends = {
      averageRating: 0,
      ratingTrend: 'stable',
      recentRatings: [] as number[],
      olderRatings: [] as number[],
    };

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    trends.averageRating = totalRating / reviews.length;

    // Split reviews into recent and older
    const midPoint = Math.floor(reviews.length / 2);
    trends.recentRatings = reviews.slice(0, midPoint).map(r => r.rating);
    trends.olderRatings = reviews.slice(midPoint).map(r => r.rating);

    const recentAvg = trends.recentRatings.reduce((sum, rating) => sum + rating, 0) / trends.recentRatings.length;
    const olderAvg = trends.olderRatings.reduce((sum, rating) => sum + rating, 0) / trends.olderRatings.length;

    if (recentAvg > olderAvg + 0.5) trends.ratingTrend = 'improving';
    else if (recentAvg < olderAvg - 0.5) trends.ratingTrend = 'declining';

    return trends;
  }

  /**
   * Generate personalized recommendations
   */
  private async generatePersonalizedRecommendations(userId: string): Promise<any> {
    // This would integrate with the booking recommender service
    // For now, return mock recommendations
    return {
      nextBooking: {
        suggestedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        suggestedTime: '18:00-21:00',
        confidence: 85,
        reasoning: ['Based on your weekly booking pattern', 'Matches your preferred schedule'],
      },
      seasonalOpportunities: [
        {
          event: 'Holiday Season',
          suggestedBookings: 3,
          reasoning: ['Increased demand during holidays', 'Book early for best sitters'],
        },
      ],
    };
  }
} 