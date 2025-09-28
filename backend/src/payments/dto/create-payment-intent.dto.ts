import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePaymentIntentDto {
  @ApiProperty({ description: 'Amount in cents' })
  @IsNumber()
  amount: number;

  @ApiProperty({ description: 'Currency' })
  @IsString()
  currency: string;

  @ApiPropertyOptional({ description: 'Booking ID' })
  @IsOptional()
  @IsString()
  bookingId?: string;
} 
