import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { Payment, PaymentStatus, PaymentMethod } from '../entities/payment.entity';
import { Booking } from '../entities/booking.entity';
import { User } from '../entities/user.entity';
import { SitterProfile } from '../entities/sitter-profile.entity';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(SitterProfile)
    private sitterProfileRepository: Repository<SitterProfile>,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });
  }

  // Create payment intent for booking
  async createPaymentIntent(userId: string, bookingId: string, paymentMethodId?: string) {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ['parent', 'sitter', 'sitter.sitterProfile'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.parent.id !== userId) {
      throw new BadRequestException('You can only create payments for your own bookings');
    }

    if (!booking.sitter.sitterProfile?.stripeAccountId) {
      throw new BadRequestException('Sitter has not completed Stripe Connect setup');
    }

    const amount = Math.round(booking.totalAmount * 100); // Convert to cents
    const platformFee = Math.round(booking.platformFee * 100);

    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        application_fee_amount: platformFee,
        transfer_data: {
          destination: booking.sitter.sitterProfile.stripeAccountId,
        },
        metadata: {
          booking_id: bookingId,
          parent_id: userId,
          sitter_id: booking.sitter.id,
        },
        payment_method: paymentMethodId,
        confirm: false,
        capture_method: 'manual', // Hold funds until session completion
      });

      // Create payment record
      const payment = this.paymentRepository.create({
        bookingId,
        stripePaymentIntentId: paymentIntent.id,
        amount: booking.totalAmount,
        currency: 'usd',
        status: PaymentStatus.PENDING,
        paymentMethod: PaymentMethod.CARD,
        metadata: {
          platformFee: booking.platformFee,
          sitterPayout: booking.sitterPayout,
        },
      });

      await this.paymentRepository.save(payment);

      return {
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount: booking.totalAmount,
        platformFee: booking.platformFee,
        sitterPayout: booking.sitterPayout,
      };
    } catch (error) {
      throw new BadRequestException(`Payment intent creation failed: ${error.message}`);
    }
  }

  // Process payment (capture funds)
  async processPayment(userId: string, paymentIntentId: string) {
    const payment = await this.paymentRepository.findOne({
      where: { stripePaymentIntentId: paymentIntentId },
      relations: ['booking', 'booking.parent'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.booking.parent.id !== userId) {
      throw new BadRequestException('You can only process your own payments');
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.capture(paymentIntentId);

      payment.status = PaymentStatus.COMPLETED;
      payment.processedAt = new Date();
      payment.paymentDetails = {
        last4: paymentIntent.charges.data[0]?.payment_method_details?.card?.last4,
        brand: paymentIntent.charges.data[0]?.payment_method_details?.card?.brand,
      };

      await this.paymentRepository.save(payment);

      return {
        success: true,
        paymentId: payment.id,
        amount: payment.amount,
        status: payment.status,
      };
    } catch (error) {
      payment.status = PaymentStatus.FAILED;
      payment.failedAt = new Date();
      payment.failureReason = error.message;
      await this.paymentRepository.save(payment);

      throw new BadRequestException(`Payment processing failed: ${error.message}`);
    }
  }

  // Confirm payment (for session completion)
  async confirmPayment(paymentId: string, userId: string) {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['booking', 'booking.parent', 'booking.sitter', 'booking.sitter.sitterProfile'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.booking.parent.id !== userId) {
      throw new BadRequestException('You can only confirm your own payments');
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException('Payment must be completed before confirmation');
    }

    try {
      // Transfer funds to sitter
      const transfer = await this.stripe.transfers.create({
        amount: Math.round(payment.booking.sitterPayout * 100),
        currency: 'usd',
        destination: payment.booking.sitter.sitterProfile.stripeAccountId,
        metadata: {
          booking_id: payment.booking.id,
          payment_id: payment.id,
        },
      });

      payment.stripeTransferId = transfer.id;
      payment.status = PaymentStatus.COMPLETED;
      await this.paymentRepository.save(payment);

      return {
        success: true,
        transferId: transfer.id,
        amount: payment.booking.sitterPayout,
      };
    } catch (error) {
      throw new BadRequestException(`Transfer failed: ${error.message}`);
    }
  }

  // Refund payment
  async refundPayment(paymentId: string, userId: string, reason?: string) {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['booking', 'booking.parent'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.booking.parent.id !== userId) {
      throw new BadRequestException('You can only refund your own payments');
    }

    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: payment.stripePaymentIntentId,
        reason: 'requested_by_customer',
        metadata: {
          refund_reason: reason || 'Customer requested refund',
        },
      });

      payment.status = PaymentStatus.REFUNDED;
      payment.refundedAt = new Date();
      payment.refundReason = reason;
      await this.paymentRepository.save(payment);

      return {
        success: true,
        refundId: refund.id,
        amount: payment.amount,
      };
    } catch (error) {
      throw new BadRequestException(`Refund failed: ${error.message}`);
    }
  }

  // Create Stripe Connect account for sitter
  async createSitterConnectAccount(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['sitterProfile'],
    });

    if (!user || user.userType !== 'sitter') {
      throw new BadRequestException('User must be a sitter');
    }

    if (user.sitterProfile?.stripeAccountId) {
      throw new BadRequestException('Sitter already has a Stripe Connect account');
    }

    try {
      const account = await this.stripe.accounts.create({
        type: 'express',
        country: 'US',
        email: user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'individual',
        individual: {
          email: user.email,
          first_name: user.firstName,
          last_name: user.lastName,
          phone: user.phone,
        },
      });

      // Update sitter profile
      if (!user.sitterProfile) {
        const sitterProfile = this.sitterProfileRepository.create({
          userId: user.id,
          stripeAccountId: account.id,
        });
        await this.sitterProfileRepository.save(sitterProfile);
      } else {
        user.sitterProfile.stripeAccountId = account.id;
        await this.sitterProfileRepository.save(user.sitterProfile);
      }

      return {
        accountId: account.id,
        onboardingUrl: account.onboarding_url,
      };
    } catch (error) {
      throw new BadRequestException(`Stripe Connect account creation failed: ${error.message}`);
    }
  }

  // Get sitter Stripe Connect status
  async getSitterConnectStatus(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['sitterProfile'],
    });

    if (!user || user.userType !== 'sitter') {
      throw new BadRequestException('User must be a sitter');
    }

    if (!user.sitterProfile?.stripeAccountId) {
      return {
        hasAccount: false,
        status: 'not_created',
      };
    }

    try {
      const account = await this.stripe.accounts.retrieve(user.sitterProfile.stripeAccountId);

      return {
        hasAccount: true,
        accountId: account.id,
        status: account.charges_enabled ? 'active' : 'pending',
        payoutsEnabled: account.payouts_enabled,
        requirements: account.requirements,
        onboardingUrl: account.onboarding_url,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to retrieve Stripe account: ${error.message}`);
    }
  }

  // Complete sitter onboarding
  async completeSitterOnboarding(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['sitterProfile'],
    });

    if (!user || user.userType !== 'sitter') {
      throw new BadRequestException('User must be a sitter');
    }

    if (!user.sitterProfile?.stripeAccountId) {
      throw new BadRequestException('Sitter must create a Stripe Connect account first');
    }

    try {
      const account = await this.stripe.accounts.retrieve(user.sitterProfile.stripeAccountId);

      if (!account.charges_enabled) {
        throw new BadRequestException('Account verification not complete');
      }

      return {
        success: true,
        accountId: account.id,
        status: 'active',
        payoutsEnabled: account.payouts_enabled,
      };
    } catch (error) {
      throw new BadRequestException(`Onboarding completion failed: ${error.message}`);
    }
  }

  // Request sitter payout
  async requestSitterPayout(userId: string, amount: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['sitterProfile'],
    });

    if (!user || user.userType !== 'sitter') {
      throw new BadRequestException('User must be a sitter');
    }

    if (!user.sitterProfile?.stripeAccountId) {
      throw new BadRequestException('Sitter must have a Stripe Connect account');
    }

    try {
      const payout = await this.stripe.payouts.create({
        amount: Math.round(amount * 100),
        currency: 'usd',
        metadata: {
          sitter_id: userId,
        },
      });

      return {
        success: true,
        payoutId: payout.id,
        amount: amount,
        status: payout.status,
        arrivalDate: new Date(payout.arrival_date * 1000),
      };
    } catch (error) {
      throw new BadRequestException(`Payout request failed: ${error.message}`);
    }
  }

  // Get sitter earnings
  async getSitterEarnings(userId: string, period: string = 'month') {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['sitterProfile'],
    });

    if (!user || user.userType !== 'sitter') {
      throw new BadRequestException('User must be a sitter');
    }

    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const payments = await this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.booking', 'booking')
      .where('booking.sitterId = :sitterId', { sitterId: userId })
      .andWhere('payment.status = :status', { status: PaymentStatus.COMPLETED })
      .andWhere('payment.processedAt >= :startDate', { startDate })
      .getMany();

    const totalEarnings = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const platformFees = payments.reduce((sum, payment) => {
      return sum + (payment.metadata?.platformFee || 0);
    }, 0);
    const netEarnings = totalEarnings - platformFees;

    return {
      period,
      totalEarnings,
      platformFees,
      netEarnings,
      paymentCount: payments.length,
      averagePerBooking: payments.length > 0 ? totalEarnings / payments.length : 0,
    };
  }

  // Get sitter payout history
  async getSitterPayouts(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['sitterProfile'],
    });

    if (!user || user.userType !== 'sitter') {
      throw new BadRequestException('User must be a sitter');
    }

    if (!user.sitterProfile?.stripeAccountId) {
      return [];
    }

    try {
      const payouts = await this.stripe.payouts.list({
        limit: 50,
      });

      return payouts.data.map(payout => ({
        id: payout.id,
        amount: payout.amount / 100,
        currency: payout.currency,
        status: payout.status,
        arrivalDate: new Date(payout.arrival_date * 1000),
        created: new Date(payout.created * 1000),
      }));
    } catch (error) {
      throw new BadRequestException(`Failed to retrieve payouts: ${error.message}`);
    }
  }

  // Get payments for user
  async getPayments(userId: string, filters: any = {}) {
    const query = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.booking', 'booking')
      .leftJoinAndSelect('booking.parent', 'parent')
      .leftJoinAndSelect('booking.sitter', 'sitter')
      .where('parent.id = :userId OR sitter.id = :userId', { userId });

    if (filters.status) {
      query.andWhere('payment.status = :status', { status: filters.status });
    }

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    const [payments, total] = await query
      .orderBy('payment.createdAt', 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return {
      payments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Get specific payment
  async getPayment(paymentId: string, userId: string) {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['booking', 'booking.parent', 'booking.sitter'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.booking.parent.id !== userId && payment.booking.sitter.id !== userId) {
      throw new BadRequestException('You can only view your own payments');
    }

    return payment;
  }

  // Get payments for specific booking
  async getBookingPayments(bookingId: string, userId: string) {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ['parent', 'sitter'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.parent.id !== userId && booking.sitter.id !== userId) {
      throw new BadRequestException('You can only view payments for your own bookings');
    }

    return this.paymentRepository.find({
      where: { bookingId },
      order: { createdAt: 'DESC' },
    });
  }

  // Handle Stripe webhook
  async handleStripeWebhook(payload: any, headers: any) {
    const sig = headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(payload, sig, endpointSecret);
    } catch (err) {
      throw new BadRequestException(`Webhook signature verification failed: ${err.message}`);
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.payment_failed':
        await this.handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      case 'transfer.created':
        await this.handleTransferCreated(event.data.object as Stripe.Transfer);
        break;
      case 'payout.paid':
        await this.handlePayoutPaid(event.data.object as Stripe.Payout);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }

  private async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    const payment = await this.paymentRepository.findOne({
      where: { stripePaymentIntentId: paymentIntent.id },
    });

    if (payment) {
      payment.status = PaymentStatus.COMPLETED;
      payment.processedAt = new Date();
      await this.paymentRepository.save(payment);
    }
  }

  private async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
    const payment = await this.paymentRepository.findOne({
      where: { stripePaymentIntentId: paymentIntent.id },
    });

    if (payment) {
      payment.status = PaymentStatus.FAILED;
      payment.failedAt = new Date();
      payment.failureReason = paymentIntent.last_payment_error?.message || 'Payment failed';
      await this.paymentRepository.save(payment);
    }
  }

  private async handleTransferCreated(transfer: Stripe.Transfer) {
    const payment = await this.paymentRepository.findOne({
      where: { stripeTransferId: transfer.id },
    });

    if (payment) {
      payment.stripeTransferId = transfer.id;
      await this.paymentRepository.save(payment);
    }
  }

  private async handlePayoutPaid(payout: Stripe.Payout) {
    // Handle successful payout
    console.log(`Payout ${payout.id} was successful`);
  }

  // Add payment method for parent
  async addParentPaymentMethod(userId: string, paymentMethodData: { token: string; type: string }) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['parentProfile'],
    });

    if (!user || user.userType !== 'parent') {
      throw new BadRequestException('User must be a parent');
    }

    try {
      // Create payment method in Stripe
      const paymentMethod = await this.stripe.paymentMethods.create({
        type: paymentMethodData.type as any,
        card: {
          token: paymentMethodData.token,
        },
      });

      // Attach to customer (create customer if doesn't exist)
      let customer;
      const existingCustomers = await this.stripe.customers.list({
        email: user.email,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0];
      } else {
        customer = await this.stripe.customers.create({
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
        });
      }

      await this.stripe.paymentMethods.attach(paymentMethod.id, {
        customer: customer.id,
      });

      // Store in parent profile
      if (!user.parentProfile) {
        const parentProfile = this.sitterProfileRepository.manager.getRepository('parent_profiles').create({
          userId: user.id,
          paymentMethods: [{
            id: paymentMethod.id,
            type: paymentMethodData.type,
            last4: paymentMethod.card?.last4,
            brand: paymentMethod.card?.brand,
          }],
        });
        await this.sitterProfileRepository.manager.getRepository('parent_profiles').save(parentProfile);
      } else {
        const paymentMethods = user.parentProfile.paymentMethods || [];
        paymentMethods.push({
          id: paymentMethod.id,
          type: paymentMethodData.type,
          last4: paymentMethod.card?.last4,
          brand: paymentMethod.card?.brand,
        });
        user.parentProfile.paymentMethods = paymentMethods;
        await this.sitterProfileRepository.manager.getRepository('parent_profiles').save(user.parentProfile);
      }

      return {
        success: true,
        paymentMethodId: paymentMethod.id,
        last4: paymentMethod.card?.last4,
        brand: paymentMethod.card?.brand,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to add payment method: ${error.message}`);
    }
  }

  // Get parent payment methods
  async getParentPaymentMethods(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['parentProfile'],
    });

    if (!user || user.userType !== 'parent') {
      throw new BadRequestException('User must be a parent');
    }

    if (!user.parentProfile?.paymentMethods) {
      return [];
    }

    return user.parentProfile.paymentMethods;
  }

  // Remove parent payment method
  async removeParentPaymentMethod(userId: string, methodId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['parentProfile'],
    });

    if (!user || user.userType !== 'parent') {
      throw new BadRequestException('User must be a parent');
    }

    if (!user.parentProfile?.paymentMethods) {
      throw new NotFoundException('No payment methods found');
    }

    const paymentMethod = user.parentProfile.paymentMethods.find(pm => pm.id === methodId);
    if (!paymentMethod) {
      throw new NotFoundException('Payment method not found');
    }

    try {
      // Detach from Stripe
      await this.stripe.paymentMethods.detach(methodId);

      // Remove from parent profile
      user.parentProfile.paymentMethods = user.parentProfile.paymentMethods.filter(
        pm => pm.id !== methodId
      );
      await this.sitterProfileRepository.manager.getRepository('parent_profiles').save(user.parentProfile);

      return { success: true };
    } catch (error) {
      throw new BadRequestException(`Failed to remove payment method: ${error.message}`);
    }
  }
} 