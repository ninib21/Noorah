import { IsString, IsOptional, IsNumber, IsObject, IsArray, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSitterProfileDto {
  @ApiPropertyOptional({ description: 'Sitter bio' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ description: 'Hourly rate' })
  @IsNumber()
  @Min(0)
  hourlyRate: number;

  @ApiPropertyOptional({ description: 'Location string' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'Skills JSON string' })
  @IsOptional()
  @IsString()
  skills?: string;

  @ApiPropertyOptional({ description: 'Certifications JSON string' })
  @IsOptional()
  @IsString()
  certifications?: string;

  @ApiPropertyOptional({ description: 'Availability JSON string' })
  @IsOptional()
  @IsString()
  availability?: string;

  @ApiPropertyOptional({ description: 'Languages JSON string' })
  @IsOptional()
  @IsString()
  languages?: string;

  @ApiPropertyOptional({ description: 'Service areas JSON string' })
  @IsOptional()
  @IsString()
  serviceAreas?: string;

  @ApiPropertyOptional({ description: 'Specializations JSON string' })
  @IsOptional()
  @IsString()
  specializations?: string;
}

export class UpdateSitterProfileDto {
  @ApiPropertyOptional({ description: 'Sitter bio' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ description: 'Hourly rate' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  hourlyRate?: number;

  @ApiPropertyOptional({ description: 'Location string' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'Skills JSON string' })
  @IsOptional()
  @IsString()
  skills?: string;

  @ApiPropertyOptional({ description: 'Certifications JSON string' })
  @IsOptional()
  @IsString()
  certifications?: string;

  @ApiPropertyOptional({ description: 'Availability JSON string' })
  @IsOptional()
  @IsString()
  availability?: string;

  @ApiPropertyOptional({ description: 'Languages JSON string' })
  @IsOptional()
  @IsString()
  languages?: string;

  @ApiPropertyOptional({ description: 'Service areas JSON string' })
  @IsOptional()
  @IsString()
  serviceAreas?: string;

  @ApiPropertyOptional({ description: 'Specializations JSON string' })
  @IsOptional()
  @IsString()
  specializations?: string;
}

export class SitterSearchDto {
  @ApiPropertyOptional({ description: 'Search query' })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({ description: 'Location' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'Radius in kilometers' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  radius?: number;

  @ApiPropertyOptional({ description: 'Minimum rating' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  minRating?: number;

  @ApiPropertyOptional({ description: 'Maximum hourly rate' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ description: 'Availability dates' })
  @IsOptional()
  @IsArray()
  availability?: string[];

  @ApiPropertyOptional({ description: 'Required skills' })
  @IsOptional()
  @IsArray()
  skills?: string[];

  @ApiPropertyOptional({ description: 'Required languages' })
  @IsOptional()
  @IsArray()
  languages?: string[];

  @ApiPropertyOptional({ description: 'Page number' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}

export class AvailabilityDto {
  @ApiProperty({ description: 'Day of week' })
  @IsString()
  day: string;

  @ApiProperty({ description: 'Start time' })
  @IsString()
  startTime: string;

  @ApiProperty({ description: 'End time' })
  @IsString()
  endTime: string;

  @ApiProperty({ description: 'Is available' })
  isAvailable: boolean;
} 