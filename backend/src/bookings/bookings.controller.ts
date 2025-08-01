import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CreateBookingDto,
  UpdateBookingDto,
  BookingFiltersDto,
  BookingStatusDto,
} from './dto/booking.dto';

@ApiTags('Bookings')
@Controller('bookings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiResponse({
    status: 201,
    description: 'Booking created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  async createBooking(
    @Request() req,
    @Body() createBookingDto: CreateBookingDto,
  ) {
    return this.bookingsService.createBooking(req.user.id, createBookingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all bookings for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Bookings retrieved successfully',
  })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getBookings(
    @Request() req,
    @Query() filters: BookingFiltersDto,
  ) {
    return this.bookingsService.getBookings(req.user.id, filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific booking by ID' })
  @ApiResponse({
    status: 200,
    description: 'Booking retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Booking not found',
  })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  async getBooking(@Param('id') id: string, @Request() req) {
    return this.bookingsService.getBooking(id, req.user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a booking' })
  @ApiResponse({
    status: 200,
    description: 'Booking updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Booking not found',
  })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  async updateBooking(
    @Param('id') id: string,
    @Body() updateBookingDto: UpdateBookingDto,
    @Request() req,
  ) {
    return this.bookingsService.updateBooking(id, req.user.id, updateBookingDto);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update booking status' })
  @ApiResponse({
    status: 200,
    description: 'Booking status updated successfully',
  })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  async updateBookingStatus(
    @Param('id') id: string,
    @Body() statusDto: BookingStatusDto,
    @Request() req,
  ) {
    return this.bookingsService.updateBookingStatus(id, req.user.id, statusDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancel a booking' })
  @ApiResponse({
    status: 204,
    description: 'Booking cancelled successfully',
  })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  async cancelBooking(@Param('id') id: string, @Request() req) {
    return this.bookingsService.cancelBooking(id, req.user.id);
  }

  @Post(':id/confirm')
  @ApiOperation({ summary: 'Confirm a booking (sitter only)' })
  @ApiResponse({
    status: 200,
    description: 'Booking confirmed successfully',
  })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  async confirmBooking(@Param('id') id: string, @Request() req) {
    return this.bookingsService.confirmBooking(id, req.user.id);
  }

  @Post(':id/start')
  @ApiOperation({ summary: 'Start a booking session' })
  @ApiResponse({
    status: 200,
    description: 'Booking session started successfully',
  })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  async startBooking(@Param('id') id: string, @Request() req) {
    return this.bookingsService.startBooking(id, req.user.id);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Complete a booking session' })
  @ApiResponse({
    status: 200,
    description: 'Booking session completed successfully',
  })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  async completeBooking(@Param('id') id: string, @Request() req) {
    return this.bookingsService.completeBooking(id, req.user.id);
  }

  @Get(':id/session')
  @ApiOperation({ summary: 'Get booking session details' })
  @ApiResponse({
    status: 200,
    description: 'Session details retrieved successfully',
  })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  async getBookingSession(@Param('id') id: string, @Request() req) {
    return this.bookingsService.getBookingSession(id, req.user.id);
  }

  @Post(':id/session/check-in')
  @ApiOperation({ summary: 'Add a check-in to the session' })
  @ApiResponse({
    status: 200,
    description: 'Check-in added successfully',
  })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  async addCheckIn(
    @Param('id') id: string,
    @Body() checkInData: { type: string; notes?: string; location?: any },
    @Request() req,
  ) {
    return this.bookingsService.addCheckIn(id, req.user.id, checkInData);
  }

  @Post(':id/session/photo')
  @ApiOperation({ summary: 'Add a photo to the session' })
  @ApiResponse({
    status: 200,
    description: 'Photo added successfully',
  })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  async addPhoto(
    @Param('id') id: string,
    @Body() photoData: { url: string; description?: string },
    @Request() req,
  ) {
    return this.bookingsService.addPhoto(id, req.user.id, photoData);
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming bookings' })
  @ApiResponse({
    status: 200,
    description: 'Upcoming bookings retrieved successfully',
  })
  async getUpcomingBookings(@Request() req) {
    return this.bookingsService.getUpcomingBookings(req.user.id);
  }

  @Get('past')
  @ApiOperation({ summary: 'Get past bookings' })
  @ApiResponse({
    status: 200,
    description: 'Past bookings retrieved successfully',
  })
  async getPastBookings(@Request() req) {
    return this.bookingsService.getPastBookings(req.user.id);
  }
} 