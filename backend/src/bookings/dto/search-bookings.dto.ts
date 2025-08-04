import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  DISPUTED = 'disputed',
}

export class SearchBookingsDto {
  @ApiPropertyOptional({ description: 'Status filter' })
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @ApiPropertyOptional({ description: 'Start date' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Sitter ID' })
  @IsOptional()
  @IsString()
  sitterId?: string;

  @ApiPropertyOptional({ description: 'Parent ID' })
  @IsOptional()
  @IsString()
  parentId?: string;
} 