import { 
  IsString, 
  IsEmail, 
  IsNotEmpty, 
  IsOptional, 
  IsNumber, 
  IsBoolean, 
  IsArray, 
  IsUUID, 
  IsDateString,
  IsPhoneNumber,
  IsUrl,
  MinLength, 
  MaxLength, 
  Min, 
  Max,
  Matches,
  ValidateNested,
  IsEnum,
  ArrayMaxSize,
  ArrayMinSize
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Base validation with security enhancements
 */
export class SecureBaseDto {
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  protected sanitizeString(value: string): string {
    return value;
  }
}

/**
 * Enhanced Authentication DTOs
 */
export class SecureLoginDto extends SecureBaseDto {
  @ApiProperty({ example: 'user@nannyradar.com' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  @MaxLength(255, { message: 'Email must not exceed 255 characters' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @ApiProperty({ example: 'SecurePassword123!' })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  })
  password: string;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean({ message: 'Remember me must be a boolean' })
  rememberMe?: boolean;
}

export class SecureRegisterDto extends SecureBaseDto {
  @ApiProperty({ example: 'John' })
  @IsString({ message: 'First name must be a string' })
  @IsNotEmpty({ message: 'First name is required' })
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  @MaxLength(50, { message: 'First name must not exceed 50 characters' })
  @Matches(/^[a-zA-Z\s'-]+$/, { message: 'First name can only contain letters, spaces, hyphens, and apostrophes' })
  @Transform(({ value }) => value?.trim())
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString({ message: 'Last name must be a string' })
  @IsNotEmpty({ message: 'Last name is required' })
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Last name must not exceed 50 characters' })
  @Matches(/^[a-zA-Z\s'-]+$/, { message: 'Last name can only contain letters, spaces, hyphens, and apostrophes' })
  @Transform(({ value }) => value?.trim())
  lastName: string;

  @ApiProperty({ example: 'user@nannyradar.com' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  @MaxLength(255, { message: 'Email must not exceed 255 characters' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @ApiProperty({ example: '+1234567890' })
  @IsPhoneNumber(null, { message: 'Please provide a valid phone number' })
  @IsNotEmpty({ message: 'Phone number is required' })
  phone: string;

  @ApiProperty({ example: 'SecurePassword123!' })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  })
  password: string;

  @ApiProperty({ example: 'parent', enum: ['parent', 'sitter'] })
  @IsEnum(['parent', 'sitter'], { message: 'Role must be either parent or sitter' })
  @IsNotEmpty({ message: 'Role is required' })
  role: 'parent' | 'sitter';
}

/**
 * Enhanced Search and Query DTOs
 */
export class SecureSearchDto extends SecureBaseDto {
  @ApiProperty({ example: 'babysitter near me', required: false })
  @IsOptional()
  @IsString({ message: 'Search query must be a string' })
  @MaxLength(200, { message: 'Search query must not exceed 200 characters' })
  @Matches(/^[a-zA-Z0-9\s\-_.,!?]+$/, { message: 'Search query contains invalid characters' })
  @Transform(({ value }) => value?.trim())
  q?: string;

  @ApiProperty({ example: 40.7128, required: false })
  @IsOptional()
  @IsNumber({}, { message: 'Latitude must be a number' })
  @Min(-90, { message: 'Latitude must be between -90 and 90' })
  @Max(90, { message: 'Latitude must be between -90 and 90' })
  latitude?: number;

  @ApiProperty({ example: -74.0060, required: false })
  @IsOptional()
  @IsNumber({}, { message: 'Longitude must be a number' })
  @Min(-180, { message: 'Longitude must be between -180 and 180' })
  @Max(180, { message: 'Longitude must be between -180 and 180' })
  longitude?: number;

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  @IsNumber({}, { message: 'Radius must be a number' })
  @Min(1, { message: 'Radius must be at least 1 mile' })
  @Max(100, { message: 'Radius must not exceed 100 miles' })
  radius?: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber({}, { message: 'Page must be a number' })
  @Min(1, { message: 'Page must be at least 1' })
  @Max(1000, { message: 'Page must not exceed 1000' })
  page?: number = 1;

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  @IsNumber({}, { message: 'Limit must be a number' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit must not exceed 100' })
  limit?: number = 10;
}

/**
 * Enhanced Booking DTOs
 */
export class SecureCreateBookingDto extends SecureBaseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID(4, { message: 'Sitter ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Sitter ID is required' })
  sitterId: string;

  @ApiProperty({ example: '2024-12-25T18:00:00Z' })
  @IsDateString({}, { message: 'Start time must be a valid ISO date string' })
  @IsNotEmpty({ message: 'Start time is required' })
  startTime: string;

  @ApiProperty({ example: '2024-12-25T22:00:00Z' })
  @IsDateString({}, { message: 'End time must be a valid ISO date string' })
  @IsNotEmpty({ message: 'End time is required' })
  endTime: string;

  @ApiProperty({ example: 2 })
  @IsNumber({}, { message: 'Number of children must be a number' })
  @Min(1, { message: 'Number of children must be at least 1' })
  @Max(10, { message: 'Number of children must not exceed 10' })
  numberOfChildren: number;

  @ApiProperty({ example: 'Please take care of my 2 kids', required: false })
  @IsOptional()
  @IsString({ message: 'Special instructions must be a string' })
  @MaxLength(1000, { message: 'Special instructions must not exceed 1000 characters' })
  @Transform(({ value }) => value?.trim())
  specialInstructions?: string;

  @ApiProperty({ example: { street: '123 Main St', city: 'New York', state: 'NY', zipCode: '10001' } })
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;
}

export class AddressDto extends SecureBaseDto {
  @ApiProperty({ example: '123 Main St' })
  @IsString({ message: 'Street must be a string' })
  @IsNotEmpty({ message: 'Street is required' })
  @MaxLength(200, { message: 'Street must not exceed 200 characters' })
  @Matches(/^[a-zA-Z0-9\s\-.,#]+$/, { message: 'Street contains invalid characters' })
  @Transform(({ value }) => value?.trim())
  street: string;

  @ApiProperty({ example: 'New York' })
  @IsString({ message: 'City must be a string' })
  @IsNotEmpty({ message: 'City is required' })
  @MaxLength(100, { message: 'City must not exceed 100 characters' })
  @Matches(/^[a-zA-Z\s\-']+$/, { message: 'City can only contain letters, spaces, hyphens, and apostrophes' })
  @Transform(({ value }) => value?.trim())
  city: string;

  @ApiProperty({ example: 'NY' })
  @IsString({ message: 'State must be a string' })
  @IsNotEmpty({ message: 'State is required' })
  @MinLength(2, { message: 'State must be at least 2 characters' })
  @MaxLength(50, { message: 'State must not exceed 50 characters' })
  @Transform(({ value }) => value?.trim())
  state: string;

  @ApiProperty({ example: '10001' })
  @IsString({ message: 'ZIP code must be a string' })
  @IsNotEmpty({ message: 'ZIP code is required' })
  @Matches(/^\d{5}(-\d{4})?$/, { message: 'ZIP code must be in format 12345 or 12345-6789' })
  zipCode: string;
}

/**
 * Enhanced Payment DTOs
 */
export class SecurePaymentDto extends SecureBaseDto {
  @ApiProperty({ example: 6000 })
  @IsNumber({}, { message: 'Amount must be a number' })
  @Min(100, { message: 'Amount must be at least $1.00' })
  @Max(100000, { message: 'Amount must not exceed $1,000.00' })
  amount: number;

  @ApiProperty({ example: 'usd' })
  @IsString({ message: 'Currency must be a string' })
  @IsEnum(['usd'], { message: 'Currency must be USD' })
  currency: string = 'usd';

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID(4, { message: 'Booking ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Booking ID is required' })
  bookingId: string;
}

/**
 * Enhanced Message DTOs
 */
export class SecureMessageDto extends SecureBaseDto {
  @ApiProperty({ example: 'Hello, I have a question about the booking' })
  @IsString({ message: 'Message must be a string' })
  @IsNotEmpty({ message: 'Message is required' })
  @MinLength(1, { message: 'Message must not be empty' })
  @MaxLength(2000, { message: 'Message must not exceed 2000 characters' })
  @Matches(/^[a-zA-Z0-9\s\-_.,!?'"()@#$%&*+=\[\]{}|\\:;<>\/~`]+$/, { 
    message: 'Message contains invalid characters' 
  })
  @Transform(({ value }) => value?.trim())
  content: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID(4, { message: 'Recipient ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Recipient ID is required' })
  recipientId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', required: false })
  @IsOptional()
  @IsUUID(4, { message: 'Booking ID must be a valid UUID' })
  bookingId?: string;
}

/**
 * Enhanced File Upload DTOs
 */
export class SecureFileUploadDto extends SecureBaseDto {
  @ApiProperty({ example: 'profile_picture' })
  @IsString({ message: 'File type must be a string' })
  @IsEnum(['profile_picture', 'document', 'background_check'], { 
    message: 'File type must be profile_picture, document, or background_check' 
  })
  fileType: string;

  @ApiProperty({ example: 'image/jpeg' })
  @IsString({ message: 'MIME type must be a string' })
  @Matches(/^(image\/(jpeg|jpg|png|gif|webp)|application\/pdf)$/, { 
    message: 'Only JPEG, PNG, GIF, WebP images and PDF documents are allowed' 
  })
  mimeType: string;

  @ApiProperty({ example: 1048576 })
  @IsNumber({}, { message: 'File size must be a number' })
  @Min(1, { message: 'File size must be at least 1 byte' })
  @Max(10485760, { message: 'File size must not exceed 10MB' })
  fileSize: number;
}
