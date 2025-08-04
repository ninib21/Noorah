import { IsEmail, IsString, MinLength, IsEnum, IsOptional, IsPhoneNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserType } from '../../entities/user.entity';

export class RegisterDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'password123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
  })
  @IsString()
  lastName: string;

  @ApiProperty({
    description: 'User phone number',
    example: '+1234567890',
    required: false,
  })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @ApiProperty({
    description: 'User type',
    enum: UserType,
    example: UserType.PARENT,
  })
  @IsEnum(UserType)
  userType: UserType;

  @ApiProperty({
    description: 'Profile picture URL',
    required: false,
    example: 'https://example.com/profile.jpg',
  })
  @IsOptional()
  @IsString()
  profilePicture?: string;
} 