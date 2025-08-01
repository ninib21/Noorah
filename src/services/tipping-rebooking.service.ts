import { Platform } from 'react-native';

export interface Tip {
  id: string;
  sessionId: string;
  sitterId: string;
  parentId: string;
  amount: number;
  percentage: number; // Percentage of session cost
  message?: string;
  createdAt: Date;
  status: 'pending' | 'sent' | 'failed';
}

export interface RebookingRequest {
  id: string;
  parentId: string;
  childId: string;
  originalSitterId: string;
  reason: 'cancellation' | 'emergency' | 'preference' | 'schedule';
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  preferredTime: {
    start: string;
    end: string;
    date: string;
  };
  requirements: {
    languages: string[];
    skills: string[];
    experience: number;
    verified: boolean;
  };
  budget: {
    min: number;
    max: number;
  };
  location: {
    latitude: number;
    longitude: number;
    maxDistance: number;
  };
  createdAt: Date;
  status: 'pending' | 'searching' | 'found' | 'completed' | 'failed';
}

export interface BackupSitter {
  sitterId: string;
  name: string;
  rating: number;
  distance: number; // km
  availability: boolean;
  responseTime: number; // minutes
  hourlyRate: number;
  matchScore: number; // 0-100
  reasons: string[];
}

export interface TippingSettings {
  enabled: boolean;
  defaultPercentage: number;
  suggestedPercentages: number[];
  allowCustomAmount: boolean;
  maxTipPercentage: number;
  showTipHistory: boolean;
}

class TippingRebookingService {
  private tippingSettings: TippingSettings;
  private tips: Tip[] = [];
  private rebookingRequests: RebookingRequest[] = [];
  private backupSitters: BackupSitter[] = [];

  constructor() {
    this.tippingSettings = {
      enabled: true,
      defaultPercentage: 15,
      suggestedPercentages: [10, 15, 20, 25],
      allowCustomAmount: true,
      maxTipPercentage: 50,
      showTipHistory: true,
    };
  }

  /**
   * Calculate tip amount based on session cost and percentage
   */
  calculateTip(sessionCost: number, percentage: number): number {
    if (percentage > this.tippingSettings.maxTipPercentage) {
      percentage = this.tippingSettings.maxTipPercentage;
    }
    return Math.round((sessionCost * percentage) / 100);
  }

  /**
   * Add tip to a session
   */
  async addTip(
    sessionId: string,
    sitterId: string,
    parentId: string,
    amount: number,
    percentage: number,
    message?: string
  ): Promise<Tip> {
    try {
      const tip: Tip = {
        id: `tip_${Date.now()}`,
        sessionId,
        sitterId,
        parentId,
        amount,
        percentage,
        message,
        createdAt: new Date(),
        status: 'pending',
      };

      // Validate tip
      if (amount <= 0) {
        throw new Error('Tip amount must be greater than 0');
      }

      if (percentage > this.tippingSettings.maxTipPercentage) {
        throw new Error(`Tip percentage cannot exceed ${this.tippingSettings.maxTipPercentage}%`);
      }

      // Process tip payment
      await this.processTipPayment(tip);

      this.tips.push(tip);
      return tip;
    } catch (error) {
      console.error('Error adding tip:', error);
      throw error;
    }
  }

  /**
   * Process tip payment
   */
  private async processTipPayment(tip: Tip): Promise<void> {
    try {
      // Import and use payment service
      const paymentService = require('./stripe-payment.service').default;
      
      // Create tip payment intent
      await paymentService.createTipPayment(tip);
      
      tip.status = 'sent';
      console.log('Tip payment processed successfully');
    } catch (error) {
      tip.status = 'failed';
      console.error('Tip payment failed:', error);
      throw error;
    }
  }

  /**
   * Get tip history for a user
   */
  getTipHistory(userId: string, userType: 'parent' | 'sitter'): Tip[] {
    const field = userType === 'parent' ? 'parentId' : 'sitterId';
    return this.tips.filter(tip => tip[field] === userId);
  }

  /**
   * Get tip statistics
   */
  getTipStats(userId: string, userType: 'parent' | 'sitter'): {
    totalTips: number;
    averageTip: number;
    totalSessions: number;
    tipPercentage: number;
  } {
    const userTips = this.getTipHistory(userId, userType);
    
    if (userTips.length === 0) {
      return {
        totalTips: 0,
        averageTip: 0,
        totalSessions: 0,
        tipPercentage: 0,
      };
    }

    const totalTips = userTips.reduce((sum, tip) => sum + tip.amount, 0);
    const averageTip = totalTips / userTips.length;
    const uniqueSessions = new Set(userTips.map(tip => tip.sessionId)).size;

    return {
      totalTips,
      averageTip: Math.round(averageTip * 100) / 100,
      totalSessions: uniqueSessions,
      tipPercentage: Math.round((userTips.length / uniqueSessions) * 100),
    };
  }

  /**
   * Create rebooking request
   */
  async createRebookingRequest(
    parentId: string,
    childId: string,
    originalSitterId: string,
    reason: RebookingRequest['reason'],
    urgency: RebookingRequest['urgency'],
    preferredTime: RebookingRequest['preferredTime'],
    requirements: RebookingRequest['requirements'],
    budget: RebookingRequest['budget'],
    location: RebookingRequest['location']
  ): Promise<RebookingRequest> {
    try {
      const request: RebookingRequest = {
        id: `rebook_${Date.now()}`,
        parentId,
        childId,
        originalSitterId,
        reason,
        urgency,
        preferredTime,
        requirements,
        budget,
        location,
        createdAt: new Date(),
        status: 'pending',
      };

      this.rebookingRequests.push(request);

      // Start searching for backup sitters
      await this.searchBackupSitters(request);

      return request;
    } catch (error) {
      console.error('Error creating rebooking request:', error);
      throw error;
    }
  }

  /**
   * Search for backup sitters
   */
  private async searchBackupSitters(request: RebookingRequest): Promise<void> {
    try {
      request.status = 'searching';

      // Import AI matching service
      const aiMatchService = require('./ai-sitter-match.service').default;

      // Find available sitters
      const availableSitters = await this.findAvailableSitters(request);
      
      // Use AI to rank sitters
      const matches = await aiMatchService.findBestMatches(
        request.childId,
        {
          budget: request.budget,
          location: request.location,
          schedule: {
            date: request.preferredTime.date,
            startTime: request.preferredTime.start,
            endTime: request.preferredTime.end,
            duration: this.calculateDuration(request.preferredTime),
          },
          requirements: request.requirements,
          priorities: this.getPrioritiesByUrgency(request.urgency),
        },
        10
      );

      // Convert to backup sitters
      this.backupSitters = matches.map(match => ({
        sitterId: match.sitterId,
        name: `Sitter ${match.sitterId}`, // In real app, get from user service
        rating: 4.5, // Mock data
        distance: this.calculateDistance(
          request.location.latitude,
          request.location.longitude,
          40.7128, // Mock sitter location
          -74.0060
        ),
        availability: true,
        responseTime: 5,
        hourlyRate: 25,
        matchScore: match.overallScore,
        reasons: match.reasons,
      }));

      request.status = 'found';
      console.log(`Found ${this.backupSitters.length} backup sitters`);
    } catch (error) {
      request.status = 'failed';
      console.error('Error searching backup sitters:', error);
      throw error;
    }
  }

  /**
   * Get backup sitters for a request
   */
  getBackupSitters(requestId: string): BackupSitter[] {
    return this.backupSitters.sort((a, b) => b.matchScore - a.matchScore);
  }

  /**
   * Accept backup sitter
   */
  async acceptBackupSitter(requestId: string, sitterId: string): Promise<void> {
    try {
      const request = this.rebookingRequests.find(r => r.id === requestId);
      if (!request) {
        throw new Error('Rebooking request not found');
      }

      const backupSitter = this.backupSitters.find(s => s.sitterId === sitterId);
      if (!backupSitter) {
        throw new Error('Backup sitter not found');
      }

      // Create new booking with backup sitter
      await this.createBackupBooking(request, backupSitter);

      request.status = 'completed';
      console.log('Backup sitter accepted and booking created');
    } catch (error) {
      console.error('Error accepting backup sitter:', error);
      throw error;
    }
  }

  /**
   * Create backup booking
   */
  private async createBackupBooking(request: RebookingRequest, backupSitter: BackupSitter): Promise<void> {
    try {
      // Import booking service
      const bookingService = require('./booking.service').default;

      // Create new booking
      await bookingService.createBooking({
        parentId: request.parentId,
        sitterId: backupSitter.sitterId,
        childId: request.childId,
        startTime: request.preferredTime.start,
        endTime: request.preferredTime.end,
        date: request.preferredTime.date,
        location: request.location,
        requirements: request.requirements,
        isBackupBooking: true,
        originalBookingId: request.id,
      });

      console.log('Backup booking created successfully');
    } catch (error) {
      console.error('Error creating backup booking:', error);
      throw error;
    }
  }

  /**
   * Get rebooking requests for a user
   */
  getRebookingRequests(userId: string, userType: 'parent' | 'sitter'): RebookingRequest[] {
    const field = userType === 'parent' ? 'parentId' : 'sitterId';
    return this.rebookingRequests.filter(request => request[field] === userId);
  }

  /**
   * Calculate duration between start and end time
   */
  private calculateDuration(preferredTime: RebookingRequest['preferredTime']): number {
    const start = new Date(`2000-01-01 ${preferredTime.start}`);
    const end = new Date(`2000-01-01 ${preferredTime.end}`);
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60); // hours
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
    return Math.round(R * c * 10) / 10; // Round to 1 decimal place
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Get priorities based on urgency level
   */
  private getPrioritiesByUrgency(urgency: RebookingRequest['urgency']): any {
    switch (urgency) {
      case 'emergency':
        return {
          safety: 10,
          experience: 8,
          cost: 3,
          availability: 10,
          personality: 6,
        };
      case 'high':
        return {
          safety: 9,
          experience: 8,
          cost: 4,
          availability: 9,
          personality: 7,
        };
      case 'medium':
        return {
          safety: 8,
          experience: 7,
          cost: 6,
          availability: 8,
          personality: 8,
        };
      case 'low':
        return {
          safety: 7,
          experience: 6,
          cost: 8,
          availability: 7,
          personality: 9,
        };
      default:
        return {
          safety: 8,
          experience: 7,
          cost: 6,
          availability: 8,
          personality: 8,
        };
    }
  }

  /**
   * Find available sitters (mock implementation)
   */
  private async findAvailableSitters(request: RebookingRequest): Promise<any[]> {
    // In real implementation, this would query the database for available sitters
    // For now, return mock data
    return [
      {
        id: 'sitter1',
        name: 'Sarah Johnson',
        rating: 4.9,
        experience: 5,
        hourlyRate: 25,
        verified: true,
        backgroundCheck: true,
        languages: ['English', 'Spanish'],
        skills: ['CPR', 'First Aid'],
        location: { latitude: 40.7128, longitude: -74.0060 },
        availability: true,
      },
      {
        id: 'sitter2',
        name: 'Maria Garcia',
        rating: 4.7,
        experience: 3,
        hourlyRate: 22,
        verified: true,
        backgroundCheck: true,
        languages: ['English', 'Spanish'],
        skills: ['First Aid'],
        location: { latitude: 40.7589, longitude: -73.9851 },
        availability: true,
      },
    ];
  }

  /**
   * Update tipping settings
   */
  updateTippingSettings(newSettings: Partial<TippingSettings>): void {
    this.tippingSettings = { ...this.tippingSettings, ...newSettings };
  }

  /**
   * Get tipping settings
   */
  getTippingSettings(): TippingSettings {
    return { ...this.tippingSettings };
  }

  /**
   * Get service statistics
   */
  getServiceStats(): {
    totalTips: number;
    totalRebookingRequests: number;
    successfulRebookings: number;
    averageTipAmount: number;
  } {
    const totalTips = this.tips.reduce((sum, tip) => sum + tip.amount, 0);
    const successfulRebookings = this.rebookingRequests.filter(r => r.status === 'completed').length;
    const averageTipAmount = this.tips.length > 0 ? totalTips / this.tips.length : 0;

    return {
      totalTips,
      totalRebookingRequests: this.rebookingRequests.length,
      successfulRebookings,
      averageTipAmount: Math.round(averageTipAmount * 100) / 100,
    };
  }
}

export default new TippingRebookingService(); 