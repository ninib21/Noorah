import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserType } from '../entities/user.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { SearchBookingsDto } from './dto/search-bookings.dto';

@ApiTags('Bookings')
@Controller('bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiResponse({ status: 201, description: 'Booking created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createBooking(@Request() req, @Body() createBookingDto: CreateBookingDto) {
    return this.bookingsService.createBooking(req.user.id, createBookingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get user bookings' })
  @ApiResponse({ status: 200, description: 'Bookings retrieved successfully' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getUserBookings(@Request() req, @Query() query: SearchBookingsDto) {
    return this.bookingsService.getUserBookings(req.user.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking by ID' })
  @ApiResponse({ status: 200, description: 'Booking retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async getBooking(@Param('id') id: string, @Request() req) {
    return this.bookingsService.getBooking(id, req.user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update booking' })
  @ApiResponse({ status: 200, description: 'Booking updated successfully' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async updateBooking(
    @Param('id') id: string,
    @Body() updateBookingDto: UpdateBookingDto,
    @Request() req,
  ) {
    return this.bookingsService.updateBooking(id, req.user.id, updateBookingDto);
  }

  @Post(':id/confirm')
  @ApiOperation({ summary: 'Confirm booking (Sitter only)' })
  @ApiResponse({ status: 200, description: 'Booking confirmed successfully' })
  @ApiResponse({ status: 403, description: 'Only sitters can confirm bookings' })
  async confirmBooking(@Param('id') id: string, @Request() req) {
    return this.bookingsService.confirmBooking(id, req.user.id);
  }

  @Post(':id/start')
  @ApiOperation({ summary: 'Start booking session' })
  @ApiResponse({ status: 200, description: 'Booking session started' })
  async startBooking(@Param('id') id: string, @Request() req) {
    return this.bookingsService.startBooking(id, req.user.id);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Complete booking session' })
  @ApiResponse({ status: 200, description: 'Booking session completed' })
  async completeBooking(@Param('id') id: string, @Request() req) {
    return this.bookingsService.completeBooking(id, req.user.id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel booking' })
  @ApiResponse({ status: 200, description: 'Booking cancelled' })
  async cancelBooking(@Param('id') id: string, @Request() req, @Body() cancelBookingDto: CancelBookingDto) {
    return this.bookingsService.cancelBooking(id, req.user.id);
  }

  @Post(':id/check-in')
  @ApiOperation({ summary: 'Check in for booking' })
  @ApiResponse({ status: 200, description: 'Check-in recorded successfully' })
  async checkIn(@Param('id') id: string, @Request() req, @Body() checkInData: any) {
    return this.bookingsService.checkIn(id, req.user.id, checkInData);
  }

  @Post(':id/check-out')
  @ApiOperation({ summary: 'Check out from booking' })
  @ApiResponse({ status: 200, description: 'Check-out recorded successfully' })
  async checkOut(@Param('id') id: string, @Request() req, @Body() checkOutData: any) {
    return this.bookingsService.checkOut(id, req.user.id, checkOutData);
  }

  @Post(':id/upload-photos')
  @ApiOperation({ summary: 'Upload photos for booking' })
  @ApiResponse({ status: 200, description: 'Photos uploaded successfully' })
  async uploadPhotos(@Param('id') id: string, @Request() req, @Body() photosData: any) {
    return this.bookingsService.uploadPhotos(id, req.user.id, photosData);
  }

  @Post(':id/add-expense')
  @ApiOperation({ summary: 'Add expense to booking' })
  @ApiResponse({ status: 201, description: 'Expense added successfully' })
  async addExpense(@Param('id') id: string, @Request() req, @Body() expenseData: any) {
    return this.bookingsService.addExpense(id, req.user.id, expenseData);
  }

  @Put(':id/expenses/:expenseId/approve')
  @ApiOperation({ summary: 'Approve expense (Parent only)' })
  @ApiResponse({ status: 200, description: 'Expense approved successfully' })
  async approveExpense(@Param('id') id: string, @Param('expenseId') expenseId: string, @Request() req) {
    return this.bookingsService.approveExpense(id, expenseId, req.user.id);
  }

  @Post(':id/emergency-alert')
  @ApiOperation({ summary: 'Send emergency alert' })
  @ApiResponse({ status: 200, description: 'Emergency alert sent successfully' })
  async sendEmergencyAlert(@Param('id') id: string, @Request() req, @Body() alertData: any) {
    return this.bookingsService.sendEmergencyAlert(id, req.user.id, alertData);
  }

  @Get(':id/chat')
  @ApiOperation({ summary: 'Get booking chat messages' })
  @ApiResponse({ status: 200, description: 'Chat messages retrieved' })
  async getBookingChat(@Param('id') id: string, @Request() req) {
    return this.bookingsService.getBookingChat(id, req.user.id);
  }

  @Post(':id/chat')
  @ApiOperation({ summary: 'Send message in booking chat' })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  async sendMessage(@Param('id') id: string, @Request() req, @Body() messageData: any) {
    return this.bookingsService.sendMessage(id, req.user.id, messageData);
  }

  @Get(':id/activities')
  @ApiOperation({ summary: 'Get booking activities' })
  @ApiResponse({ status: 200, description: 'Activities retrieved' })
  async getBookingActivities(@Param('id') id: string, @Request() req) {
    return this.bookingsService.getBookingActivities(id, req.user.id);
  }

  @Post(':id/activities')
  @ApiOperation({ summary: 'Add activity to booking' })
  @ApiResponse({ status: 201, description: 'Activity added successfully' })
  async addActivity(@Param('id') id: string, @Request() req, @Body() activityData: any) {
    return this.bookingsService.addActivity(id, req.user.id, activityData);
  }

  // Admin only endpoints
  @Get()
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Get all bookings (Admin only)' })
  @ApiResponse({ status: 200, description: 'Bookings retrieved successfully' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getAllBookings(@Query() query: any) {
    return this.bookingsService.getAllBookings(query);
  }

  @Delete(':id')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Delete booking (Admin only)' })
  @ApiResponse({ status: 200, description: 'Booking deleted successfully' })
  async deleteBooking(@Param('id') id: string) {
    return this.bookingsService.deleteBooking(id);
  }

  @Post(':id/refund')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Process refund (Admin only)' })
  @ApiResponse({ status: 200, description: 'Refund processed successfully' })
  async processRefund(@Param('id') id: string, @Body() refundData: any) {
    return this.bookingsService.processRefund(id, refundData);
  }

  @Post(':id/dispute')
  @ApiOperation({ summary: 'Create dispute for booking' })
  @ApiResponse({ status: 201, description: 'Dispute created successfully' })
  async createDispute(@Param('id') id: string, @Request() req, @Body() disputeData: any) {
    return this.bookingsService.createDispute(id, req.user.id, disputeData);
  }

  @Put(':id/dispute/:disputeId/resolve')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Resolve dispute (Admin only)' })
  @ApiResponse({ status: 200, description: 'Dispute resolved successfully' })
  async resolveDispute(@Param('id') id: string, @Param('disputeId') disputeId: string, @Body() resolutionData: any) {
    return this.bookingsService.resolveDispute(id, disputeId, resolutionData);
  }
} 