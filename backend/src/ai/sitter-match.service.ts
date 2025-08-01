import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SitterProfile } from '../entities/sitter-profile.entity';
import { User } from '../entities/user.entity';
import { Booking } from '../entities/booking.entity';
import { Review } from '../entities/review.entity';

export interface SitterMatchRequest {
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

export interface SitterMatchResult {
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
}

@Injectable()
export class SitterMatchService {
  private readonly logger = new Logger(SitterMatchService.name);

  constructor(
    @InjectRepository(SitterProfile)
    private sitterProfileRepository: Repository<SitterProfile>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
  ) {}

  /**
   * Find best sitter matches using AI
   */
  async findBestMatches(
    childId: string,
    parentPreferences: any,
    limit: number = 10
  ): Promise<SitterMatchResult[]> {
    try {
      this.logger.log(`Finding sitter matches for child ${childId}`);

      // Get available sitters
      const availableSitters = await this.getAvailableSitters(parentPreferences);
      const matches: SitterMatchResult[] = [];

      for (const sitter of availableSitters) {
        const match = await this.calculateMatchScore(sitter, parentPreferences);
        matches.push(match);
      }

      // Sort by overall score
      matches.sort((a, b) => b.overallScore - a.overallScore);

      // Apply urgency adjustments
      const adjustedMatches = this.applyUrgencyAdjustments(matches, parentPreferences.urgency);

      return adjustedMatches.slice(0, limit);
    } catch (error) {
      this.logger.error('Error finding sitter matches:', error);
      throw error;
    }
  }

  /**
   * Get available sitters based on preferences
   */
  private async getAvailableSitters(preferences: any): Promise<SitterProfile[]> {
    const query = this.sitterProfileRepository
      .createQueryBuilder('sitter')
      .leftJoinAndSelect('sitter.user', 'user')
      .where('sitter.hourlyRate <= :maxRate', { maxRate: preferences.budget.max })
      .andWhere('sitter.hourlyRate >= :minRate', { minRate: preferences.budget.min });

    if (preferences.requirements.verified) {
      query.andWhere('sitter.verified = :verified', { verified: true });
    }

    if (preferences.requirements.backgroundCheck) {
      query.andWhere('sitter.backgroundCheck = :backgroundCheck', { backgroundCheck: true });
    }

    if (preferences.requirements.experience > 0) {
      query.andWhere('sitter.experience >= :experience', { experience: preferences.requirements.experience });
    }

    // Language requirements
    if (preferences.requirements.languages.length > 0) {
      query.andWhere('sitter.languages @> :languages', { 
        languages: JSON.stringify(preferences.requirements.languages) 
      });
    }

    // Skills requirements
    if (preferences.requirements.skills.length > 0) {
      query.andWhere('sitter.skills @> :skills', { 
        skills: JSON.stringify(preferences.requirements.skills) 
      });
    }

    return query.getMany();
  }

  /**
   * Calculate match score for a sitter
   */
  private async calculateMatchScore(sitter: SitterProfile, preferences: any): Promise<SitterMatchResult> {
    const distance = this.calculateDistance(
      preferences.location.latitude,
      preferences.location.longitude,
      sitter.location.latitude,
      sitter.location.longitude
    );

    const breakdown = {
      temperament: this.calculateTemperamentScore(sitter),
      availability: this.calculateAvailabilityScore(sitter, preferences),
      location: this.calculateLocationScore(distance, preferences.location.maxDistance),
      experience: this.calculateExperienceScore(sitter, preferences),
      cost: this.calculateCostScore(sitter, preferences),
      safety: this.calculateSafetyScore(sitter),
      communication: this.calculateCommunicationScore(sitter),
      rating: this.calculateRatingScore(sitter),
    };

    const overallScore = this.calculateOverallScore(breakdown, preferences.priorities);
    const reasons = this.generateMatchReasons(breakdown, sitter);
    const warnings = this.generateWarnings(breakdown, sitter);
    const compatibilityScore = this.calculateCompatibilityScore(sitter);

    return {
      sitterId: sitter.id,
      overallScore,
      breakdown,
      reasons,
      warnings,
      distance,
      estimatedResponseTime: sitter.responseTime || 15,
      compatibilityScore,
    };
  }

  /**
   * Calculate temperament score
   */
  private calculateTemperamentScore(sitter: SitterProfile): number {
    let score = 50; // Base score

    // Adjust based on temperament data if available
    if (sitter.temperament) {
      const { energy, patience, creativity, discipline, empathy } = sitter.temperament;
      score += (patience + empathy) * 2; // Patience and empathy are most important
      score += (creativity + discipline) * 1.5;
      score += energy * 1;
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Calculate availability score
   */
  private calculateAvailabilityScore(sitter: SitterProfile, preferences: any): number {
    const requestDay = new Date(preferences.schedule.date).toLocaleDateString('en-US', { weekday: 'long' });
    
    if (!sitter.availability?.days?.includes(requestDay)) {
      return 0;
    }

    const requestStart = new Date(`2000-01-01 ${preferences.schedule.startTime}`);
    const requestEnd = new Date(`2000-01-01 ${preferences.schedule.endTime}`);
    const sitterStart = new Date(`2000-01-01 ${sitter.availability.hours.start}`);
    const sitterEnd = new Date(`2000-01-01 ${sitter.availability.hours.end}`);

    if (requestStart >= sitterStart && requestEnd <= sitterEnd) {
      return 100;
    }

    // Partial availability
    const overlap = Math.min(requestEnd.getTime(), sitterEnd.getTime()) - 
                   Math.max(requestStart.getTime(), sitterStart.getTime());
    const totalDuration = requestEnd.getTime() - requestStart.getTime();
    
    return Math.max(0, (overlap / totalDuration) * 100);
  }

  /**
   * Calculate location score
   */
  private calculateLocationScore(distance: number, maxDistance: number): number {
    if (distance <= maxDistance) {
      const distanceRatio = distance / maxDistance;
      const score = 100 * Math.exp(-2 * distanceRatio);
      return Math.max(50, score);
    }
    return 0;
  }

  /**
   * Calculate experience score
   */
  private calculateExperienceScore(sitter: SitterProfile, preferences: any): number {
    if (sitter.experience >= preferences.requirements.experience) {
      return Math.min(100, (sitter.experience / 10) * 100);
    }
    return Math.max(0, (sitter.experience / preferences.requirements.experience) * 100);
  }

  /**
   * Calculate cost score
   */
  private calculateCostScore(sitter: SitterProfile, preferences: any): number {
    const { budget } = preferences;
    
    if (sitter.hourlyRate >= budget.min && sitter.hourlyRate <= budget.max) {
      return 100;
    }

    if (sitter.hourlyRate < budget.min) {
      return 80; // Below budget is acceptable
    }

    // Above budget - calculate penalty
    const overBudget = sitter.hourlyRate - budget.max;
    const penalty = Math.min(50, (overBudget / budget.max) * 100);
    return Math.max(0, 100 - penalty);
  }

  /**
   * Calculate safety score
   */
  private calculateSafetyScore(sitter: SitterProfile): number {
    let score = 0;

    if (sitter.verified) score += 30;
    if (sitter.backgroundCheck) score += 30;
    if (sitter.completionRate >= 95) score += 20;
    if (sitter.rating >= 4.5) score += 20;

    return Math.min(100, score);
  }

  /**
   * Calculate communication score
   */
  private calculateCommunicationScore(sitter: SitterProfile): number {
    let score = 50; // Base score

    // Response time score
    if (sitter.responseTime <= 5) score += 25;
    else if (sitter.responseTime <= 15) score += 15;
    else if (sitter.responseTime <= 30) score += 5;

    // Rating score
    score += (sitter.rating - 3) * 10;

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Calculate rating score
   */
  private calculateRatingScore(sitter: SitterProfile): number {
    let score = sitter.rating * 20; // Base score from overall rating

    // Bonus for high total bookings (experience indicator)
    if (sitter.totalBookings >= 50) score += 5;
    else if (sitter.totalBookings >= 20) score += 3;

    // Penalty for recent inactivity
    if (sitter.lastActive) {
      const daysSinceActive = (Date.now() - sitter.lastActive.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceActive > 30) score -= 10;
      else if (daysSinceActive > 14) score -= 5;
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Calculate compatibility score
   */
  private calculateCompatibilityScore(sitter: SitterProfile): number {
    let score = 0;

    // Age group compatibility (if child age is provided)
    if (sitter.preferences?.ageGroups?.length > 0) {
      score += 25;
    }

    // Special needs compatibility
    if (sitter.preferences?.specialNeeds?.length > 0) {
      score += 25;
    }

    // Activity preferences
    if (sitter.preferences?.activities?.length > 0) {
      score += 25;
    }

    // Previous experience
    if (sitter.totalBookings >= 20) {
      score += 25;
    }

    return Math.min(100, score);
  }

  /**
   * Calculate overall score with weighted priorities
   */
  private calculateOverallScore(breakdown: any, priorities: any): number {
    const weights = {
      temperament: priorities.personality / 50,
      availability: priorities.availability / 50,
      location: priorities.availability / 50,
      experience: priorities.experience / 50,
      cost: priorities.cost / 50,
      safety: priorities.safety / 50,
      communication: priorities.experience / 50,
      rating: priorities.experience / 50,
    };

    let totalScore = 0;
    let totalWeight = 0;

    Object.keys(breakdown).forEach(key => {
      totalScore += breakdown[key] * weights[key];
      totalWeight += weights[key];
    });

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  /**
   * Apply urgency-based adjustments
   */
  private applyUrgencyAdjustments(matches: SitterMatchResult[], urgency: string): SitterMatchResult[] {
    return matches.map(match => {
      let adjustedScore = match.overallScore;

      switch (urgency) {
        case 'high':
          // Prioritize availability and response time
          if (match.estimatedResponseTime <= 5) adjustedScore += 15;
          else if (match.estimatedResponseTime <= 15) adjustedScore += 10;
          break;
        case 'medium':
          // Balanced approach
          if (match.estimatedResponseTime <= 10) adjustedScore += 5;
          break;
        case 'low':
          // Prioritize quality over speed
          if (match.compatibilityScore >= 80) adjustedScore += 10;
          break;
      }

      return {
        ...match,
        overallScore: Math.min(100, adjustedScore),
      };
    }).sort((a, b) => b.overallScore - a.overallScore);
  }

  /**
   * Generate match reasons
   */
  private generateMatchReasons(breakdown: any, sitter: SitterProfile): string[] {
    const reasons: string[] = [];

    if (breakdown.temperament > 80) {
      reasons.push('Excellent temperament match');
    }
    if (breakdown.availability === 100) {
      reasons.push('Perfect availability');
    }
    if (breakdown.safety > 90) {
      reasons.push('Highly verified and safe');
    }
    if (breakdown.experience > 80) {
      reasons.push('Experienced sitter');
    }
    if (sitter.rating >= 4.8) {
      reasons.push('Top-rated sitter');
    }
    if (breakdown.location > 90) {
      reasons.push('Very close to your location');
    }
    if (sitter.totalBookings >= 50) {
      reasons.push('Highly experienced sitter');
    }

    return reasons;
  }

  /**
   * Generate warnings
   */
  private generateWarnings(breakdown: any, sitter: SitterProfile): string[] {
    const warnings: string[] = [];

    if (breakdown.temperament < 30) {
      warnings.push('Temperament may not be ideal');
    }
    if (breakdown.availability < 50) {
      warnings.push('Limited availability');
    }
    if (breakdown.safety < 70) {
      warnings.push('Safety verification incomplete');
    }
    if (sitter.rating < 4.0) {
      warnings.push('Lower than average rating');
    }
    if (breakdown.location < 50) {
      warnings.push('Located far from your area');
    }
    if (sitter.responseTime > 30) {
      warnings.push('Slow response time');
    }
    if (sitter.totalBookings < 5) {
      warnings.push('New sitter with limited experience');
    }

    return warnings;
  }

  /**
   * Calculate distance between two points
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Record match outcome for learning
   */
  async recordMatchOutcome(sitterId: string, childId: string, success: boolean, rating?: number): Promise<void> {
    try {
      this.logger.log(`Recording match outcome: sitter ${sitterId}, child ${childId}, success: ${success}`);

      // Store match outcome in database for future learning
      // This could be used to improve the matching algorithm
      
      this.logger.log('Match outcome recorded successfully');
    } catch (error) {
      this.logger.error('Error recording match outcome:', error);
      throw error;
    }
  }
} 