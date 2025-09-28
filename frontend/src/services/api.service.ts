import { API_CONFIG, API_ENDPOINTS } from '../config/api';
import * as SecureStore from 'expo-secure-store';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

class ApiService {
  private baseUrl = API_CONFIG.baseURL;

  // Generic HTTP methods
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = await this.getAuthToken();
      
      const config: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
        ...options,
      };

      const response = await fetch(`${this.baseUrl}${endpoint}`, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error: any) {
      console.error(`API Error [${endpoint}]:`, error);
      return { 
        success: false, 
        error: error.message || 'An unexpected error occurred' 
      };
    }
  }

  // Authentication methods
  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    userType: 'parent' | 'sitter' | 'admin';
    phone?: string;
  }): Promise<ApiResponse> {
    return this.request(API_ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<ApiResponse> {
    return this.request(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async loginWithOTP(phone: string): Promise<ApiResponse> {
    return this.request(API_ENDPOINTS.AUTH.LOGIN_OTP, {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  }

  async verifyOTP(verificationId: string, code: string): Promise<ApiResponse> {
    return this.request(API_ENDPOINTS.AUTH.VERIFY_OTP, {
      method: 'POST',
      body: JSON.stringify({ verificationId, code }),
    });
  }

  async refreshToken(): Promise<ApiResponse> {
    return this.request(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {
      method: 'POST',
    });
  }

  async logout(): Promise<ApiResponse> {
    return this.request(API_ENDPOINTS.AUTH.LOGOUT, {
      method: 'POST',
    });
  }

  async getProfile(): Promise<ApiResponse> {
    return this.request(API_ENDPOINTS.AUTH.PROFILE);
  }

  async updateProfile(profileData: any): Promise<ApiResponse> {
    return this.request(API_ENDPOINTS.AUTH.PROFILE, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async changePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse> {
    return this.request(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
      method: 'POST',
      body: JSON.stringify(passwordData),
    });
  }

  async forgotPassword(email: string): Promise<ApiResponse> {
    return this.request(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<ApiResponse> {
    return this.request(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }

  async verifyEmail(token: string): Promise<ApiResponse> {
    return this.request(API_ENDPOINTS.AUTH.VERIFY_EMAIL, {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async resendVerification(): Promise<ApiResponse> {
    return this.request(API_ENDPOINTS.AUTH.CONFIRM_EMAIL, {
      method: 'POST',
    });
  }

  // Sitter methods
  async getSitters(filters?: {
    location?: string;
    availability?: string;
    skills?: string[];
    minRating?: number;
    maxRate?: number;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            params.append(key, value.join(','));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/v1/sitters?${queryString}` : '/api/v1/sitters';
    
    return this.request(endpoint);
  }

  async getSitter(id: string): Promise<ApiResponse> {
    return this.request(`/api/v1/sitters/${id}`);
  }

  async getSitterReviews(sitterId: string): Promise<ApiResponse> {
    return this.request(`/api/v1/sitters/${sitterId}/reviews`);
  }

  async getSitterAvailability(sitterId: string): Promise<ApiResponse> {
    return this.request(`/api/v1/sitters/${sitterId}/availability`);
  }

  async createSitterProfile(profileData: any): Promise<ApiResponse> {
    return this.request('/api/v1/sitters/profile', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  }

  async updateSitterProfile(profileData: any): Promise<ApiResponse> {
    return this.request('/api/v1/sitters/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async updateSitterAvailability(availability: any): Promise<ApiResponse> {
    return this.request('/api/v1/sitters/availability', {
      method: 'PUT',
      body: JSON.stringify(availability),
    });
  }

  async updateSitterStatus(status: string): Promise<ApiResponse> {
    return this.request('/api/v1/sitters/status', {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async getSitterEarnings(period: string = 'month'): Promise<ApiResponse> {
    return this.request(`/api/v1/sitters/earnings/summary?period=${period}`);
  }

  async getSitterStats(): Promise<ApiResponse> {
    return this.request('/api/v1/sitters/bookings/stats');
  }

  async requestBackgroundCheck(): Promise<ApiResponse> {
    return this.request('/api/v1/sitters/background-check/request', {
      method: 'POST',
    });
  }

  async getBackgroundCheckStatus(): Promise<ApiResponse> {
    return this.request('/api/v1/sitters/background-check/status');
  }

  async uploadCertification(file: any): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.request('/api/v1/sitters/certifications/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });
  }

  async getCertifications(): Promise<ApiResponse> {
    return this.request('/api/v1/sitters/certifications');
  }

  async deleteCertification(certId: string): Promise<ApiResponse> {
    return this.request(`/api/v1/sitters/certifications/${certId}`, {
      method: 'DELETE',
    });
  }

  async getNearbySitters(latitude: number, longitude: number, radius: number = 10): Promise<ApiResponse> {
    return this.request(`/api/v1/sitters/nearby?lat=${latitude}&lng=${longitude}&radius=${radius}`);
  }

  async getFeaturedSitters(): Promise<ApiResponse> {
    return this.request('/api/v1/sitters/featured');
  }

  // Booking methods
  async createBooking(bookingData: any): Promise<ApiResponse> {
    return this.request('/api/v1/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async getBookings(filters?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/v1/bookings?${queryString}` : '/api/v1/bookings';
    
    return this.request(endpoint);
  }

  async getBooking(id: string): Promise<ApiResponse> {
    return this.request(`/api/v1/bookings/${id}`);
  }

  async updateBooking(id: string, bookingData: any): Promise<ApiResponse> {
    return this.request(`/api/v1/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bookingData),
    });
  }

  async deleteBooking(id: string): Promise<ApiResponse> {
    return this.request(`/api/v1/bookings/${id}`, {
      method: 'DELETE',
    });
  }

  async confirmBooking(id: string): Promise<ApiResponse> {
    return this.request(`/api/v1/bookings/${id}/confirm`, {
      method: 'POST',
    });
  }

  async startBooking(id: string): Promise<ApiResponse> {
    return this.request(`/api/v1/bookings/${id}/start`, {
      method: 'POST',
    });
  }

  async completeBooking(id: string): Promise<ApiResponse> {
    return this.request(`/api/v1/bookings/${id}/complete`, {
      method: 'POST',
    });
  }

  async cancelBooking(id: string, reason?: string): Promise<ApiResponse> {
    return this.request(`/api/v1/bookings/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async checkInBooking(id: string, location?: { latitude: number; longitude: number }): Promise<ApiResponse> {
    return this.request(`/api/v1/bookings/${id}/check-in`, {
      method: 'POST',
      body: JSON.stringify({ location }),
    });
  }

  async checkOutBooking(id: string, location?: { latitude: number; longitude: number }): Promise<ApiResponse> {
    return this.request(`/api/v1/bookings/${id}/check-out`, {
      method: 'POST',
      body: JSON.stringify({ location }),
    });
  }

  async uploadBookingPhotos(id: string, photos: any[]): Promise<ApiResponse> {
    const formData = new FormData();
    photos.forEach((photo, index) => {
      formData.append(`photos[${index}]`, photo);
    });
    
    return this.request(`/api/v1/bookings/${id}/upload-photos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });
  }

  async addBookingExpense(id: string, expense: any): Promise<ApiResponse> {
    return this.request(`/api/v1/bookings/${id}/add-expense`, {
      method: 'POST',
      body: JSON.stringify(expense),
    });
  }

  async approveBookingExpense(id: string, expenseId: string): Promise<ApiResponse> {
    return this.request(`/api/v1/bookings/${id}/expenses/${expenseId}/approve`, {
      method: 'PUT',
    });
  }

  async sendEmergencyAlert(id: string, alertData: any): Promise<ApiResponse> {
    return this.request(`/api/v1/bookings/${id}/emergency-alert`, {
      method: 'POST',
      body: JSON.stringify(alertData),
    });
  }

  async getBookingChat(id: string): Promise<ApiResponse> {
    return this.request(`/api/v1/bookings/${id}/chat`);
  }

  async sendBookingMessage(id: string, message: string): Promise<ApiResponse> {
    return this.request(`/api/v1/bookings/${id}/chat`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  async getBookingActivities(id: string): Promise<ApiResponse> {
    return this.request(`/api/v1/bookings/${id}/activities`);
  }

  async addBookingActivity(id: string, activity: any): Promise<ApiResponse> {
    return this.request(`/api/v1/bookings/${id}/activities`, {
      method: 'POST',
      body: JSON.stringify(activity),
    });
  }

  async refundBooking(id: string, reason?: string): Promise<ApiResponse> {
    return this.request(`/api/v1/bookings/${id}/refund`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async disputeBooking(id: string, disputeData: any): Promise<ApiResponse> {
    return this.request(`/api/v1/bookings/${id}/dispute`, {
      method: 'POST',
      body: JSON.stringify(disputeData),
    });
  }

  async resolveDispute(id: string, disputeId: string, resolution: any): Promise<ApiResponse> {
    return this.request(`/api/v1/bookings/${id}/dispute/${disputeId}/resolve`, {
      method: 'PUT',
      body: JSON.stringify(resolution),
    });
  }

  // Payment methods
  async createPaymentIntent(bookingId: string, paymentMethodId?: string): Promise<ApiResponse> {
    return this.request('/api/v1/payments/create-payment-intent', {
      method: 'POST',
      body: JSON.stringify({ bookingId, paymentMethodId }),
    });
  }

  async processPayment(paymentIntentId: string): Promise<ApiResponse> {
    return this.request('/api/v1/payments/process-payment', {
      method: 'POST',
      body: JSON.stringify({ paymentIntentId }),
    });
  }

  async getPayments(filters?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/v1/payments?${queryString}` : '/api/v1/payments';
    
    return this.request(endpoint);
  }

  async refundPayment(paymentId: string, reason?: string): Promise<ApiResponse> {
    return this.request('/api/v1/payments/refund', {
      method: 'POST',
      body: JSON.stringify({ paymentId, reason }),
    });
  }

  async addPaymentMethod(paymentMethodData: any): Promise<ApiResponse> {
    return this.request('/api/v1/payments/payment-methods', {
      method: 'POST',
      body: JSON.stringify(paymentMethodData),
    });
  }

  async setDefaultPaymentMethod(methodId: string): Promise<ApiResponse> {
    return this.request(`/api/v1/payments/payment-methods/${methodId}/default`, {
      method: 'POST',
    });
  }

  async removePaymentMethod(methodId: string): Promise<ApiResponse> {
    return this.request(`/api/v1/payments/methods/${methodId}`, {
      method: 'DELETE',
    });
  }

  async getEarnings(period: string = 'month'): Promise<ApiResponse> {
    return this.request(`/api/v1/payments/earnings?period=${period}`);
  }

  async requestWithdrawal(amount: number): Promise<ApiResponse> {
    return this.request('/api/v1/payments/withdrawals', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }

  async getWithdrawals(): Promise<ApiResponse> {
    return this.request('/api/v1/payments/withdrawals');
  }

  // AI methods
  async getSitterMatch(criteria: any): Promise<ApiResponse> {
    return this.request('/api/v1/ai/sitter-match', {
      method: 'POST',
      body: JSON.stringify(criteria),
    });
  }

  async getBookingRecommendations(userId: string): Promise<ApiResponse> {
    return this.request('/api/v1/ai/booking-recommendations', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  async submitMatchOutcome(matchData: any): Promise<ApiResponse> {
    return this.request('/api/v1/ai/match-outcome', {
      method: 'POST',
      body: JSON.stringify(matchData),
    });
  }

  async submitRecommendationFeedback(feedback: any): Promise<ApiResponse> {
    return this.request('/api/v1/ai/recommendation-feedback', {
      method: 'POST',
      body: JSON.stringify(feedback),
    });
  }

  async getUserInsights(userId: string): Promise<ApiResponse> {
    return this.request(`/api/v1/ai/insights/${userId}`);
  }

  async getGeneralInsights(): Promise<ApiResponse> {
    return this.request('/api/v1/ai/insights');
  }

  async getSitterRecommendations(childId: string): Promise<ApiResponse> {
    return this.request(`/api/v1/ai/sitter-recommendations/${childId}`);
  }

  // Search methods
  async searchSitters(query: string, filters?: any): Promise<ApiResponse> {
    const params = new URLSearchParams({ q: query });
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            params.append(key, value.join(','));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }
    
    return this.request(`/api/v1/search/sitters?${params.toString()}`);
  }

  async getPopularSitters(): Promise<ApiResponse> {
    return this.request('/api/v1/search/sitters/popular');
  }


  // File upload methods
  async uploadFile(file: any, type: string = 'image'): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    return this.request('/api/v1/files/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });
  }

  async uploadImage(image: any): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append('image', image);
    
    return this.request('/api/v1/files/upload-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });
  }

  // Health check
  async healthCheck(): Promise<ApiResponse> {
    return this.request('/api/v1/health');
  }

  // Utility methods
  private async getAuthToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync('auth_token');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  async setAuthToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync('auth_token', token);
    } catch (error) {
      console.error('Error setting auth token:', error);
    }
  }

  async clearAuthToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync('auth_token');
    } catch (error) {
      console.error('Error clearing auth token:', error);
    }
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAuthToken();
    return !!token;
  }
}

export const apiService = new ApiService();
export default apiService;

