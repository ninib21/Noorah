import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, IsEnum, MinLength, IsPhoneNumber } from 'class-validator';

export enum UserType {
  PARENT = 'parent',
  SITTER = 'sitter',
  ADMIN = 'admin',
}

export class RegisterDto {
  @ApiProperty({ description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User phone number' })
  @IsPhoneNumber()
  phone: string;

  @ApiProperty({ description: 'User password', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ description: 'User type', enum: UserType })
  @IsEnum(UserType)
  userType: UserType;

  @ApiProperty({ description: 'User first name' })
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'User last name' })
  @IsString()
  lastName: string;
}

export class LoginDto {
  @ApiProperty({ description: 'User email address (optional if phone provided)' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'User phone number (optional if email provided)' })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @ApiProperty({ description: 'User password' })
  @IsString()
  password: string;
}

export class VerifyOtpDto {
  @ApiProperty({ description: 'User email address (optional if phone provided)' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'User phone number (optional if email provided)' })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @ApiProperty({ description: 'OTP code (6 digits)' })
  @IsString()
  otp: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ description: 'User email address (optional if phone provided)' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'User phone number (optional if email provided)' })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;
}

export class ResetPasswordDto {
  @ApiProperty({ description: 'Reset token received via email/SMS' })
  @IsString()
  token: string;

  @ApiProperty({ description: 'New password', minLength: 8 })
  @IsString()
  @MinLength(8)
  newPassword: string;
}

export class RefreshTokenDto {
  @ApiProperty({ description: 'Refresh token' })
  @IsString()
  refreshToken: string;
}

export class ChangePasswordDto {
  @ApiProperty({ description: 'Current password' })
  @IsString()
  currentPassword: string;

  @ApiProperty({ description: 'New password', minLength: 8 })
  @IsString()
  @MinLength(8)
  newPassword: string;
}

export class ToggleMFADto {
  @ApiProperty({ description: 'Enable or disable MFA' })
  enable: boolean;
}

export class AuthResponseDto {
  @ApiProperty({ description: 'JWT access token' })
  accessToken: string;

  @ApiProperty({ description: 'JWT refresh token' })
  refreshToken: string;

  @ApiProperty({ description: 'User information' })
  user: {
    id: string;
    email: string;
    phone: string;
    userType: UserType;
    firstName: string;
    lastName: string;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    mfaEnabled: boolean;
    lastLoginAt: Date;
  };
}

export class OtpResponseDto {
  @ApiProperty({ description: 'Success message' })
  message: string;

  @ApiProperty({ description: 'OTP identifier' })
  otpId: string;
}

export class MessageResponseDto {
  @ApiProperty({ description: 'Response message' })
  message: string;
}

export class AccessTokenResponseDto {
  @ApiProperty({ description: 'JWT access token' })
  accessToken: string;
}

export class MFAStatusResponseDto {
  @ApiProperty({ description: 'Response message' })
  message: string;

  @ApiProperty({ description: 'MFA enabled status' })
  mfaEnabled: boolean;
} 