import { API_BASE_URL } from '../config/api';

export interface PaymentIntent {
  paymentIntentId: string;
  clientSecret: string;
  amount: number;
  platformFee: number;
  sitterPayout: number;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'card' | 'bank_transfer' | 'wallet';
  createdAt: Date;
  processedAt?: Date;
  stripePaymentIntentId?: string;
  stripeTransferId?: string;
}

export interface StripeConnectAccount {
  accountId: string;
  onboardingUrl: string;
}

export interface StripeConnectStatus {
  hasAccount: boolean;
  accountId?: string;
  status?: string;
  payoutsEnabled?: boolean;
  requirements?: any;
  onboardingUrl?: string;
}

export interface SitterEarnings {
  period: string;
  totalEarnings: number;
  platformFees: number;
  netEarnings: number;
  paymentCount: number;
  averagePerBooking: number;
}

export interface PayoutHistory {
  id: string;
  amount: number;
  currency: string;
  status: string;
  arrivalDate: Date;
  created: Date;
}

export interface PaymentMethod {
  id: string;
  type: string;
  last4?: string;
  brand?: string;
}

class PaymentService {
  private baseUrl = `${API_BASE_URL}/payments`;

  // Create payment intent for booking
  async createPaymentIntent(bookingId: string, paymentMethodId?: string): Promise<PaymentIntent> {
    const response = await fetch(`${this.baseUrl}/create-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
      body: JSON.stringify({
        bookingId,
        paymentMethodId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create payment intent');
    }

    return response.json();
  }

  // Process payment (capture funds)
  async processPayment(paymentIntentId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
      body: JSON.stringify({
        paymentIntentId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to process payment');
    }

    return response.json();
  }

  // Confirm payment (for session completion)
  async confirmPayment(paymentId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/${paymentId}/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to confirm payment');
    }

    return response.json();
  }

  // Refund payment
  async refundPayment(paymentId: string, reason?: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/${paymentId}/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
      body: JSON.stringify({
        reason,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refund payment');
    }

    return response.json();
  }

  // Get all payments for user
  async getPayments(filters?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ payments: Payment[]; total: number; page: number; limit: number; totalPages: number }> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await fetch(`${this.baseUrl}?${params}`, {
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch payments');
    }

    return response.json();
  }

  // Get specific payment
  async getPayment(paymentId: string): Promise<Payment> {
    const response = await fetch(`${this.baseUrl}/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch payment');
    }

    return response.json();
  }

  // Get payments for specific booking
  async getBookingPayments(bookingId: string): Promise<Payment[]> {
    const response = await fetch(`${this.baseUrl}/booking/${bookingId}`, {
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch booking payments');
    }

    return response.json();
  }

  // Create Stripe Connect account for sitter
  async createSitterConnectAccount(): Promise<StripeConnectAccount> {
    const response = await fetch(`${this.baseUrl}/sitter/connect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to create Stripe Connect account');
    }

    return response.json();
  }

  // Get sitter Stripe Connect status
  async getSitterConnectStatus(): Promise<StripeConnectStatus> {
    const response = await fetch(`${this.baseUrl}/sitter/connect/status`, {
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Stripe Connect status');
    }

    return response.json();
  }

  // Complete sitter onboarding
  async completeSitterOnboarding(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/sitter/connect/onboarding`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to complete onboarding');
    }

    return response.json();
  }

  // Request sitter payout
  async requestSitterPayout(amount: number): Promise<any> {
    const response = await fetch(`${this.baseUrl}/sitter/payout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
      body: JSON.stringify({
        amount,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to request payout');
    }

    return response.json();
  }

  // Get sitter earnings
  async getSitterEarnings(period: string = 'month'): Promise<SitterEarnings> {
    const response = await fetch(`${this.baseUrl}/sitter/earnings?period=${period}`, {
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch earnings');
    }

    return response.json();
  }

  // Get sitter payout history
  async getSitterPayouts(): Promise<PayoutHistory[]> {
    const response = await fetch(`${this.baseUrl}/sitter/payouts`, {
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch payout history');
    }

    return response.json();
  }

  // Add payment method for parent
  async addParentPaymentMethod(token: string, type: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/parent/add-payment-method`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
      body: JSON.stringify({
        token,
        type,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to add payment method');
    }

    return response.json();
  }

  // Get parent payment methods
  async getParentPaymentMethods(): Promise<PaymentMethod[]> {
    const response = await fetch(`${this.baseUrl}/parent/payment-methods`, {
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch payment methods');
    }

    return response.json();
  }

  // Remove parent payment method
  async removeParentPaymentMethod(methodId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/parent/payment-methods/${methodId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to remove payment method');
    }

    return response.json();
  }

  private getAuthToken(): string {
    // Get token from secure storage or Redux store
    // This should be implemented based on your auth setup
    return '';
  }
}

export const paymentService = new PaymentService(); 