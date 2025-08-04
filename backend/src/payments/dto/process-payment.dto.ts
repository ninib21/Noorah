import { IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ProcessPaymentDto {
  @ApiProperty({ description: 'Payment intent ID' })
  @IsString()
  paymentIntentId: string;

  @ApiProperty({ description: 'Amount in cents' })
  @IsNumber()
  amount: number;
} 