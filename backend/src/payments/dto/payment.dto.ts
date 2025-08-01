import { IsString, IsNumber, IsOptional, IsEnum, IsUUID, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  CARD = 'card',
  BANK_TRANSFER = 'bank_transfer',
  WALLET = 'wallet',
}

export class CreatePaymentIntentDto {
  @ApiProperty({ description: 'Booking ID' })
  @IsUUID()
  bookingId: string;

  @ApiPropertyOptional({ description: 'Payment method ID' })
  @IsOptional()
  @IsString()
  paymentMethodId?: string;
}

export class ProcessPaymentDto {
  @ApiProperty({ description: 'Payment intent ID' })
  @IsString()
  paymentIntentId: string;
}

export class RefundPaymentDto {
  @ApiPropertyOptional({ description: 'Refund reason' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class PaymentFiltersDto {
  @ApiPropertyOptional({ enum: PaymentStatus })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @ApiPropertyOptional({ minimum: 1 })
  @IsOptional()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 100 })
  @IsOptional()
  @Min(1)
  @Max(100)
  limit?: number;
}

export class SitterPayoutDto {
  @ApiProperty({ description: 'Payout amount', minimum: 1 })
  @IsNumber()
  @Min(1)
  amount: number;
}

export class PaymentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  bookingId: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  currency: string;

  @ApiProperty({ enum: PaymentStatus })
  status: PaymentStatus;

  @ApiProperty({ enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @ApiProperty()
  createdAt: Date;

  @ApiPropertyOptional()
  processedAt?: Date;

  @ApiPropertyOptional()
  stripePaymentIntentId?: string;

  @ApiPropertyOptional()
  stripeTransferId?: string;
}

export class PaymentIntentResponseDto {
  @ApiProperty()
  paymentIntentId: string;

  @ApiProperty()
  clientSecret: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  platformFee: number;

  @ApiProperty()
  sitterPayout: number;
}

export class StripeConnectResponseDto {
  @ApiProperty()
  accountId: string;

  @ApiProperty()
  onboardingUrl: string;
}

export class StripeConnectStatusDto {
  @ApiProperty()
  hasAccount: boolean;

  @ApiPropertyOptional()
  accountId?: string;

  @ApiPropertyOptional()
  status?: string;

  @ApiPropertyOptional()
  payoutsEnabled?: boolean;

  @ApiPropertyOptional()
  requirements?: any;

  @ApiPropertyOptional()
  onboardingUrl?: string;
}

export class SitterEarningsDto {
  @ApiProperty()
  period: string;

  @ApiProperty()
  totalEarnings: number;

  @ApiProperty()
  platformFees: number;

  @ApiProperty()
  netEarnings: number;

  @ApiProperty()
  paymentCount: number;

  @ApiProperty()
  averagePerBooking: number;
}

export class PayoutHistoryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  arrivalDate: Date;

  @ApiProperty()
  created: Date;
} 