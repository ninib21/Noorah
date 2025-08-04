import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum PaymentMethod {
  CARD = 'card',
  BANK_TRANSFER = 'bank_transfer',
  WALLET = 'wallet',
}

export interface CreatePaymentIntentDto {
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  bookingId: string;
  customerId?: string;
  description?: string;
}

export interface PaymentIntentResponse {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  clientSecret: string;
  last4?: string;
  brand?: string;
  createdAt: Date;
}

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-08-16',
    });
  }

  async createPaymentIntent(amount: number, currency: string = 'usd', paymentMethodId?: string): Promise<any> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency,
        payment_method: paymentMethodId,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      throw new BadRequestException(`Payment intent creation failed: ${error.message}`);
    }
  }

  async confirmPaymentIntent(paymentIntentId: string): Promise<PaymentIntentResponse> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

      if (!paymentIntent) {
        throw new NotFoundException('Payment intent not found');
      }

      // Get payment method details if available
      let last4: string | undefined;
      let brand: string | undefined;

      if (paymentIntent.payment_method) {
        const paymentMethodDetails = await this.stripe.paymentMethods.retrieve(
          paymentIntent.payment_method as string,
        );
        
        if (paymentMethodDetails.type === 'card' && paymentMethodDetails.card) {
          last4 = paymentMethodDetails.card.last4;
          brand = paymentMethodDetails.card.brand;
        }
      }

      return {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status as PaymentStatus,
        paymentMethod: 'card' as PaymentMethod, // Default assumption
        clientSecret: paymentIntent.client_secret!,
        last4,
        brand,
        createdAt: new Date(paymentIntent.created * 1000),
      };
    } catch (error) {
      console.error('Stripe payment intent confirmation error:', error);
      throw new BadRequestException('Failed to confirm payment intent');
    }
  }

  async createCustomer(email: string, name: string): Promise<Stripe.Customer> {
    try {
      return await this.stripe.customers.create({
        email,
        name,
      });
    } catch (error) {
      console.error('Stripe customer creation error:', error);
      throw new BadRequestException('Failed to create customer');
    }
  }

  async createConnectAccount(email: string, country: string = 'US'): Promise<any> {
    try {
      const account = await this.stripe.accounts.create({
        type: 'express',
        country,
        email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });

      // Create account link for onboarding
      const accountLink = await this.stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${this.configService.get<string>('FRONTEND_URL')}/sitter/onboarding`,
        return_url: `${this.configService.get<string>('FRONTEND_URL')}/sitter/dashboard`,
        type: 'account_onboarding',
      });

      return {
        accountId: account.id,
        onboardingUrl: accountLink.url,
        requirements: account.requirements,
      };
    } catch (error) {
      console.error('Stripe connect account creation error:', error);
      throw new BadRequestException('Failed to create connect account');
    }
  }

  async getConnectAccount(accountId: string): Promise<any> {
    try {
      const account = await this.stripe.accounts.retrieve(accountId);

      // Create account link for updates if needed
      let onboardingUrl: string | undefined;
      if (account.requirements?.currently_due?.length > 0) {
        const accountLink = await this.stripe.accountLinks.create({
          account: account.id,
          refresh_url: `${this.configService.get<string>('FRONTEND_URL')}/sitter/onboarding`,
          return_url: `${this.configService.get<string>('FRONTEND_URL')}/sitter/dashboard`,
          type: 'account_onboarding',
        });
        onboardingUrl = accountLink.url;
      }

      return {
        accountId: account.id,
        onboardingUrl,
        requirements: account.requirements,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        detailsSubmitted: account.details_submitted,
      };
    } catch (error) {
      console.error('Stripe connect account retrieval error:', error);
      throw new BadRequestException('Failed to retrieve connect account');
    }
  }

  async createTransfer(accountId: string, amount: number, currency: string = 'usd'): Promise<Stripe.Transfer> {
    try {
      return await this.stripe.transfers.create({
        amount,
        currency,
        destination: accountId,
      });
    } catch (error) {
      console.error('Stripe transfer creation error:', error);
      throw new BadRequestException('Failed to create transfer');
    }
  }

  async getPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]> {
    try {
      const paymentMethods = await this.stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });
      return paymentMethods.data;
    } catch (error) {
      console.error('Stripe payment methods retrieval error:', error);
      throw new BadRequestException('Failed to retrieve payment methods');
    }
  }

  async attachPaymentMethod(paymentMethodId: string, customerId: string): Promise<Stripe.PaymentMethod> {
    try {
      return await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });
    } catch (error) {
      console.error('Stripe payment method attachment error:', error);
      throw new BadRequestException('Failed to attach payment method');
    }
  }

  async detachPaymentMethod(paymentMethodId: string): Promise<Stripe.PaymentMethod> {
    try {
      return await this.stripe.paymentMethods.detach(paymentMethodId);
    } catch (error) {
      console.error('Stripe payment method detachment error:', error);
      throw new BadRequestException('Failed to detach payment method');
    }
  }

  async processPayment(userId: string, paymentIntentId: string): Promise<any> {
    // This would need to be implemented with Stripe
    console.log(`Processing payment for user ${userId}: ${paymentIntentId}`);
    return { status: 'processed', paymentIntentId };
  }

  async confirmPayment(paymentId: string, userId: string): Promise<any> {
    // This would need to be implemented with Stripe
    console.log(`Confirming payment ${paymentId} for user ${userId}`);
    return { status: 'confirmed', paymentId };
  }

  async refundPayment(paymentId: string, userId: string, reason: string): Promise<any> {
    // This would need to be implemented with Stripe
    console.log(`Refunding payment ${paymentId} for user ${userId}: ${reason}`);
    return { status: 'refunded', paymentId, reason };
  }

  async getPayments(userId: string, filters: any): Promise<any> {
    // This would need to be implemented based on your payment structure
    return { payments: [], total: 0 };
  }

  async getPayment(paymentId: string, userId: string): Promise<any> {
    // This would need to be implemented based on your payment structure
    return { id: paymentId, userId, status: 'completed' };
  }

  async getBookingPayments(bookingId: string, userId: string): Promise<any> {
    // This would need to be implemented based on your payment structure
    return { payments: [] };
  }

  async handleStripeWebhook(payload: any, headers: any): Promise<any> {
    // This would need to be implemented with Stripe webhook handling
    console.log('Handling Stripe webhook:', payload);
    return { received: true };
  }

  async createSitterConnectAccount(userId: string): Promise<any> {
    // This would need to be implemented with Stripe Connect
    console.log(`Creating Connect account for user ${userId}`);
    return { accountId: 'mock-account-id' };
  }

  async getSitterConnectStatus(userId: string): Promise<any> {
    // This would need to be implemented with Stripe Connect
    return { status: 'active', accountId: 'mock-account-id' };
  }

  async completeSitterOnboarding(userId: string): Promise<any> {
    // This would need to be implemented with Stripe Connect
    return { status: 'completed' };
  }

  async requestSitterPayout(userId: string, amount: number): Promise<any> {
    // This would need to be implemented with Stripe Connect
    console.log(`Requesting payout for user ${userId}: ${amount}`);
    return { payoutId: 'mock-payout-id', amount };
  }

  async getSitterEarnings(userId: string, period: string): Promise<any> {
    // This would need to be implemented based on your payment structure
    return { earnings: 0, period };
  }

  async getSitterPayouts(userId: string): Promise<any> {
    // This would need to be implemented based on your payment structure
    return { payouts: [] };
  }

  async addParentPaymentMethod(userId: string, paymentMethodData: any): Promise<any> {
    // This would need to be implemented with Stripe
    console.log(`Adding payment method for user ${userId}:`, paymentMethodData);
    return { paymentMethodId: 'mock-payment-method-id' };
  }

  async getParentPaymentMethods(userId: string): Promise<any> {
    // This would need to be implemented with Stripe
    return { paymentMethods: [] };
  }

  async removeParentPaymentMethod(userId: string, methodId: string): Promise<any> {
    // This would need to be implemented with Stripe
    console.log(`Removing payment method ${methodId} for user ${userId}`);
    return { removed: true };
  }
} 