import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking, BookingStatus } from '../entities/booking.entity';
import { CreateBookingDto, UpdateBookingDto, BookingFiltersDto, BookingStatusDto } from './dto/booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
  ) {}

  async findAll(): Promise<Booking[]> {
    return this.bookingRepository.find({
      relations: ['sitter', 'parent'],
    });
  }

  async findOne(id: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['sitter', 'parent'],
    });
    if (!booking) {
      throw new Error('Booking not found');
    }
    return booking;
  }

  async create(bookingData: Partial<Booking>): Promise<Booking> {
    const booking = this.bookingRepository.create(bookingData);
    return this.bookingRepository.save(booking);
  }

  async update(id: string, bookingData: Partial<Booking>): Promise<Booking> {
    const booking = await this.findOne(id);
    Object.assign(booking, bookingData);
    return this.bookingRepository.save(booking);
  }

  async remove(id: string): Promise<void> {
    await this.bookingRepository.delete(id);
  }

  // Additional methods needed by controller
  async createBooking(parentId: string, createBookingDto: CreateBookingDto): Promise<Booking> {
    const booking = this.bookingRepository.create({
      parentId,
      sitterId: createBookingDto.sitterId,
      startTime: new Date(createBookingDto.startTime),
      endTime: new Date(createBookingDto.endTime),
      childrenCount: createBookingDto.childrenCount,
      hourlyRate: createBookingDto.hourlyRate || 15,
      location: createBookingDto.location || '',
      notes: createBookingDto.notes,
      requirements: createBookingDto.requirements ? JSON.parse(createBookingDto.requirements) : null,
    });

    return this.bookingRepository.save(booking);
  }

  async getBookings(userId: string, filters: BookingFiltersDto): Promise<Booking[]> {
    const query = this.bookingRepository.createQueryBuilder('booking')
      .leftJoinAndSelect('booking.sitter', 'sitter')
      .leftJoinAndSelect('booking.parent', 'parent')
      .where('booking.parentId = :userId', { userId });

    if (filters.status) {
      query.andWhere('booking.status = :status', { status: filters.status });
    }

    if (filters.startDate) {
      query.andWhere('booking.startTime >= :startDate', { startDate: filters.startDate });
    }

    if (filters.endDate) {
      query.andWhere('booking.endTime <= :endDate', { endDate: filters.endDate });
    }

    return query.getMany();
  }

  async getBooking(id: string, userId: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['parent', 'sitter'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  async getUserBookings(userId: string, filters: any): Promise<Booking[]> {
    return this.getBookings(userId, filters);
  }

  async getAllBookings(filters: any): Promise<Booking[]> {
    return this.bookingRepository.find({
      relations: ['parent', 'sitter'],
    });
  }

  async deleteBooking(id: string): Promise<void> {
    const result = await this.bookingRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Booking not found');
    }
  }

  async updateBooking(id: string, userId: string, updateBookingDto: UpdateBookingDto): Promise<Booking> {
    const booking = await this.getBooking(id, userId);
    Object.assign(booking, updateBookingDto);
    return this.bookingRepository.save(booking);
  }

  async updateBookingStatus(id: string, userId: string, statusDto: BookingStatusDto): Promise<Booking> {
    const booking = await this.getBooking(id, userId);
    booking.status = statusDto.status;
    return this.bookingRepository.save(booking);
  }

  async cancelBooking(id: string, userId: string): Promise<Booking> {
    const booking = await this.getBooking(id, userId);
    booking.status = BookingStatus.CANCELLED;
    booking.cancelledAt = new Date();
    booking.cancelledBy = userId;
    return this.bookingRepository.save(booking);
  }

  async confirmBooking(id: string, userId: string): Promise<Booking> {
    const booking = await this.getBooking(id, userId);
    if (booking.sitterId !== userId) {
      throw new BadRequestException('Only sitter can confirm booking');
    }
    booking.status = BookingStatus.CONFIRMED;
    booking.confirmedAt = new Date();
    return this.bookingRepository.save(booking);
  }

  async startBooking(id: string, userId: string): Promise<Booking> {
    const booking = await this.getBooking(id, userId);
    if (booking.sitterId !== userId) {
      throw new BadRequestException('Only sitter can start booking');
    }
    booking.status = BookingStatus.IN_PROGRESS;
    booking.startedAt = new Date();
    return this.bookingRepository.save(booking);
  }

  async completeBooking(id: string, userId: string): Promise<Booking> {
    const booking = await this.getBooking(id, userId);
    if (booking.sitterId !== userId) {
      throw new BadRequestException('Only sitter can complete booking');
    }
    booking.status = BookingStatus.COMPLETED;
    booking.completedAt = new Date();
    return this.bookingRepository.save(booking);
  }

  async getBookingSession(id: string, userId: string): Promise<any> {
    const booking = await this.getBooking(id, userId);
    // This would need to be implemented based on your session structure
    return { booking, session: null };
  }

  async addCheckIn(id: string, userId: string, checkInData: any): Promise<any> {
    const booking = await this.getBooking(id, userId);
    // This would need to be implemented based on your check-in structure
    return { booking, checkIn: checkInData };
  }

  async addPhoto(id: string, userId: string, photoData: any): Promise<any> {
    const booking = await this.getBooking(id, userId);
    // This would need to be implemented based on your photo structure
    return { booking, photo: photoData };
  }

  async getUpcomingBookings(userId: string): Promise<Booking[]> {
    return this.bookingRepository.find({
      where: [
        { parentId: userId, status: BookingStatus.CONFIRMED },
        { parentId: userId, status: BookingStatus.IN_PROGRESS },
        { sitterId: userId, status: BookingStatus.CONFIRMED },
        { sitterId: userId, status: BookingStatus.IN_PROGRESS },
      ],
      relations: ['sitter', 'parent'],
      order: { startTime: 'ASC' },
    });
  }

  async getPastBookings(userId: string): Promise<Booking[]> {
    return this.bookingRepository.find({
      where: [
        { parentId: userId, status: BookingStatus.COMPLETED },
        { parentId: userId, status: BookingStatus.CANCELLED },
        { sitterId: userId, status: BookingStatus.COMPLETED },
        { sitterId: userId, status: BookingStatus.CANCELLED },
      ],
      relations: ['sitter', 'parent'],
      order: { startTime: 'DESC' },
    });
  }

  async checkIn(id: string, userId: string, checkInData: any): Promise<Booking> {
    // Placeholder implementation
    const booking = await this.getBooking(id, userId);
    return booking;
  }

  async checkOut(id: string, userId: string, checkOutData: any): Promise<Booking> {
    // Placeholder implementation
    const booking = await this.getBooking(id, userId);
    return booking;
  }

  async uploadPhotos(id: string, userId: string, photosData: any): Promise<Booking> {
    // Placeholder implementation
    const booking = await this.getBooking(id, userId);
    return booking;
  }

  async addExpense(id: string, userId: string, expenseData: any): Promise<Booking> {
    // Placeholder implementation
    const booking = await this.getBooking(id, userId);
    return booking;
  }

  async approveExpense(id: string, expenseId: string, userId: string): Promise<Booking> {
    // Placeholder implementation
    const booking = await this.getBooking(id, userId);
    return booking;
  }

  async sendEmergencyAlert(id: string, userId: string, alertData: any): Promise<Booking> {
    // Placeholder implementation
    const booking = await this.getBooking(id, userId);
    return booking;
  }

  async getBookingChat(id: string, userId: string): Promise<any> {
    // Placeholder implementation
    return { messages: [] };
  }

  async sendMessage(id: string, userId: string, messageData: any): Promise<any> {
    // Placeholder implementation
    return { message: 'Message sent' };
  }

  async getBookingActivities(id: string, userId: string): Promise<any[]> {
    // Placeholder implementation
    return [];
  }

  async addActivity(id: string, userId: string, activityData: any): Promise<Booking> {
    // Placeholder implementation
    const booking = await this.getBooking(id, userId);
    return booking;
  }

  async processRefund(id: string, refundData: any): Promise<Booking> {
    // Placeholder implementation
    const booking = await this.getBooking(id, 'admin');
    return booking;
  }

  async createDispute(id: string, userId: string, disputeData: any): Promise<Booking> {
    // Placeholder implementation
    const booking = await this.getBooking(id, userId);
    return booking;
  }

  async resolveDispute(id: string, disputeId: string, resolutionData: any): Promise<Booking> {
    // Placeholder implementation
    const booking = await this.getBooking(id, 'admin');
    return booking;
  }
} 