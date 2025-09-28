import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserStatus, SubscriptionTier } from '../entities/user.entity';
import { Booking, BookingStatus } from '../entities/booking.entity';
import { Payment, PaymentStatus } from '../entities/payment.entity';

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalBookings: number;
  activeBookings: number;
  totalRevenue: number;
  averageRating: number;
}

export interface UserStats {
  totalUsers: number;
  newUsersThisMonth: number;
  verifiedUsers: number;
  premiumUsers: number;
}

export interface BookingStats {
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  averageBookingValue: number;
}

export interface RevenueStats {
  totalRevenue: number;
  revenueThisMonth: number;
  revenueThisYear: number;
  averageTransactionValue: number;
}

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}

  async getDashboardStats(): Promise<DashboardStats> {
    const [
      totalUsers,
      activeUsers,
      totalBookings,
      activeBookings,
      totalRevenue,
      averageRating,
    ] = await Promise.all([
      this.userRepository.count(),
      this.userRepository.count({ where: { status: UserStatus.ACTIVE } }),
      this.bookingRepository.count(),
      this.bookingRepository.count({ where: { status: BookingStatus.IN_PROGRESS } }),
      this.paymentRepository
        .createQueryBuilder('payment')
        .select('SUM(payment.amount)', 'total')
        .where('payment.status = :status', { status: PaymentStatus.PAID })
        .getRawOne()
        .then(result => parseFloat(result.total) || 0),
      this.userRepository
        .createQueryBuilder('user')
        .select('AVG(user.averageRating)', 'average')
        .getRawOne()
        .then(result => parseFloat(result.average) || 0),
    ]);

    return {
      totalUsers,
      activeUsers,
      totalBookings,
      activeBookings,
      totalRevenue,
      averageRating,
    };
  }

  async getUserStats(): Promise<UserStats> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalUsers, newUsersThisMonth, verifiedUsers, premiumUsers] = await Promise.all([
      this.userRepository.count(),
      this.userRepository.count({
        where: {
          createdAt: { $gte: startOfMonth } as any,
        },
      }),
      this.userRepository.count({
        where: {
          emailVerified: true,
          phoneVerified: true,
        },
      }),
      this.userRepository.count({
        where: {
          subscriptionTier: SubscriptionTier.PREMIUM,
        },
      }),
    ]);

    return {
      totalUsers,
      newUsersThisMonth,
      verifiedUsers,
      premiumUsers,
    };
  }

  async getBookingStats(): Promise<BookingStats> {
    const [totalBookings, completedBookings, cancelledBookings, averageBookingValue] = await Promise.all([
      this.bookingRepository.count(),
      this.bookingRepository.count({ where: { status: BookingStatus.COMPLETED } }),
      this.bookingRepository.count({ where: { status: BookingStatus.CANCELLED } }),
      this.bookingRepository
        .createQueryBuilder('booking')
        .select('AVG(booking.totalAmount)', 'average')
        .getRawOne()
        .then(result => parseFloat(result.average) || 0),
    ]);

    return {
      totalBookings,
      completedBookings,
      cancelledBookings,
      averageBookingValue,
    };
  }

  async getRevenueStats(): Promise<RevenueStats> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [totalRevenue, revenueThisMonth, revenueThisYear, averageTransactionValue] = await Promise.all([
      this.paymentRepository
        .createQueryBuilder('payment')
        .select('SUM(payment.amount)', 'total')
        .where('payment.status = :status', { status: PaymentStatus.PAID })
        .getRawOne()
        .then(result => parseFloat(result.total) || 0),
      this.paymentRepository
        .createQueryBuilder('payment')
        .select('SUM(payment.amount)', 'total')
        .where('payment.status = :status', { status: PaymentStatus.PAID })
        .andWhere('payment.createdAt >= :startDate', { startDate: startOfMonth })
        .getRawOne()
        .then(result => parseFloat(result.total) || 0),
      this.paymentRepository
        .createQueryBuilder('payment')
        .select('SUM(payment.amount)', 'total')
        .where('payment.status = :status', { status: PaymentStatus.PAID })
        .andWhere('payment.createdAt >= :startDate', { startDate: startOfYear })
        .getRawOne()
        .then(result => parseFloat(result.total) || 0),
      this.paymentRepository
        .createQueryBuilder('payment')
        .select('AVG(payment.amount)', 'average')
        .where('payment.status = :status', { status: PaymentStatus.PAID })
        .getRawOne()
        .then(result => parseFloat(result.average) || 0),
    ]);

    return {
      totalRevenue,
      revenueThisMonth,
      revenueThisYear,
      averageTransactionValue,
    };
  }

  async getAllUsers(page: number = 1, limit: number = 20, filters?: any): Promise<{ users: User[]; total: number }> {
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (filters?.userType) {
      queryBuilder.andWhere('user.userType = :userType', { userType: filters.userType });
    }

    if (filters?.status) {
      queryBuilder.andWhere('user.status = :status', { status: filters.status });
    }

    if (filters?.search) {
      queryBuilder.andWhere(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    const total = await queryBuilder.getCount();
    const users = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('user.createdAt', 'DESC')
      .getMany();

    return { users, total };
  }

  async getUserById(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateUserStatus(userId: string, status: UserStatus): Promise<User> {
    const user = await this.getUserById(userId);
    await this.userRepository.update(userId, { status });
    return this.getUserById(userId);
  }

  async updateUserSubscription(userId: string, tier: SubscriptionTier): Promise<User> {
    const user = await this.getUserById(userId);
    await this.userRepository.update(userId, { subscriptionTier: tier });
    return this.getUserById(userId);
  }

  async getDisputedBookings(): Promise<Booking[]> {
    return this.bookingRepository.find({
      where: { status: BookingStatus.CANCELLED },
      relations: ['parent', 'sitter'],
      order: { createdAt: 'DESC' },
    });
  }

  async resolveBookingDispute(bookingId: string, resolution: string, refundAmount?: number): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({ where: { id: bookingId } });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (refundAmount) {
      // Process refund through payment service
      console.log(`Processing refund for booking ${bookingId}: ${refundAmount}`);
      await this.bookingRepository.update(bookingId, {
        status: BookingStatus.CANCELLED,
      });
    }

    return booking;
  }

  async getActiveBookings(): Promise<Booking[]> {
    return this.bookingRepository.find({
      where: { status: BookingStatus.IN_PROGRESS },
      relations: ['parent', 'sitter'],
      order: { startTime: 'ASC' },
    });
  }

  async getUpcomingBookings(): Promise<Booking[]> {
    return this.bookingRepository.find({
      where: { status: BookingStatus.CONFIRMED },
      relations: ['parent', 'sitter'],
      order: { startTime: 'ASC' },
    });
  }

  async getBookingLocation(bookingId: string): Promise<any> {
    const booking = await this.bookingRepository.findOne({ where: { id: bookingId } });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // This would need to be implemented based on your location tracking
    return {
      bookingId,
      location: {
        latitude: 0,
        longitude: 0,
        address: booking.location,
      },
      lastUpdated: new Date(),
    };
  }

  async getEmergencyAlerts(): Promise<any[]> {
    // This would need to be implemented based on your emergency alert system
    return [];
  }

  async getSystemHealth(): Promise<any> {
    const [
      databaseConnection,
      cacheConnection,
      externalServices,
    ] = await Promise.all([
      this.checkDatabaseHealth(),
      this.checkCacheHealth(),
      this.checkExternalServicesHealth(),
    ]);

    return {
      database: databaseConnection,
      cache: cacheConnection,
      externalServices,
      timestamp: new Date(),
    };
  }

  private async checkDatabaseHealth(): Promise<any> {
    try {
      await this.userRepository.query('SELECT 1');
      return { status: 'healthy', responseTime: 0 };
    } catch (error) {
      return { status: 'unhealthy', error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private async checkCacheHealth(): Promise<any> {
    // This would need to be implemented based on your cache system
    return { status: 'healthy', responseTime: 0 };
  }

  private async checkExternalServicesHealth(): Promise<any> {
    // This would need to be implemented based on your external services
    return {
      stripe: { status: 'healthy' },
      email: { status: 'healthy' },
      sms: { status: 'healthy' },
    };
  }

  private async processRefund(paymentIntentId: string, amount: number): Promise<void> {
    // This would need to be implemented with Stripe
    console.log(`Processing refund for ${paymentIntentId}: ${amount}`);
  }
} 
