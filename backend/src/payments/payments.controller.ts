import {
  Controller,
  Post,
  Get,
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
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CreatePaymentIntentDto,
  ProcessPaymentDto,
  RefundPaymentDto,
  PaymentFiltersDto,
  SitterPayoutDto,
  PaymentResponseDto,
  PaymentIntentResponseDto,
  StripeConnectResponseDto,
  StripeConnectStatusDto,
  SitterEarningsDto,
  PayoutHistoryDto,
} from './dto/payment.dto';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

                @Post('create-intent')
              @ApiOperation({ summary: 'Create a payment intent for booking' })
              @ApiResponse({
                status: 201,
                description: 'Payment intent created successfully',
                type: PaymentIntentResponseDto,
              })
              @ApiResponse({
                status: 400,
                description: 'Bad request - validation failed',
              })
              async createPaymentIntent(
                @Request() req,
                @Body() createPaymentIntentDto: CreatePaymentIntentDto,
              ) {
                return this.paymentsService.createPaymentIntent(
                  req.user.id,
                  createPaymentIntentDto.bookingId,
                  createPaymentIntentDto.paymentMethodId,
                );
              }

                @Post('process')
              @ApiOperation({ summary: 'Process a payment' })
              @ApiResponse({
                status: 200,
                description: 'Payment processed successfully',
              })
              async processPayment(
                @Request() req,
                @Body() processPaymentDto: ProcessPaymentDto,
              ) {
                return this.paymentsService.processPayment(req.user.id, processPaymentDto.paymentIntentId);
              }

  @Post(':id/confirm')
  @ApiOperation({ summary: 'Confirm a payment' })
  @ApiResponse({
    status: 200,
    description: 'Payment confirmed successfully',
  })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  async confirmPayment(@Param('id') id: string, @Request() req) {
    return this.paymentsService.confirmPayment(id, req.user.id);
  }

                @Post(':id/refund')
              @ApiOperation({ summary: 'Refund a payment' })
              @ApiResponse({
                status: 200,
                description: 'Payment refunded successfully',
              })
              @ApiParam({ name: 'id', description: 'Payment ID' })
              async refundPayment(
                @Param('id') id: string,
                @Body() refundPaymentDto: RefundPaymentDto,
                @Request() req,
              ) {
                return this.paymentsService.refundPayment(id, req.user.id, refundPaymentDto.reason);
              }

                @Get()
              @ApiOperation({ summary: 'Get all payments for the current user' })
              @ApiResponse({
                status: 200,
                description: 'Payments retrieved successfully',
                type: [PaymentResponseDto],
              })
              @ApiQuery({ name: 'status', required: false, enum: ['pending', 'processing', 'completed', 'failed', 'refunded'] })
              @ApiQuery({ name: 'page', required: false, type: Number })
              @ApiQuery({ name: 'limit', required: false, type: Number })
              async getPayments(
                @Request() req,
                @Query() filters: PaymentFiltersDto,
              ) {
                return this.paymentsService.getPayments(req.user.id, filters);
              }

                @Get(':id')
              @ApiOperation({ summary: 'Get a specific payment by ID' })
              @ApiResponse({
                status: 200,
                description: 'Payment retrieved successfully',
                type: PaymentResponseDto,
              })
              @ApiResponse({
                status: 404,
                description: 'Payment not found',
              })
              @ApiParam({ name: 'id', description: 'Payment ID' })
              async getPayment(@Param('id') id: string, @Request() req) {
                return this.paymentsService.getPayment(id, req.user.id);
              }

  @Get('booking/:bookingId')
  @ApiOperation({ summary: 'Get payments for a specific booking' })
  @ApiResponse({
    status: 200,
    description: 'Booking payments retrieved successfully',
  })
  @ApiParam({ name: 'bookingId', description: 'Booking ID' })
  async getBookingPayments(@Param('bookingId') bookingId: string, @Request() req) {
    return this.paymentsService.getBookingPayments(bookingId, req.user.id);
  }

  @Post('stripe/webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Stripe webhook endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Webhook processed successfully',
  })
  async stripeWebhook(@Body() payload: any, @Request() req) {
    return this.paymentsService.handleStripeWebhook(payload, req.headers);
  }

                @Post('sitter/connect')
              @ApiOperation({ summary: 'Create Stripe Connect account for sitter' })
              @ApiResponse({
                status: 201,
                description: 'Stripe Connect account created successfully',
                type: StripeConnectResponseDto,
              })
              async createSitterConnectAccount(@Request() req) {
                return this.paymentsService.createSitterConnectAccount(req.user.id);
              }

  @Get('sitter/connect/status')
  @ApiOperation({ summary: 'Get sitter Stripe Connect account status' })
  @ApiResponse({
    status: 200,
    description: 'Connect account status retrieved successfully',
  })
  async getSitterConnectStatus(@Request() req) {
    return this.paymentsService.getSitterConnectStatus(req.user.id);
  }

  @Post('sitter/connect/onboarding')
  @ApiOperation({ summary: 'Complete sitter Stripe Connect onboarding' })
  @ApiResponse({
    status: 200,
    description: 'Onboarding completed successfully',
  })
  async completeSitterOnboarding(@Request() req) {
    return this.paymentsService.completeSitterOnboarding(req.user.id);
  }

                @Post('sitter/payout')
              @ApiOperation({ summary: 'Request payout for sitter' })
              @ApiResponse({
                status: 200,
                description: 'Payout requested successfully',
              })
              async requestSitterPayout(
                @Request() req,
                @Body() payoutDto: SitterPayoutDto,
              ) {
                return this.paymentsService.requestSitterPayout(req.user.id, payoutDto.amount);
              }

                @Get('sitter/earnings')
              @ApiOperation({ summary: 'Get sitter earnings summary' })
              @ApiResponse({
                status: 200,
                description: 'Earnings summary retrieved successfully',
                type: SitterEarningsDto,
              })
              @ApiQuery({ name: 'period', required: false, enum: ['week', 'month', 'year'] })
              async getSitterEarnings(
                @Request() req,
                @Query('period') period: string = 'month',
              ) {
                return this.paymentsService.getSitterEarnings(req.user.id, period);
              }

                @Get('sitter/payouts')
              @ApiOperation({ summary: 'Get sitter payout history' })
              @ApiResponse({
                status: 200,
                description: 'Payout history retrieved successfully',
                type: [PayoutHistoryDto],
              })
              async getSitterPayouts(@Request() req) {
                return this.paymentsService.getSitterPayouts(req.user.id);
              }

  @Post('parent/add-payment-method')
  @ApiOperation({ summary: 'Add payment method for parent' })
  @ApiResponse({
    status: 201,
    description: 'Payment method added successfully',
  })
  async addParentPaymentMethod(
    @Request() req,
    @Body() paymentMethodData: { token: string; type: string },
  ) {
    return this.paymentsService.addParentPaymentMethod(req.user.id, paymentMethodData);
  }

  @Get('parent/payment-methods')
  @ApiOperation({ summary: 'Get parent payment methods' })
  @ApiResponse({
    status: 200,
    description: 'Payment methods retrieved successfully',
  })
  async getParentPaymentMethods(@Request() req) {
    return this.paymentsService.getParentPaymentMethods(req.user.id);
  }

  @Delete('parent/payment-methods/:methodId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove parent payment method' })
  @ApiResponse({
    status: 204,
    description: 'Payment method removed successfully',
  })
  @ApiParam({ name: 'methodId', description: 'Payment Method ID' })
  async removeParentPaymentMethod(
    @Param('methodId') methodId: string,
    @Request() req,
  ) {
    return this.paymentsService.removeParentPaymentMethod(req.user.id, methodId);
  }
} 