import { API_BASE_URL } from '../config/api';

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

export interface AIBookingRecommendationRequest {
  userId: string;
  childId: string;
  timeframe: 'week' | 'month' | 'quarter';
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

export interface AIInsights {
  bookingPatterns: {
    preferredDays: Record<string, number>;
    preferredTimes: Record<string, number>;
    averageDuration: number;
    totalBookings: number;
    averageRating: number;
  };
  sitterPreferences: {
    preferredSitters: Record<string, number>;
    averageHourlyRate: number;
    preferredExperience: number;
    totalSpent: number;
  };
  satisfactionTrends: {
    averageRating: number;
    ratingTrend: 'improving' | 'declining' | 'stable';
    recentRatings: number[];
    olderRatings: number[];
  };
  recommendations: {
    nextBooking: {
      suggestedDate: string;
      suggestedTime: string;
      confidence: number;
      reasoning: string[];
    };
    seasonalOpportunities: Array<{
      event: string;
      suggestedBookings: number;
      reasoning: string[];
    }>;
  };
}

class AIService {
  private baseUrl = `${API_BASE_URL}/ai`;

  /**
   * Find best sitter matches using AI
   */
  async findSitterMatches(request: AISitterMatchRequest): Promise<AISitterMatchResponse[]> {
    try {
      const response = await fetch(`${this.baseUrl}/sitter-match`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`AI sitter match failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error finding sitter matches:', error);
      throw error;
    }
  }

  /**
   * Generate booking recommendations using AI
   */
  async generateBookingRecommendations(request: AIBookingRecommendationRequest): Promise<AIBookingRecommendationResponse[]> {
    try {
      const response = await fetch(`${this.baseUrl}/booking-recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`AI booking recommendations failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating booking recommendations:', error);
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
      const response = await fetch(`${this.baseUrl}/match-outcome`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify({
          sitterId,
          childId,
          success,
          rating,
        }),
      });

      if (!response.ok) {
        throw new Error(`Recording match outcome failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error recording match outcome:', error);
      throw error;
    }
  }

  /**
   * Record recommendation feedback for AI learning
   */
  async recordRecommendationFeedback(
    recommendationId: string,
    action: 'accepted' | 'rejected' | 'modified',
    feedback?: string
  ): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/recommendation-feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify({
          recommendationId,
          action,
          feedback,
        }),
      });

      if (!response.ok) {
        throw new Error(`Recording recommendation feedback failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error recording recommendation feedback:', error);
      throw error;
    }
  }

  /**
   * Get AI insights for current user
   */
  async getUserInsights(): Promise<AIInsights> {
    try {
      const response = await fetch(`${this.baseUrl}/insights`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Getting AI insights failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting AI insights:', error);
      throw error;
    }
  }

  /**
   * Get sitter recommendations for a specific child
   */
  async getSitterRecommendations(childId: string, limit: number = 5): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/sitter-recommendations/${childId}?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Getting sitter recommendations failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting sitter recommendations:', error);
      throw error;
    }
  }

  /**
   * Get auth token from storage
   */
  private getAuthToken(): string {
    // In a real implementation, this would get the token from secure storage
    // For now, return a placeholder
    return 'your-auth-token';
  }
}

export const aiService = new AIService(); 