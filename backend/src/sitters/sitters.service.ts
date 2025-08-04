import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SitterProfile } from '../entities/sitter-profile.entity';
import { User, UserType } from '../entities/user.entity';
import { Booking, BookingStatus } from '../entities/booking.entity';
import { Review } from '../entities/review.entity';

@Injectable()
export class SittersService {
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

  async findAll(): Promise<SitterProfile[]> {
    return this.sitterProfileRepository.find({
      relations: ['user', 'certifications', 'reviews'],
    });
  }

  async findOne(id: string): Promise<SitterProfile> {
    const sitter = await this.sitterProfileRepository.findOne({
      where: { id },
      relations: ['user', 'certifications', 'reviews'],
    });

    if (!sitter) {
      throw new NotFoundException(`Sitter with ID ${id} not found`);
    }

    return sitter;
  }

  async findByUserId(userId: string): Promise<SitterProfile> {
    const sitter = await this.sitterProfileRepository.findOne({
      where: { userId },
      relations: ['user', 'certifications', 'reviews'],
    });

    if (!sitter) {
      throw new NotFoundException(`Sitter profile for user ${userId} not found`);
    }

    return sitter;
  }

  async create(sitterData: Partial<SitterProfile>): Promise<SitterProfile> {
    const sitter = this.sitterProfileRepository.create(sitterData);
    return this.sitterProfileRepository.save(sitter);
  }

  async createSitterProfile(userId: string, sitterData: Partial<SitterProfile>): Promise<SitterProfile> {
    const sitter = this.sitterProfileRepository.create({
      ...sitterData,
      userId,
    });
    return this.sitterProfileRepository.save(sitter);
  }

  async updateSitterProfile(userId: string, sitterData: Partial<SitterProfile>): Promise<SitterProfile> {
    const sitter = await this.findByUserId(userId);
    Object.assign(sitter, sitterData);
    return this.sitterProfileRepository.save(sitter);
  }

  async update(id: string, sitterData: Partial<SitterProfile>): Promise<SitterProfile> {
    const sitter = await this.findOne(id);
    Object.assign(sitter, sitterData);
    return this.sitterProfileRepository.save(sitter);
  }

  async remove(id: string): Promise<void> {
    const sitter = await this.findOne(id);
    await this.sitterProfileRepository.remove(sitter);
  }

  async searchSitters(criteria: {
    location?: string;
    minRate?: number;
    maxRate?: number;
    availability?: string[];
    certifications?: string[];
  }): Promise<SitterProfile[]> {
    const query = this.sitterProfileRepository
      .createQueryBuilder('sitter')
      .leftJoinAndSelect('sitter.user', 'user')
      .leftJoinAndSelect('sitter.certifications', 'certifications')
      .leftJoinAndSelect('sitter.reviews', 'reviews');

    if (criteria.location) {
      query.andWhere('sitter.location ILIKE :location', {
        location: `%${criteria.location}%`,
      });
    }

    if (criteria.minRate) {
      query.andWhere('sitter.hourlyRate >= :minRate', {
        minRate: criteria.minRate,
      });
    }

    if (criteria.maxRate) {
      query.andWhere('sitter.hourlyRate <= :maxRate', {
        maxRate: criteria.maxRate,
      });
    }

    if (criteria.certifications && criteria.certifications.length > 0) {
      query.andWhere('certifications.type IN (:...certifications)', {
        certifications: criteria.certifications,
      });
    }

    return query.getMany();
  }

  async getAllSitters(filters: any): Promise<SitterProfile[]> {
    const query = this.sitterProfileRepository
      .createQueryBuilder('sitter')
      .leftJoinAndSelect('sitter.user', 'user')
      .leftJoinAndSelect('sitter.certifications', 'certifications')
      .leftJoinAndSelect('sitter.reviews', 'reviews');

    if (filters.verified) {
      query.andWhere('sitter.isVerified = :verified', { verified: filters.verified });
    }

    if (filters.available) {
      query.andWhere('sitter.isAvailable = :available', { available: filters.available });
    }

    if (filters.minRating) {
      query.andWhere('sitter.averageRating >= :minRating', { minRating: filters.minRating });
    }

    return query.getMany();
  }

  async getSitterProfile(id: string): Promise<SitterProfile> {
    return this.findOne(id);
  }

  async getSitterReviews(id: string, page: number = 1, limit: number = 10): Promise<any> {
    const sitter = await this.findOne(id);
    // This would need to be implemented based on your review entity structure
    return { reviews: [], total: 0, page, limit };
  }

  async getSitterAvailability(id: string, date?: string): Promise<any> {
    const sitter = await this.findOne(id);
    // This would need to be implemented based on your availability structure
    return { availability: sitter.availability };
  }

  async updateAvailability(userId: string, availability: any): Promise<SitterProfile> {
    const sitter = await this.sitterProfileRepository.findOne({
      where: { userId },
    });

    if (!sitter) {
      throw new NotFoundException('Sitter profile not found');
    }

    sitter.availability = JSON.stringify(availability);
    return this.sitterProfileRepository.save(sitter);
  }

  async getCertifications(userId: string): Promise<any[]> {
    const sitter = await this.sitterProfileRepository.findOne({
      where: { userId },
    });

    if (!sitter) {
      throw new NotFoundException('Sitter profile not found');
    }

    return sitter.certifications ? JSON.parse(sitter.certifications) : [];
  }

  async removeCertification(certId: string, userId: string): Promise<void> {
    // This would need to be implemented based on your certification structure
    return;
  }

  async getNearbySitters(latitude: number, longitude: number, radius: number = 10): Promise<SitterProfile[]> {
    // This would need to be implemented with proper geospatial queries
    return this.findAll();
  }

  async getFeaturedSitters(): Promise<SitterProfile[]> {
    // This would need to be implemented based on your featured sitter logic
    return this.findAll();
  }

  async updateStatus(userId: string, isAvailable: boolean): Promise<SitterProfile> {
    const sitter = await this.sitterProfileRepository.findOne({
      where: { userId },
    });

    if (!sitter) {
      throw new NotFoundException('Sitter profile not found');
    }

    // Update availability status
    const availability = sitter.availability ? JSON.parse(sitter.availability) : {};
    availability.isAvailable = isAvailable;
    sitter.availability = JSON.stringify(availability);

    return this.sitterProfileRepository.save(sitter);
  }

  async getMySitterProfile(userId: string): Promise<SitterProfile> {
    return this.getSitterProfile(userId);
  }

  async getEarningsSummary(userId: string, period: string = 'month'): Promise<any> {
    // This would need to be implemented based on your payment/booking structure
    return { totalEarnings: 0, period };
  }

  async getBookingStats(userId: string): Promise<any> {
    // This would need to be implemented based on your booking structure
    return { totalBookings: 0, completedBookings: 0 };
  }

  async requestBackgroundCheck(userId: string): Promise<any> {
    // This would need to be implemented based on your background check service
    return { status: 'pending', requestId: 'mock-request-id' };
  }

  async getBackgroundCheckStatus(userId: string): Promise<any> {
    // This would need to be implemented based on your background check service
    return { status: 'pending', lastUpdated: new Date() };
  }

  async uploadCertification(userId: string, certificationData: any): Promise<any> {
    // This would need to be implemented based on your certification structure
    return { id: 'mock-cert-id', ...certificationData };
  }
} 