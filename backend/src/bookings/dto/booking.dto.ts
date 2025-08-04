import { IsString, IsNumber, IsOptional, IsDateString, IsArray, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  DISPUTED = 'disputed',
}

export class CreateBookingDto {
  @ApiProperty({ description: 'Sitter ID' })
  @IsString()
  sitterId: string;

  @ApiProperty({ description: 'Parent ID' })
  @IsString()
  parentId: string;

  @ApiProperty({ description: 'Start time' })
  @IsDateString()
  startTime: string;

  @ApiProperty({ description: 'End time' })
  @IsDateString()
  endTime: string;

  @ApiProperty({ description: 'Number of children' })
  @IsNumber()
  childrenCount: number;

  @ApiPropertyOptional({ description: 'Duration in minutes' })
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiPropertyOptional({ description: 'Hourly rate' })
  @IsOptional()
  @IsNumber()
  hourlyRate?: number;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Requirements' })
  @IsOptional()
  @IsString()
  requirements?: string;

  @ApiPropertyOptional({ description: 'Location' })
  @IsOptional()
  @IsString()
  location?: string;
}

export class UpdateBookingDto {
  @ApiPropertyOptional({ description: 'Start time' })
  @IsOptional()
  @IsDateString()
  startTime?: string;

  @ApiPropertyOptional({ description: 'End time' })
  @IsOptional()
  @IsDateString()
  endTime?: string;

  @ApiPropertyOptional({ description: 'Duration in minutes' })
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiPropertyOptional({ description: 'Hourly rate' })
  @IsOptional()
  @IsNumber()
  hourlyRate?: number;

  @ApiPropertyOptional({ description: 'Status' })
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Requirements' })
  @IsOptional()
  @IsString()
  requirements?: string;

  @ApiPropertyOptional({ description: 'Location' })
  @IsOptional()
  @IsString()
  location?: string;
}

export class BookingFiltersDto {
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

export class BookingStatusDto {
  @ApiProperty({ description: 'Booking status' })
  @IsEnum(BookingStatus)
  status: BookingStatus;
} 