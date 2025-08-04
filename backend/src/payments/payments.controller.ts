import { Controller, Post, Get, Put, Delete, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserType } from '../entities/user.entity';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { RefundPaymentDto } from './dto/refund-payment.dto';
import { AddPaymentMethodDto } from './dto/add-payment-method.dto';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-payment-intent')
  @ApiOperation({ summary: 'Create payment intent' })
  @ApiResponse({ status: 201, description: 'Payment intent created' })
  async createPaymentIntent(@Request() req, @Body() createIntentDto: CreatePaymentIntentDto) {
    return this.paymentsService.createPaymentIntent(
      createIntentDto.amount,
      createIntentDto.currency
    );
  }

  @Post('process-payment')
  @ApiOperation({ summary: 'Process payment' })
  @ApiResponse({ status: 200, description: 'Payment processed' })
  async processPayment(@Request() req, @Body() processPaymentDto: ProcessPaymentDto) {
    return this.paymentsService.processPayment(req.user.id, processPaymentDto.paymentIntentId);
  }

  @Get()
  @ApiOperation({ summary: 'Get user payments' })
  @ApiResponse({ status: 200, description: 'Payments retrieved' })
  async getUserPayments(@Request() req, @Query() query: any) {
    return this.paymentsService.getPayments(req.user.id, query);
  }

  @Post('refund')
  @ApiOperation({ summary: 'Request refund' })
  @ApiResponse({ status: 200, description: 'Refund requested' })
  async requestRefund(@Request() req, @Body() refundDto: RefundPaymentDto) {
    // Placeholder implementation
    return { message: 'Refund requested' };
  }

  @Post('payment-methods')
  @ApiOperation({ summary: 'Add payment method' })
  @ApiResponse({ status: 201, description: 'Payment method added' })
  async addPaymentMethod(@Request() req, @Body() addMethodDto: AddPaymentMethodDto) {
    // Placeholder implementation
    return { message: 'Payment method added' };
  }

  @Post('payment-methods/:methodId/default')
  @ApiOperation({ summary: 'Set default payment method' })
  @ApiResponse({ status: 200, description: 'Default payment method set' })
  async setDefaultPaymentMethod(@Request() req, @Param('methodId') methodId: string) {
    // Placeholder implementation
    return { message: 'Default payment method set' };
  }

  @Delete('methods/:methodId')
  @ApiOperation({ summary: 'Remove payment method' })
  @ApiResponse({ status: 200, description: 'Payment method removed' })
  async removePaymentMethod(@Request() req, @Param('methodId') methodId: string) {
    return this.paymentsService.removeParentPaymentMethod(req.user.id, methodId);
  }

  @Get('earnings')
  @ApiOperation({ summary: 'Get sitter earnings' })
  @ApiResponse({ status: 200, description: 'Earnings retrieved' })
  async getEarnings(@Request() req, @Query() query: any) {
    // Placeholder implementation
    return { earnings: 0 };
  }

  @Post('withdrawals')
  @ApiOperation({ summary: 'Request withdrawal' })
  @ApiResponse({ status: 200, description: 'Withdrawal requested' })
  async requestWithdrawal(@Request() req, @Body() withdrawalData: any) {
    // Placeholder implementation
    return { message: 'Withdrawal requested' };
  }

  @Get('withdrawals')
  @ApiOperation({ summary: 'Get withdrawals' })
  @ApiResponse({ status: 200, description: 'Withdrawals retrieved' })
  async getWithdrawals(@Request() req) {
    // Placeholder implementation
    return { withdrawals: [] };
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Handle Stripe webhook' })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  async handleWebhook(@Body() event: any, @Request() req) {
    // Placeholder implementation
    return { message: 'Webhook processed' };
  }

  @Get('admin/payments')
  @ApiOperation({ summary: 'Get all payments (admin)' })
  @ApiResponse({ status: 200, description: 'All payments retrieved' })
  async getAllPayments(@Query() query: any) {
    return this.paymentsService.getPayments('admin', query);
  }

  @Post('admin/refunds/:id')
  @ApiOperation({ summary: 'Process refund (admin)' })
  @ApiResponse({ status: 200, description: 'Refund processed' })
  async processRefund(@Param('id') id: string, @Body() refundData: any) {
    // Placeholder implementation
    return { message: 'Refund processed' };
  }

  @Post('admin/transfers/:id')
  @ApiOperation({ summary: 'Process transfer (admin)' })
  @ApiResponse({ status: 200, description: 'Transfer processed' })
  async processTransfer(@Param('id') id: string, @Body() transferData: any) {
    // Placeholder implementation
    return { message: 'Transfer processed' };
  }

  @Get('admin/analytics')
  @ApiOperation({ summary: 'Get payment analytics (admin)' })
  @ApiResponse({ status: 200, description: 'Analytics retrieved' })
  async getPaymentAnalytics(@Query() query: any) {
    // Placeholder implementation
    return { analytics: {} };
  }

  @Get('admin/disputes')
  @ApiOperation({ summary: 'Get disputes (admin)' })
  @ApiResponse({ status: 200, description: 'Disputes retrieved' })
  async getDisputes() {
    // Placeholder implementation
    return { disputes: [] };
  }

  @Post('admin/disputes/:disputeId/resolve')
  @ApiOperation({ summary: 'Resolve dispute (admin)' })
  @ApiResponse({ status: 200, description: 'Dispute resolved' })
  async resolveDispute(@Param('disputeId') disputeId: string, @Body() resolutionData: any) {
    // Placeholder implementation
    return { message: 'Dispute resolved' };
  }
} 