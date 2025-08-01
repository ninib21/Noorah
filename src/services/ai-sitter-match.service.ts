import { Platform } from 'react-native';

export interface SitterProfile {
  id: string;
  name: string;
  rating: number;
  experience: number; // years
  age: number;
  languages: string[];
  skills: string[];
  availability: {
    days: string[];
    hours: {
      start: string;
      end: string;
    };
  };
  temperament: {
    energy: number; // 1-10
    patience: number; // 1-10
    creativity: number; // 1-10
    discipline: number; // 1-10
    empathy: number; // 1-10
  };
  preferences: {
    ageGroups: string[];
    specialNeeds: string[];
    activities: string[];
  };
  location: {
    latitude: number;
    longitude: number;
    radius: number; // km
  };
  hourlyRate: number;
  verified: boolean;
  backgroundCheck: boolean;
  responseTime: number; // average minutes
  completionRate: number; // percentage
  totalBookings: number;
  lastActive: Date;
  ratingBreakdown: {
    reliability: number;
    communication: number;
    safety: number;
    fun: number;
    cleanliness: number;
  };
}

export interface ChildProfile {
  id: string;
  name: string;
  age: number;
  temperament: {
    energy: number; // 1-10
    shyness: number; // 1-10
    independence: number; // 1-10
    curiosity: number; // 1-10
    sensitivity: number; // 1-10
  };
  interests: string[];
  specialNeeds: string[];
  allergies: string[];
  schedule: {
    bedtime: string;
    naptime: string;
    mealTimes: string[];
  };
  previousSitters: string[]; // sitter IDs
  preferences: {
    activities: string[];
    communication: string[];
  };
  location: {
    latitude: number;
    longitude: number;
  };
}

export interface ParentPreferences {
  budget: {
    min: number;
    max: number;
  };
  location: {
    latitude: number;
    longitude: number;
    maxDistance: number; // km
  };
  schedule: {
    date: string;
    startTime: string;
    endTime: string;
    duration: number; // hours
  };
  requirements: {
    languages: string[];
    skills: string[];
    experience: number;
    verified: boolean;
    backgroundCheck: boolean;
  };
  priorities: {
    safety: number; // 1-10
    experience: number; // 1-10
    cost: number; // 1-10
    availability: number; // 1-10
    personality: number; // 1-10
  };
  urgency: 'low' | 'medium' | 'high';
}

export interface MatchScore {
  sitterId: string;
  overallScore: number; // 0-100
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
  distance: number; // km
  estimatedResponseTime: number; // minutes
  compatibilityScore: number; // 0-100
}

class AISitterMatchService {
  private sitters: SitterProfile[] = [];
  private children: ChildProfile[] = [];
  private matchHistory: Map<string, number> = new Map(); // sitterId -> success rate
  private locationCache: Map<string, number> = new Map(); // location pair -> distance

  /**
   * Initialize the AI matching service
   */
  async initialize(): Promise<void> {
    try {
      // Load sitter profiles from database
      await this.loadSitterProfiles();
      
      // Load child profiles
      await this.loadChildProfiles();
      
      // Load match history
      await this.loadMatchHistory();
      
      console.log('AI Sitter Match service initialized');
    } catch (error) {
      console.error('Failed to initialize AI Sitter Match service:', error);
      throw error;
    }
  }

  /**
   * Find the best sitters for a specific request (Enhanced for MVP)
   */
  async findBestMatches(
    childId: string,
    parentPreferences: ParentPreferences,
    limit: number = 10
  ): Promise<MatchScore[]> {
    try {
      const child = this.children.find(c => c.id === childId);
      if (!child) {
        throw new Error('Child profile not found');
      }

      // Get available sitters with enhanced filtering
      const availableSitters = await this.getAvailableSitters(parentPreferences, child);
      const matches: MatchScore[] = [];

      for (const sitter of availableSitters) {
        const score = await this.calculateMatchScore(child, sitter, parentPreferences);
        matches.push(score);
      }

      // Sort by overall score (descending)
      matches.sort((a, b) => b.overallScore - a.overallScore);

      // Apply AI learning from previous matches
      const enhancedMatches = await this.applyLearning(matches, childId);

      // Apply urgency-based adjustments
      const urgencyAdjustedMatches = this.applyUrgencyAdjustments(enhancedMatches, parentPreferences.urgency);

      return urgencyAdjustedMatches.slice(0, limit);
    } catch (error) {
      console.error('Error finding matches:', error);
      throw error;
    }
  }

  /**
   * Enhanced match score calculation
   */
  private async calculateMatchScore(
    child: ChildProfile,
    sitter: SitterProfile,
    preferences: ParentPreferences
  ): Promise<MatchScore> {
    const distance = this.calculateDistance(
      child.location.latitude,
      child.location.longitude,
      sitter.location.latitude,
      sitter.location.longitude
    );

    const breakdown = {
      temperament: this.calculateTemperamentScore(child, sitter),
      availability: this.calculateAvailabilityScore(sitter, preferences),
      location: this.calculateLocationScore(sitter, preferences, distance),
      experience: this.calculateExperienceScore(sitter, preferences),
      cost: this.calculateCostScore(sitter, preferences),
      safety: this.calculateSafetyScore(sitter, preferences),
      communication: this.calculateCommunicationScore(sitter),
      rating: this.calculateRatingScore(sitter),
    };

    const overallScore = this.calculateOverallScore(breakdown, preferences.priorities);
    const reasons = this.generateMatchReasons(breakdown, child, sitter);
    const warnings = this.generateWarnings(breakdown, child, sitter);
    const compatibilityScore = this.calculateCompatibilityScore(child, sitter);

    return {
      sitterId: sitter.id,
      overallScore,
      breakdown,
      reasons,
      warnings,
      distance,
      estimatedResponseTime: sitter.responseTime,
      compatibilityScore,
    };
  }

  /**
   * Enhanced temperament compatibility score
   */
  private calculateTemperamentScore(child: ChildProfile, sitter: SitterProfile): number {
    let score = 0;
    const maxScore = 50;

    // Energy level compatibility (complementary matching)
    const energyDiff = Math.abs(child.temperament.energy - sitter.temperament.energy);
    if (energyDiff <= 2) {
      score += 15; // High compatibility
    } else if (energyDiff <= 4) {
      score += 10; // Medium compatibility
    } else {
      score += 5; // Low compatibility
    }

    // Patience for shy children
    if (child.temperament.shyness > 7) {
      score += Math.min(15, sitter.temperament.patience * 1.5);
    }

    // Creativity for curious children
    if (child.temperament.curiosity > 7) {
      score += Math.min(10, sitter.temperament.creativity * 1.2);
    }

    // Empathy for sensitive children
    if (child.temperament.sensitivity > 7) {
      score += Math.min(10, sitter.temperament.empathy * 1.2);
    }

    // Discipline for independent children
    if (child.temperament.independence > 7) {
      score += Math.min(10, sitter.temperament.discipline * 1.0);
    }

    return Math.min(maxScore, score);
  }

  /**
   * Calculate availability score
   */
  private calculateAvailabilityScore(sitter: SitterProfile, preferences: ParentPreferences): number {
    const { schedule } = preferences;
    const requestDay = new Date(schedule.date).toLocaleDateString('en-US', { weekday: 'long' });
    
    if (!sitter.availability.days.includes(requestDay)) {
      return 0;
    }

    const requestStart = new Date(`2000-01-01 ${schedule.startTime}`);
    const requestEnd = new Date(`2000-01-01 ${schedule.endTime}`);
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
   * Enhanced location score with distance weighting
   */
  private calculateLocationScore(sitter: SitterProfile, preferences: ParentPreferences, distance: number): number {
    if (distance <= preferences.location.maxDistance) {
      // Exponential decay based on distance
      const distanceRatio = distance / preferences.location.maxDistance;
      const score = 100 * Math.exp(-2 * distanceRatio);
      return Math.max(50, score);
    }
    return 0;
  }

  /**
   * Calculate experience score
   */
  private calculateExperienceScore(sitter: SitterProfile, preferences: ParentPreferences): number {
    if (sitter.experience >= preferences.requirements.experience) {
      return Math.min(100, (sitter.experience / 10) * 100);
    }
    return Math.max(0, (sitter.experience / preferences.requirements.experience) * 100);
  }

  /**
   * Calculate cost score
   */
  private calculateCostScore(sitter: SitterProfile, preferences: ParentPreferences): number {
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
  private calculateSafetyScore(sitter: SitterProfile, preferences: ParentPreferences): number {
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
   * Enhanced rating score with breakdown analysis
   */
  private calculateRatingScore(sitter: SitterProfile): number {
    let score = sitter.rating * 20; // Base score from overall rating

    // Bonus for high individual category ratings
    const { ratingBreakdown } = sitter;
    if (ratingBreakdown.safety >= 4.5) score += 10;
    if (ratingBreakdown.communication >= 4.5) score += 5;
    if (ratingBreakdown.reliability >= 4.5) score += 5;

    // Bonus for high total bookings (experience indicator)
    if (sitter.totalBookings >= 50) score += 5;
    else if (sitter.totalBookings >= 20) score += 3;

    // Penalty for recent inactivity
    const daysSinceActive = (Date.now() - sitter.lastActive.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceActive > 30) score -= 10;
    else if (daysSinceActive > 14) score -= 5;

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Calculate compatibility score between child and sitter
   */
  private calculateCompatibilityScore(child: ChildProfile, sitter: SitterProfile): number {
    let score = 0;

    // Interest overlap
    const interestOverlap = child.interests.filter(interest => 
      sitter.preferences.activities.includes(interest)
    ).length;
    score += (interestOverlap / child.interests.length) * 30;

    // Age group compatibility
    const childAgeGroup = this.getAgeGroup(child.age);
    if (sitter.preferences.ageGroups.includes(childAgeGroup)) {
      score += 25;
    }

    // Special needs compatibility
    if (child.specialNeeds.length > 0) {
      const needsCoverage = child.specialNeeds.filter(need =>
        sitter.preferences.specialNeeds.includes(need)
      ).length;
      score += (needsCoverage / child.specialNeeds.length) * 25;
    }

    // Previous sitter relationship
    if (child.previousSitters.includes(sitter.id)) {
      score += 20;
    }

    return Math.min(100, score);
  }

  /**
   * Get age group for a child
   */
  private getAgeGroup(age: number): string {
    if (age < 1) return '0-1';
    if (age < 3) return '1-3';
    if (age < 6) return '3-5';
    if (age < 9) return '6-8';
    if (age < 12) return '9-12';
    return '12+';
  }

  /**
   * Apply urgency-based adjustments
   */
  private applyUrgencyAdjustments(matches: MatchScore[], urgency: string): MatchScore[] {
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
   * Enhanced match reasons generation
   */
  private generateMatchReasons(breakdown: any, child: ChildProfile, sitter: SitterProfile): string[] {
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
      reasons.push('Experienced with similar children');
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
    if (child.previousSitters.includes(sitter.id)) {
      reasons.push('Previously worked with your family');
    }

    return reasons;
  }

  /**
   * Enhanced warnings generation
   */
  private generateWarnings(breakdown: any, child: ChildProfile, sitter: SitterProfile): string[] {
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
   * Enhanced machine learning from previous matches
   */
  private async applyLearning(matches: MatchScore[], childId: string): Promise<MatchScore[]> {
    const child = this.children.find(c => c.id === childId);
    if (!child) return matches;

    // Adjust scores based on previous successful matches
    for (const match of matches) {
      const successRate = this.matchHistory.get(match.sitterId) || 0.5;
      const adjustment = (successRate - 0.5) * 20; // ±10 points
      match.overallScore = Math.max(0, Math.min(100, match.overallScore + adjustment));
    }

    // Re-sort after learning adjustments
    matches.sort((a, b) => b.overallScore - a.overallScore);

    return matches;
  }

  /**
   * Get available sitters based on preferences
   */
  private async getAvailableSitters(preferences: ParentPreferences, child: ChildProfile): Promise<SitterProfile[]> {
    return this.sitters.filter(sitter => {
      // Basic filtering
      if (sitter.hourlyRate > preferences.budget.max) return false;
      if (!sitter.verified && preferences.requirements.verified) return false;
      if (!sitter.backgroundCheck && preferences.requirements.backgroundCheck) return false;
      if (sitter.experience < preferences.requirements.experience) return false;

      // Language requirements
      const hasRequiredLanguages = preferences.requirements.languages.every(lang =>
        sitter.languages.includes(lang)
      );
      if (!hasRequiredLanguages) return false;

      // Distance filtering
      const distance = this.calculateDistance(
        child.location.latitude,
        child.location.longitude,
        sitter.location.latitude,
        sitter.location.longitude
      );
      if (distance > preferences.location.maxDistance) return false;

      // Availability filtering
      const requestDay = new Date(preferences.schedule.date).toLocaleDateString('en-US', { weekday: 'long' });
      if (!sitter.availability.days.includes(requestDay)) return false;

      // Recent activity check
      const daysSinceActive = (Date.now() - sitter.lastActive.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceActive > 60) return false; // Inactive for more than 2 months

      return true;
    });
  }

  /**
   * Calculate distance between two points (cached)
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const cacheKey = `${lat1},${lon1}-${lat2},${lon2}`;
    
    if (this.locationCache.has(cacheKey)) {
      return this.locationCache.get(cacheKey)!;
    }

    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    this.locationCache.set(cacheKey, distance);
    return distance;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Load sitter profiles (enhanced mock implementation)
   */
  private async loadSitterProfiles(): Promise<void> {
    this.sitters = [
      {
        id: 'sitter1',
        name: 'Sarah Johnson',
        rating: 4.9,
        experience: 5,
        age: 28,
        languages: ['English', 'Spanish'],
        skills: ['CPR', 'First Aid', 'Special Needs'],
        availability: {
          days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          hours: { start: '08:00', end: '20:00' },
        },
        temperament: {
          energy: 7,
          patience: 9,
          creativity: 8,
          discipline: 7,
          empathy: 9,
        },
        preferences: {
          ageGroups: ['3-5', '6-8', '9-12'],
          specialNeeds: ['ADHD', 'Autism'],
          activities: ['Arts', 'Outdoor', 'Educational'],
        },
        location: { latitude: 40.7128, longitude: -74.0060, radius: 10 },
        hourlyRate: 25,
        verified: true,
        backgroundCheck: true,
        responseTime: 3,
        completionRate: 98,
        totalBookings: 127,
        lastActive: new Date(),
        ratingBreakdown: {
          reliability: 4.9,
          communication: 4.8,
          safety: 5.0,
          fun: 4.7,
          cleanliness: 4.9,
        },
      },
      {
        id: 'sitter2',
        name: 'Michael Chen',
        rating: 4.7,
        experience: 3,
        age: 24,
        languages: ['English', 'Mandarin'],
        skills: ['CPR', 'First Aid'],
        availability: {
          days: ['Saturday', 'Sunday', 'Monday', 'Tuesday'],
          hours: { start: '10:00', end: '22:00' },
        },
        temperament: {
          energy: 8,
          patience: 7,
          creativity: 9,
          discipline: 6,
          empathy: 8,
        },
        preferences: {
          ageGroups: ['6-8', '9-12'],
          specialNeeds: [],
          activities: ['Sports', 'Gaming', 'Technology'],
        },
        location: { latitude: 40.7589, longitude: -73.9851, radius: 8 },
        hourlyRate: 22,
        verified: true,
        backgroundCheck: true,
        responseTime: 8,
        completionRate: 95,
        totalBookings: 89,
        lastActive: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        ratingBreakdown: {
          reliability: 4.6,
          communication: 4.8,
          safety: 4.7,
          fun: 4.9,
          cleanliness: 4.5,
        },
      },
      {
        id: 'sitter3',
        name: 'Emma Rodriguez',
        rating: 4.8,
        experience: 7,
        age: 32,
        languages: ['English', 'Spanish', 'French'],
        skills: ['CPR', 'First Aid', 'Special Needs', 'Early Childhood Education'],
        availability: {
          days: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
          hours: { start: '07:00', end: '19:00' },
        },
        temperament: {
          energy: 6,
          patience: 10,
          creativity: 7,
          discipline: 9,
          empathy: 10,
        },
        preferences: {
          ageGroups: ['0-1', '1-3', '3-5'],
          specialNeeds: ['ADHD', 'Autism', 'Down Syndrome'],
          activities: ['Educational', 'Arts', 'Music'],
        },
        location: { latitude: 40.7505, longitude: -73.9934, radius: 12 },
        hourlyRate: 30,
        verified: true,
        backgroundCheck: true,
        responseTime: 2,
        completionRate: 99,
        totalBookings: 203,
        lastActive: new Date(),
        ratingBreakdown: {
          reliability: 4.9,
          communication: 4.9,
          safety: 5.0,
          fun: 4.6,
          cleanliness: 4.8,
        },
      },
    ];
  }

  /**
   * Load child profiles (enhanced mock implementation)
   */
  private async loadChildProfiles(): Promise<void> {
    this.children = [
      {
        id: 'child1',
        name: 'Emma',
        age: 6,
        temperament: {
          energy: 8,
          shyness: 3,
          independence: 6,
          curiosity: 9,
          sensitivity: 4,
        },
        interests: ['Art', 'Science', 'Outdoor activities'],
        specialNeeds: [],
        allergies: ['Peanuts'],
        schedule: {
          bedtime: '20:00',
          naptime: '13:00',
          mealTimes: ['08:00', '12:00', '18:00'],
        },
        previousSitters: ['sitter1', 'sitter3'],
        preferences: {
          activities: ['Creative arts', 'Science experiments'],
          communication: ['Regular updates', 'Photos'],
        },
        location: {
          latitude: 40.7128,
          longitude: -74.0060,
        },
      },
      {
        id: 'child2',
        name: 'Lucas',
        age: 3,
        temperament: {
          energy: 6,
          shyness: 7,
          independence: 4,
          curiosity: 8,
          sensitivity: 6,
        },
        interests: ['Cars', 'Building blocks', 'Stories'],
        specialNeeds: ['ADHD'],
        allergies: [],
        schedule: {
          bedtime: '19:00',
          naptime: '12:00',
          mealTimes: ['07:30', '11:30', '17:30'],
        },
        previousSitters: ['sitter3'],
        preferences: {
          activities: ['Structured play', 'Quiet activities'],
          communication: ['Detailed reports', 'Behavior updates'],
        },
        location: {
          latitude: 40.7589,
          longitude: -73.9851,
        },
      },
    ];
  }

  /**
   * Load match history (enhanced mock implementation)
   */
  private async loadMatchHistory(): Promise<void> {
    this.matchHistory.set('sitter1', 0.95);
    this.matchHistory.set('sitter2', 0.87);
    this.matchHistory.set('sitter3', 0.92);
  }

  /**
   * Record match outcome for learning (enhanced)
   */
  async recordMatchOutcome(sitterId: string, childId: string, success: boolean, rating?: number): Promise<void> {
    const currentRate = this.matchHistory.get(sitterId) || 0.5;
    
    // Enhanced learning with rating consideration
    let learningRate = 0.1;
    if (rating) {
      learningRate = rating >= 4.5 ? 0.15 : rating >= 3.5 ? 0.1 : 0.05;
    }
    
    const newRate = currentRate * (1 - learningRate) + (success ? learningRate : 0);
    this.matchHistory.set(sitterId, newRate);
  }

  /**
   * Get sitter recommendations for a specific child (new method)
   */
  async getSitterRecommendations(childId: string, limit: number = 5): Promise<MatchScore[]> {
    const child = this.children.find(c => c.id === childId);
    if (!child) {
      throw new Error('Child profile not found');
    }

    const recommendations: MatchScore[] = [];

    for (const sitter of this.sitters) {
      const score = await this.calculateMatchScore(child, sitter, {
        budget: { min: 15, max: 50 },
        location: { latitude: child.location.latitude, longitude: child.location.longitude, maxDistance: 15 },
        schedule: { date: new Date().toISOString().split('T')[0], startTime: '18:00', endTime: '21:00', duration: 3 },
        requirements: { languages: ['English'], skills: [], experience: 1, verified: true, backgroundCheck: true },
        priorities: { safety: 8, experience: 7, cost: 6, availability: 8, personality: 7 },
        urgency: 'low',
      });
      recommendations.push(score);
    }

    return recommendations
      .sort((a, b) => b.overallScore - a.overallScore)
      .slice(0, limit);
  }
}

export default new AISitterMatchService(); 