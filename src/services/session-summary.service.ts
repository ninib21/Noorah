import { Platform } from 'react-native';

export interface SessionEvent {
  id: string;
  timestamp: Date;
  type: 'check_in' | 'check_out' | 'activity' | 'meal' | 'nap' | 'bathroom' | 'emergency' | 'location_change' | 'photo' | 'note';
  title: string;
  description: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  data?: any;
  sitterId: string;
}

export interface SitterNote {
  id: string;
  timestamp: Date;
  category: 'general' | 'behavior' | 'health' | 'activities' | 'concerns' | 'highlights';
  title: string;
  content: string;
  importance: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  sitterId: string;
}

export interface SessionSummary {
  id: string;
  sessionId: string;
  childId: string;
  sitterId: string;
  parentId: string;
  startTime: Date;
  endTime: Date;
  duration: number; // minutes
  totalDistance: number; // km
  events: SessionEvent[];
  notes: SitterNote[];
  activities: {
    indoor: string[];
    outdoor: string[];
    educational: string[];
    creative: string[];
  };
  meals: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
    snacks: string[];
  };
  naps: {
    count: number;
    totalDuration: number; // minutes
    times: Date[];
  };
  mood: {
    overall: 'excellent' | 'good' | 'okay' | 'challenging' | 'difficult';
    changes: Array<{
      time: Date;
      mood: string;
      reason?: string;
    }>;
  };
  safety: {
    incidents: number;
    concerns: string[];
    emergencyContacts: boolean;
    locationTracking: boolean;
  };
  photos: Array<{
    id: string;
    url: string;
    timestamp: Date;
    description: string;
  }>;
  ratings: {
    parentRating?: number;
    sitterRating?: number;
    parentComment?: string;
    sitterComment?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface SummaryTemplate {
  id: string;
  name: string;
  sections: string[];
  isDefault: boolean;
  customFields: string[];
}

class SessionSummaryService {
  private summaries: SessionSummary[] = [];
  private templates: SummaryTemplate[] = [];

  constructor() {
    this.initializeTemplates();
  }

  /**
   * Initialize summary templates
   */
  private initializeTemplates(): void {
    this.templates = [
      {
        id: 'default',
        name: 'Standard Summary',
        sections: ['timeline', 'activities', 'meals', 'naps', 'mood', 'safety', 'notes'],
        isDefault: true,
        customFields: [],
      },
      {
        id: 'detailed',
        name: 'Detailed Report',
        sections: ['timeline', 'activities', 'meals', 'naps', 'mood', 'safety', 'notes', 'photos', 'location'],
        isDefault: false,
        customFields: ['weather', 'special_events', 'learning_objectives'],
      },
      {
        id: 'brief',
        name: 'Quick Summary',
        sections: ['timeline', 'activities', 'mood', 'notes'],
        isDefault: false,
        customFields: [],
      },
    ];
  }

  /**
   * Create session summary
   */
  async createSessionSummary(
    sessionId: string,
    childId: string,
    sitterId: string,
    parentId: string,
    startTime: Date,
    endTime: Date
  ): Promise<SessionSummary> {
    try {
      const summary: SessionSummary = {
        id: `summary_${Date.now()}`,
        sessionId,
        childId,
        sitterId,
        parentId,
        startTime,
        endTime,
        duration: this.calculateDuration(startTime, endTime),
        totalDistance: 0,
        events: [],
        notes: [],
        activities: {
          indoor: [],
          outdoor: [],
          educational: [],
          creative: [],
        },
        meals: {
          breakfast: false,
          lunch: false,
          dinner: false,
          snacks: [],
        },
        naps: {
          count: 0,
          totalDuration: 0,
          times: [],
        },
        mood: {
          overall: 'good',
          changes: [],
        },
        safety: {
          incidents: 0,
          concerns: [],
          emergencyContacts: true,
          locationTracking: true,
        },
        photos: [],
        ratings: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.summaries.push(summary);
      return summary;
    } catch (error) {
      console.error('Error creating session summary:', error);
      throw error;
    }
  }

  /**
   * Add event to session summary
   */
  async addEvent(
    summaryId: string,
    event: Omit<SessionEvent, 'id'>
  ): Promise<SessionEvent> {
    try {
      const summary = this.summaries.find(s => s.id === summaryId);
      if (!summary) {
        throw new Error('Session summary not found');
      }

      const newEvent: SessionEvent = {
        ...event,
        id: `event_${Date.now()}`,
      };

      summary.events.push(newEvent);
      summary.updatedAt = new Date();

      // Update summary based on event type
      await this.updateSummaryFromEvent(summary, newEvent);

      return newEvent;
    } catch (error) {
      console.error('Error adding event:', error);
      throw error;
    }
  }

  /**
   * Add sitter note to session summary
   */
  async addNote(
    summaryId: string,
    note: Omit<SitterNote, 'id'>
  ): Promise<SitterNote> {
    try {
      const summary = this.summaries.find(s => s.id === summaryId);
      if (!summary) {
        throw new Error('Session summary not found');
      }

      const newNote: SitterNote = {
        ...note,
        id: `note_${Date.now()}`,
      };

      summary.notes.push(newNote);
      summary.updatedAt = new Date();

      return newNote;
    } catch (error) {
      console.error('Error adding note:', error);
      throw error;
    }
  }

  /**
   * Update summary based on event
   */
  private async updateSummaryFromEvent(summary: SessionSummary, event: SessionEvent): Promise<void> {
    switch (event.type) {
      case 'activity':
        await this.updateActivities(summary, event);
        break;
      case 'meal':
        await this.updateMeals(summary, event);
        break;
      case 'nap':
        await this.updateNaps(summary, event);
        break;
      case 'location_change':
        await this.updateDistance(summary, event);
        break;
      case 'emergency':
        await this.updateSafety(summary, event);
        break;
    }
  }

  /**
   * Update activities section
   */
  private async updateActivities(summary: SessionSummary, event: SessionEvent): Promise<void> {
    const activityData = event.data;
    if (activityData) {
      if (activityData.category === 'indoor') {
        summary.activities.indoor.push(activityData.name);
      } else if (activityData.category === 'outdoor') {
        summary.activities.outdoor.push(activityData.name);
      } else if (activityData.category === 'educational') {
        summary.activities.educational.push(activityData.name);
      } else if (activityData.category === 'creative') {
        summary.activities.creative.push(activityData.name);
      }
    }
  }

  /**
   * Update meals section
   */
  private async updateMeals(summary: SessionSummary, event: SessionEvent): Promise<void> {
    const mealData = event.data;
    if (mealData) {
      if (mealData.type === 'breakfast') {
        summary.meals.breakfast = true;
      } else if (mealData.type === 'lunch') {
        summary.meals.lunch = true;
      } else if (mealData.type === 'dinner') {
        summary.meals.dinner = true;
      } else if (mealData.type === 'snack') {
        summary.meals.snacks.push(mealData.name);
      }
    }
  }

  /**
   * Update naps section
   */
  private async updateNaps(summary: SessionSummary, event: SessionEvent): Promise<void> {
    const napData = event.data;
    if (napData) {
      if (napData.action === 'start') {
        summary.naps.count++;
        summary.naps.times.push(event.timestamp);
      } else if (napData.action === 'end') {
        const duration = napData.duration || 0;
        summary.naps.totalDuration += duration;
      }
    }
  }

  /**
   * Update distance tracking
   */
  private async updateDistance(summary: SessionSummary, event: SessionEvent): Promise<void> {
    if (event.location && event.data?.previousLocation) {
      const distance = this.calculateDistance(
        event.data.previousLocation.latitude,
        event.data.previousLocation.longitude,
        event.location.latitude,
        event.location.longitude
      );
      summary.totalDistance += distance;
    }
  }

  /**
   * Update safety section
   */
  private async updateSafety(summary: SessionSummary, event: SessionEvent): Promise<void> {
    summary.safety.incidents++;
    if (event.data?.concern) {
      summary.safety.concerns.push(event.data.concern);
    }
  }

  /**
   * Get session summary by ID
   */
  getSessionSummary(summaryId: string): SessionSummary | null {
    return this.summaries.find(s => s.id === summaryId) || null;
  }

  /**
   * Get session summary by session ID
   */
  getSummaryBySessionId(sessionId: string): SessionSummary | null {
    return this.summaries.find(s => s.sessionId === sessionId) || null;
  }

  /**
   * Get summaries for a user
   */
  getUserSummaries(userId: string, userType: 'parent' | 'sitter'): SessionSummary[] {
    const field = userType === 'parent' ? 'parentId' : 'sitterId';
    return this.summaries.filter(s => s[field] === userId);
  }

  /**
   * Generate timeline from events
   */
  generateTimeline(summaryId: string): SessionEvent[] {
    const summary = this.getSessionSummary(summaryId);
    if (!summary) {
      return [];
    }

    return summary.events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  /**
   * Generate summary report
   */
  generateReport(summaryId: string, templateId: string = 'default'): any {
    const summary = this.getSessionSummary(summaryId);
    if (!summary) {
      throw new Error('Session summary not found');
    }

    const template = this.templates.find(t => t.id === templateId) || this.templates[0];
    const report: any = {
      summaryId: summary.id,
      sessionId: summary.sessionId,
      childId: summary.childId,
      sitterId: summary.sitterId,
      startTime: summary.startTime,
      endTime: summary.endTime,
      duration: summary.duration,
      sections: {},
    };

    // Generate sections based on template
    template.sections.forEach(section => {
      switch (section) {
        case 'timeline':
          report.sections.timeline = this.generateTimeline(summaryId);
          break;
        case 'activities':
          report.sections.activities = summary.activities;
          break;
        case 'meals':
          report.sections.meals = summary.meals;
          break;
        case 'naps':
          report.sections.naps = summary.naps;
          break;
        case 'mood':
          report.sections.mood = summary.mood;
          break;
        case 'safety':
          report.sections.safety = summary.safety;
          break;
        case 'notes':
          report.sections.notes = summary.notes;
          break;
        case 'photos':
          report.sections.photos = summary.photos;
          break;
        case 'location':
          report.sections.location = {
            totalDistance: summary.totalDistance,
            locationEvents: summary.events.filter(e => e.type === 'location_change'),
          };
          break;
      }
    });

    return report;
  }

  /**
   * Export summary as PDF
   */
  async exportAsPDF(summaryId: string, templateId: string = 'default'): Promise<string> {
    try {
      const report = this.generateReport(summaryId, templateId);
      
      // In a real implementation, this would generate a PDF
      // For now, we'll return a JSON string
      const pdfData = JSON.stringify(report, null, 2);
      
      console.log('PDF export generated for summary:', summaryId);
      return pdfData;
    } catch (error) {
      console.error('Error exporting PDF:', error);
      throw error;
    }
  }

  /**
   * Share summary with parent
   */
  async shareSummary(summaryId: string, parentId: string): Promise<void> {
    try {
      const summary = this.getSessionSummary(summaryId);
      if (!summary) {
        throw new Error('Session summary not found');
      }

      // In a real implementation, this would send the summary to the parent
      // via push notification, email, or in-app message
      
      console.log('Summary shared with parent:', parentId);
    } catch (error) {
      console.error('Error sharing summary:', error);
      throw error;
    }
  }

  /**
   * Add rating to summary
   */
  async addRating(
    summaryId: string,
    rating: number,
    comment: string,
    userType: 'parent' | 'sitter'
  ): Promise<void> {
    try {
      const summary = this.getSessionSummary(summaryId);
      if (!summary) {
        throw new Error('Session summary not found');
      }

      if (userType === 'parent') {
        summary.ratings.parentRating = rating;
        summary.ratings.parentComment = comment;
      } else {
        summary.ratings.sitterRating = rating;
        summary.ratings.sitterComment = comment;
      }

      summary.updatedAt = new Date();
      console.log('Rating added to summary:', summaryId);
    } catch (error) {
      console.error('Error adding rating:', error);
      throw error;
    }
  }

  /**
   * Get summary templates
   */
  getTemplates(): SummaryTemplate[] {
    return [...this.templates];
  }

  /**
   * Create custom template
   */
  createTemplate(template: Omit<SummaryTemplate, 'id'>): SummaryTemplate {
    const newTemplate: SummaryTemplate = {
      ...template,
      id: `template_${Date.now()}`,
    };

    this.templates.push(newTemplate);
    return newTemplate;
  }

  /**
   * Calculate duration between two dates
   */
  private calculateDuration(startTime: Date, endTime: Date): number {
    return Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
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
    return Math.round(R * c * 100) / 100; // Round to 2 decimal places
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Get summary statistics
   */
  getSummaryStats(userId: string, userType: 'parent' | 'sitter'): {
    totalSessions: number;
    totalDuration: number;
    averageSessionLength: number;
    totalDistance: number;
    averageRating: number;
  } {
    const userSummaries = this.getUserSummaries(userId, userType);
    
    if (userSummaries.length === 0) {
      return {
        totalSessions: 0,
        totalDuration: 0,
        averageSessionLength: 0,
        totalDistance: 0,
        averageRating: 0,
      };
    }

    const totalSessions = userSummaries.length;
    const totalDuration = userSummaries.reduce((sum, s) => sum + s.duration, 0);
    const totalDistance = userSummaries.reduce((sum, s) => sum + s.totalDistance, 0);
    
    const ratings = userSummaries
      .map(s => userType === 'parent' ? s.ratings.parentRating : s.ratings.sitterRating)
      .filter(r => r !== undefined) as number[];
    
    const averageRating = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 0;

    return {
      totalSessions,
      totalDuration,
      averageSessionLength: Math.round(totalDuration / totalSessions),
      totalDistance: Math.round(totalDistance * 100) / 100,
      averageRating: Math.round(averageRating * 10) / 10,
    };
  }
}

export default new SessionSummaryService(); 