import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserType } from '../entities/user.entity';
import { Booking, BookingStatus } from '../entities/booking.entity';
import { Review } from '../entities/review.entity';

export interface MatchCriteria {
  parentId: string;
  childId: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  schedule: {
    startTime: Date;
    endTime: Date;
    days: string[];
  };
  preferences: {
    experience: number;
    skills: string[];
    certifications: string[];
  };
  budget: {
    minRate: number;
    maxRate: number;
  };
}

export interface MatchResult {
  sitter: User;
  score: number;
  factors: {
    location: number;
    availability: number;
    experience: number;
    rating: number;
    price: number;
    safety: number;
    compatibility: number;
  };
  warnings: string[];
  recommendations: string[];
}

export interface TrustScore {
  overall: number;
  factors: {
    backgroundCheck: number;
    responseRate: number;
    cancellationRate: number;
    rating: number;
    completionRate: number;
    verificationLevel: number;
  };
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
}

@Injectable()
export class SitterMatchService {
  private readonly logger = new Logger(SitterMatchService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
  ) {}

  /**
   * Find the best sitters for a parent's booking request
   */
  async findBestMatches(criteria: MatchCriteria): Promise<MatchResult[]> {
    this.logger.log(`Finding matches for parent ${criteria.parentId}`);

    try {
      // Get all available sitters in the area
      const availableSitters = await this.getAvailableSitters(criteria);

      // Calculate match scores for each sitter
      const matches: MatchResult[] = [];

      for (const sitter of availableSitters) {
        const match = await this.calculateMatchScore(sitter, criteria);
        if (match.score > 0.3) { // Minimum threshold
          matches.push(match);
        }
      }

      // Sort by score and return top matches
      return matches
        .sort((a, b) => b.score - a.score)
        .slice(0, 20); // Return top 20 matches

    } catch (error) {
      this.logger.error('Error finding matches:', error);
      throw new Error('Failed to find suitable sitters');
    }
  }

  /**
   * Calculate comprehensive trust score for a sitter
   */
  async calculateTrustScore(sitterId: string): Promise<TrustScore> {
    const sitter = await this.userRepository.findOne({ where: { id: sitterId } });
    if (!sitter) throw new Error('Sitter not found');

    // Get sitter's booking history
    const bookings = await this.bookingRepository.find({
      where: { sitterId },
      relations: ['reviews'],
    });

    // Get sitter's reviews
    const reviews = await this.reviewRepository.find({
      where: { revieweeId: sitterId },
    });

    // Calculate individual factors
    const backgroundCheck = this.calculateBackgroundCheckScore(sitter);
    const responseRate = this.calculateResponseRate(sitter, bookings);
    const cancellationRate = this.calculateCancellationRate(bookings);
    const rating = this.calculateRatingScore(sitter);
    const completionRate = this.calculateCompletionRate(bookings);
    const verificationLevel = this.calculateVerificationScore(sitter);

    // Calculate overall score
    const overall = (
      backgroundCheck * 0.25 +
      responseRate * 0.20 +
      (1 - cancellationRate) * 0.15 +
      rating * 0.20 +
      completionRate * 0.15 +
      verificationLevel * 0.05
    );

    // Determine risk level
    const riskLevel = this.determineRiskLevel(overall);

    // Generate recommendations
    const recommendations = this.generateTrustRecommendations({
      backgroundCheck,
      responseRate,
      cancellationRate,
      rating,
      completionRate,
      verificationLevel,
    });

    return {
      overall,
      factors: {
        backgroundCheck,
        responseRate,
        cancellationRate,
        rating,
        completionRate,
        verificationLevel,
      },
      riskLevel,
      recommendations,
    };
  }

  /**
   * Predict booking success probability
   */
  async predictBookingSuccess(parentId: string, sitterId: string, bookingData: any): Promise<number> {
    // Get historical data
    const parentBookings = await this.bookingRepository.find({
      where: { parentId },
      relations: ['sitter'],
    });

    const sitterBookings = await this.bookingRepository.find({
      where: { sitterId },
      relations: ['parent'],
    });

    // Calculate success factors
    const parentRetentionRate = this.calculateRetentionRate(parentBookings);
    const sitterCompletionRate = this.calculateCompletionRate(sitterBookings);
    const compatibilityScore = await this.calculateCompatibilityScore(sitterId, parentId);
    const timeSlotSuccessRate = this.calculateTimeSlotSuccessRate(bookingData.schedule);

    // Weighted prediction
    const successProbability = (
      parentRetentionRate * 0.3 +
      sitterCompletionRate * 0.3 +
      compatibilityScore * 0.25 +
      timeSlotSuccessRate * 0.15
    );

    return Math.min(successProbability, 0.95); // Cap at 95%
  }

  /**
   * Generate smart rebooking suggestions
   */
  async getRebookingSuggestions(parentId: string): Promise<any[]> {
    const pastBookings = await this.bookingRepository.find({
      where: { parentId, status: BookingStatus.COMPLETED },
      relations: ['sitter'],
      order: { createdAt: 'DESC' },
      take: 10,
    });

    return pastBookings.map(booking => ({
      sitterId: booking.sitterId,
      sitterName: `${booking.sitter.firstName} ${booking.sitter.lastName}`,
      lastBookingDate: booking.createdAt,
      successRate: 0.9, // Placeholder
      recommendationScore: Math.random(),
    }));
  }

  /**
   * Dynamic pricing calculation
   */
  async calculateDynamicPricing(
    sitterId: string,
    location: { latitude: number; longitude: number },
    schedule: { startTime: Date; endTime: Date },
  ): Promise<number> {
    const sitter = await this.userRepository.findOne({ where: { id: sitterId } });
    if (!sitter) throw new Error('Sitter not found');

    // Base rate
    let baseRate = sitter.hourlyRate || 15;

    // Demand multiplier
    const demandMultiplier = await this.calculateDemandMultiplier(location, schedule);
    baseRate *= demandMultiplier;

    // Experience bonus
    const experienceBonus = this.calculateExperienceBonus(sitter);
    baseRate += experienceBonus;

    // Rating bonus
    const ratingBonus = this.calculateRatingBonus(sitter);
    baseRate += ratingBonus;

    // Time-based adjustments
    const timeAdjustment = this.calculateTimeAdjustment(schedule);
    baseRate *= timeAdjustment;

    return Math.round(baseRate * 100) / 100; // Round to 2 decimal places
  }

  // Private helper methods

  private async getAvailableSitters(criteria: MatchCriteria): Promise<User[]> {
    const { latitude, longitude } = criteria.location;

    // Calculate bounding box for efficient querying
    const latDelta = 10 / 69; // 10 miles per degree latitude
    const lonDelta = 10 / (69 * Math.cos(latitude * Math.PI / 180));

    return this.userRepository
      .createQueryBuilder('user')
      .where('user.userType = :userType', { userType: 'sitter' })
      .andWhere('user.status IN (:...statuses)', { 
        statuses: ['active', 'verified'] 
      })
      .andWhere('user.latitude BETWEEN :minLat AND :maxLat', {
        minLat: latitude - latDelta,
        maxLat: latitude + latDelta,
      })
      .andWhere('user.longitude BETWEEN :minLon AND :maxLon', {
        minLon: longitude - lonDelta,
        maxLon: longitude + lonDelta,
      })
      .andWhere('user.hourlyRate BETWEEN :minRate AND :maxRate', {
        minRate: criteria.budget.minRate,
        maxRate: criteria.budget.maxRate,
      })
      .getMany();
  }

  private async calculateMatchScore(sitter: User, criteria: MatchCriteria): Promise<MatchResult> {
    const factors = {
      location: this.calculateLocationScore(sitter, criteria.location),
      availability: await this.calculateAvailabilityScore(sitter, criteria.schedule),
      experience: this.calculateExperienceScore(sitter, criteria.preferences),
      rating: this.calculateRatingScore(sitter),
      price: this.calculatePriceScore(sitter, criteria.budget.maxRate),
      safety: await this.calculateSafetyScore(sitter),
      compatibility: await this.calculateCompatibilityScore(sitter.id, criteria.preferences),
    };

    // Weighted score calculation
    const score = (
      factors.location * 0.20 +
      factors.availability * 0.25 +
      factors.experience * 0.15 +
      factors.rating * 0.15 +
      factors.price * 0.10 +
      factors.safety * 0.10 +
      factors.compatibility * 0.05
    );

    const warnings = this.generateWarnings(sitter, criteria);
    const recommendations = this.generateRecommendations(sitter, criteria);

    return {
      sitter,
      score,
      factors,
      warnings,
      recommendations,
    };
  }

  private calculateRatingScore(sitter: User): number {
    if (!sitter.averageRating) return 0.5;
    return sitter.averageRating / 5;
  }

  private calculateTimeSlotSuccessRate(schedule: any): number {
    // In a real implementation, you'd analyze historical success rates for time slots
    return 0.8; // Placeholder
  }

  private calculateLocationScore(sitter: User, parentLocation: any): number {
    // In a real implementation, you'd calculate distance
    console.log('Location score calculation for sitter:', sitter.id);
    return 0.8; // Placeholder
  }

  private calculateAvailabilityScore(sitter: User, requiredSchedule: any): number {
    // In a real implementation, you'd check availability
    console.log('Availability score calculation for sitter:', sitter.id);
    return 0.9; // Placeholder
  }

  private calculateExperienceScore(sitter: User, preferences: any): number {
    // In a real implementation, you'd calculate based on skills and experience
    console.log('Experience score calculation for sitter:', sitter.id);
    return 0.8; // Placeholder
  }

  private calculatePriceScore(sitter: User, budget: number): number {
    if (!sitter.hourlyRate) return 0.5;
    const priceRatio = budget / sitter.hourlyRate;
    return Math.max(0, 1 - Math.abs(1 - priceRatio));
  }

  private calculateSafetyScore(sitter: User): number {
    // In a real implementation, you'd check safety credentials
    console.log('Safety score calculation for sitter:', sitter.id);
    return 0.9; // Placeholder
  }

  private calculateCompatibilityScore(sitterId: string, preferences: any): number {
    // In a real implementation, you'd calculate compatibility
    console.log('Compatibility score calculation for sitter:', sitterId);
    return 0.8; // Placeholder
  }

  async findMatches(preferences: any, limit: number = 10): Promise<any[]> {
    // In a real implementation, you'd implement sophisticated matching logic
    const sitters = await this.userRepository.find({
      where: { userType: 'sitter' },
      relations: ['sitterProfile'],
      take: limit,
    });

    return sitters.map(sitter => ({
      sitter,
      score: Math.random(), // Placeholder score
    }));
  }

  async recordMatchOutcome(sitterId: string, childId: string, success: boolean, rating?: number): Promise<void> {
    // In a real implementation, you'd record this for AI learning
    console.log(`Recording match outcome: sitter ${sitterId}, child ${childId}, success: ${success}, rating: ${rating}`);
  }

  private generateWarnings(sitter: User, criteria: MatchCriteria): string[] {
    const warnings: string[] = [];

    // Check verification status
    if (!sitter.emailVerified) {
      warnings.push('Email not verified');
    }

    if (!sitter.phoneVerified) {
      warnings.push('Phone not verified');
    }

    // Check experience level
    if (!sitter.experience || sitter.experience < 1) {
      warnings.push('Limited experience');
    }

    // Check rating
    if (!sitter.averageRating || sitter.averageRating < 3.0) {
      warnings.push('Low rating');
    }

    return warnings;
  }

  private generateRecommendations(sitter: User, criteria: MatchCriteria): string[] {
    const recommendations: string[] = [];
    
    // In a real implementation, you'd check sitter properties
    console.log('Generating recommendations for sitter:', sitter.id);
    recommendations.push('Consider booking for shorter sessions initially');
    
    return recommendations;
  }

  // Trust score calculation methods
  private calculateBackgroundCheckScore(sitter: User): number {
    // In a real implementation, you'd check background check status
    console.log('Background check score calculation for sitter:', sitter.id);
    return 0.8; // Placeholder
  }

  private calculateResponseRate(sitter: User, bookings: any[]): number {
    // In a real implementation, you'd calculate actual response rate
    console.log('Response rate calculation for sitter:', sitter.id);
    return 0.9; // Placeholder
  }

  private calculateCancellationRate(bookings: any[]): number {
    if (!bookings || bookings.length === 0) return 0;
    
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled');
    return cancelledBookings.length / bookings.length;
  }

  private calculateCompletionRate(bookings: any[]): number {
    if (!bookings || bookings.length === 0) return 0;
    
    const completedBookings = bookings.filter(b => b.status === 'completed');
    return completedBookings.length / bookings.length;
  }

  private calculateVerificationScore(sitter: User): number {
    let score = 0;
    
    if (sitter.emailVerified) score += 0.3;
    if (sitter.phoneVerified) score += 0.3;
    
    // In a real implementation, you'd check additional verifications
    console.log('Verification score calculation for sitter:', sitter.id);
    
    return Math.min(score, 1.0);
  }

  private determineRiskLevel(overallScore: number): 'low' | 'medium' | 'high' {
    if (overallScore >= 0.8) return 'low';
    if (overallScore >= 0.6) return 'medium';
    return 'high';
  }

  private generateTrustRecommendations(factors: any): string[] {
    const recommendations: string[] = [];
    
    if (factors.backgroundCheck < 1.0) {
      recommendations.push('Complete background check verification');
    }
    
    if (factors.responseRate < 0.8) {
      recommendations.push('Improve response rate to booking requests');
    }
    
    if (factors.cancellationRate > 0.1) {
      recommendations.push('Reduce booking cancellations');
    }
    
    if (factors.rating < 4.0) {
      recommendations.push('Focus on improving service quality');
    }
    
    return recommendations;
  }

  // Additional helper methods for advanced features
  private calculateRetentionRate(bookings: Booking[]): number {
    if (bookings.length === 0) return 0.5;
    
    const uniqueSitters = new Set(bookings.map(b => b.sitterId));
    return uniqueSitters.size / bookings.length;
  }

  private analyzeBookingPatterns(bookings: Booking[]): any[] {
    // Analyze booking patterns for rebooking suggestions
    const patterns: any[] = [];
    
    // Group by day of week and time
    const dayTimeGroups: any = {};
    
    bookings.forEach(booking => {
      const day = booking.startTime.getDay();
      const hour = booking.startTime.getHours();
      const key = `${day}-${hour}`;
      
      if (!dayTimeGroups[key]) {
        dayTimeGroups[key] = [];
      }
      dayTimeGroups[key].push(booking);
    });
    
    // Find most common patterns
    Object.entries(dayTimeGroups).forEach(([key, bookings]: [string, any]) => {
      if (bookings.length >= 2) {
        const [day, hour] = key.split('-');
        patterns.push({
          dayOfWeek: parseInt(day),
          hour: parseInt(hour),
          frequency: bookings.length,
          confidence: bookings.length / bookings.length,
        });
      }
    });
    
    return patterns;
  }

  private async findSittersForPattern(pattern: any): Promise<User[]> {
    // Find sitters available during the pattern time
    return this.userRepository
      .createQueryBuilder('user')
      .where('user.userType = :userType', { userType: 'sitter' })
      .andWhere('user.status IN (:...statuses)', { 
        statuses: ['active', 'verified'] 
      })
      .getMany();
  }

  private async calculateDemandMultiplier(location: any, schedule: any): Promise<number> {
    // Calculate demand based on location and time
    // This would integrate with external data in production
    return 1.0; // Base multiplier
  }

  private calculateExperienceBonus(sitter: User): number {
    // In a real implementation, you'd calculate based on skills and certifications
    console.log('Experience bonus calculation for sitter:', sitter.id);
    return 2.0; // Placeholder
  }

  private calculateRatingBonus(sitter: User): number {
    if (!sitter.averageRating) return 0;
    
    // Bonus for high ratings
    if (sitter.averageRating >= 4.8) return 2.0;
    if (sitter.averageRating >= 4.5) return 1.0;
    if (sitter.averageRating >= 4.0) return 0.5;
    
    return 0;
  }

  private calculateTimeAdjustment(schedule: any): number {
    const hour = schedule.startTime.getHours();
    
    // Peak hours (evening/weekend) get higher rates
    if (hour >= 18 || hour <= 8) return 1.2; // 20% premium
    if (hour >= 12 && hour <= 17) return 1.1; // 10% premium
    
    return 1.0; // Standard rate
  }
} 
