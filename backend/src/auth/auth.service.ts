import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserType } from '../entities/user.entity';
import { SitterProfile } from '../entities/sitter-profile.entity';
import { ParentProfile } from '../entities/parent-profile.entity';
import {
  RegisterDto,
  LoginDto,
  VerifyOtpDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  RefreshTokenDto,
} from './dto/auth.dto';

export interface JwtPayload {
  sub: string;
  email: string;
  userType: UserType;
  mfaEnabled: boolean;
  mfaVerified: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
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

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(SitterProfile)
    private readonly sitterProfileRepository: Repository<SitterProfile>,
    @InjectRepository(ParentProfile)
    private readonly parentProfileRepository: Repository<ParentProfile>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Register a new user
   */
  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const { email, phone, password, userType, firstName, lastName } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { phone }],
    });

    if (existingUser) {
      throw new BadRequestException('User with this email or phone already exists');
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = this.userRepository.create({
      email,
      phone,
      passwordHash: hashedPassword,
      userType,
      firstName,
      lastName,
      isEmailVerified: false,
      isPhoneVerified: false,
      mfaEnabled: false,
      lastLoginAt: new Date(),
    });

    const savedUser = await this.userRepository.save(user);

    // Create profile based on user type
    if (userType === 'sitter') {
      const sitterProfile = this.sitterProfileRepository.create({
        userId: savedUser.id,
        bio: '',
        hourlyRate: 0,
        experience: 0,
        certifications: [],
        availability: [],
        backgroundCheckStatus: 'pending',
        rating: 0,
        totalReviews: 0,
      });
      await this.sitterProfileRepository.save(sitterProfile);
    } else if (userType === 'parent') {
      const parentProfile = this.parentProfileRepository.create({
        userId: savedUser.id,
        address: '',
        emergencyContacts: [],
        childrenProfiles: [],
        paymentMethods: [],
        subscriptionTier: 'free',
      });
      await this.parentProfileRepository.save(parentProfile);
    }

    // Generate tokens
    const tokens = await this.generateTokens(savedUser);

    return {
      ...tokens,
      user: {
        id: savedUser.id,
        email: savedUser.email,
        phone: savedUser.phone,
        userType: savedUser.userType,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        isEmailVerified: savedUser.isEmailVerified,
        isPhoneVerified: savedUser.isPhoneVerified,
        mfaEnabled: savedUser.mfaEnabled,
        lastLoginAt: savedUser.lastLoginAt,
      },
    };
  }

  /**
   * Login with email/phone and password
   */
  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, phone, password } = loginDto;

    // Find user by email or phone
    const user = await this.userRepository.findOne({
      where: email ? { email } : { phone },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        firstName: user.firstName,
        lastName: user.lastName,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        mfaEnabled: user.mfaEnabled,
        lastLoginAt: user.lastLoginAt,
      },
    };
  }

  /**
   * Send OTP for login
   */
  async sendLoginOtp(email?: string, phone?: string): Promise<{ message: string; otpId: string }> {
    const user = await this.userRepository.findOne({
      where: email ? { email } : { phone },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Generate OTP (6 digits)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpId = `otp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Store OTP in database with expiration (5 minutes)
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    
    // In a real implementation, you would store this in a separate OTP table
    // For now, we'll store it in the user entity temporarily
    user.otpHash = await bcrypt.hash(otp, 10);
    user.otpExpiry = otpExpiry;
    await this.userRepository.save(user);

    // Send OTP via email/SMS (placeholder)
    if (email) {
      // Send email OTP
      console.log(`Sending OTP ${otp} to email: ${email}`);
    } else if (phone) {
      // Send SMS OTP
      console.log(`Sending OTP ${otp} to phone: ${phone}`);
    }

    return {
      message: 'OTP sent successfully',
      otpId,
    };
  }

  /**
   * Verify OTP and login
   */
  async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<AuthResponse> {
    const { email, phone, otp } = verifyOtpDto;

    const user = await this.userRepository.findOne({
      where: email ? { email } : { phone },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Check if OTP exists and is not expired
    if (!user.otpHash || !user.otpExpiry || user.otpExpiry < new Date()) {
      throw new BadRequestException('OTP expired or not found');
    }

    // Verify OTP
    const isOtpValid = await bcrypt.compare(otp, user.otpHash);
    if (!isOtpValid) {
      throw new UnauthorizedException('Invalid OTP');
    }

    // Clear OTP
    user.otpHash = null;
    user.otpExpiry = null;
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        firstName: user.firstName,
        lastName: user.lastName,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        mfaEnabled: user.mfaEnabled,
        lastLoginAt: user.lastLoginAt,
      },
    };
  }

  /**
   * Send password reset email/OTP
   */
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    const { email, phone } = forgotPasswordDto;

    const user = await this.userRepository.findOne({
      where: email ? { email } : { phone },
    });

    if (!user) {
      // Don't reveal if user exists
      return { message: 'If the email/phone exists, a reset link has been sent' };
    }

    // Generate reset token
    const resetToken = await this.jwtService.signAsync(
      { sub: user.id, type: 'password_reset' },
      { expiresIn: '1h' }
    );

    // Store reset token hash
    user.resetTokenHash = await bcrypt.hash(resetToken, 10);
    user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await this.userRepository.save(user);

    // Send reset email/SMS (placeholder)
    if (email) {
      console.log(`Sending password reset link to: ${email}`);
    } else if (phone) {
      console.log(`Sending password reset SMS to: ${phone}`);
    }

    return { message: 'If the email/phone exists, a reset link has been sent' };
  }

  /**
   * Reset password with token
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    const { token, newPassword } = resetPasswordDto;

    try {
      // Verify token
      const payload = await this.jwtService.verifyAsync(token);
      
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user || !user.resetTokenHash || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
        throw new BadRequestException('Invalid or expired reset token');
      }

      // Verify token hash
      const isTokenValid = await bcrypt.compare(token, user.resetTokenHash);
      if (!isTokenValid) {
        throw new BadRequestException('Invalid reset token');
      }

      // Update password
      const saltRounds = 12;
      user.passwordHash = await bcrypt.hash(newPassword, saltRounds);
      user.resetTokenHash = null;
      user.resetTokenExpiry = null;
      await this.userRepository.save(user);

      return { message: 'Password reset successfully' };
    } catch (error) {
      throw new BadRequestException('Invalid or expired reset token');
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<{ accessToken: string }> {
    const { refreshToken } = refreshTokenDto;

    try {
      // Verify refresh token
      const payload = await this.jwtService.verifyAsync(refreshToken);
      
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate new access token
      const accessToken = await this.generateAccessToken(user);

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Get user profile
   */
  async getProfile(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      userType: user.userType,
      firstName: user.firstName,
      lastName: user.lastName,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
      mfaEnabled: user.mfaEnabled,
      lastLoginAt: user.lastLoginAt,
    };
  }

  /**
   * Logout user
   */
  async logout(userId: string): Promise<{ message: string }> {
    // In a real implementation, you might want to blacklist the refresh token
    // For now, we'll just return a success message
    return { message: 'Logged out successfully' };
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(email: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email already verified');
    }

    // Generate verification token
    const verificationToken = await this.jwtService.signAsync(
      { sub: user.id, type: 'email_verification' },
      { expiresIn: '24h' }
    );

    // Store verification token hash
    user.emailVerificationTokenHash = await bcrypt.hash(verificationToken, 10);
    user.emailVerificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await this.userRepository.save(user);

    // Send verification email (placeholder)
    console.log(`Sending email verification to: ${email}`);

    return { message: 'Verification email sent' };
  }

  /**
   * Confirm email verification
   */
  async confirmEmailVerification(token: string): Promise<{ message: string }> {
    try {
      // Verify token
      const payload = await this.jwtService.verifyAsync(token);
      
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user || !user.emailVerificationTokenHash || !user.emailVerificationExpiry || user.emailVerificationExpiry < new Date()) {
        throw new BadRequestException('Invalid or expired verification token');
      }

      // Verify token hash
      const isTokenValid = await bcrypt.compare(token, user.emailVerificationTokenHash);
      if (!isTokenValid) {
        throw new BadRequestException('Invalid verification token');
      }

      // Mark email as verified
      user.isEmailVerified = true;
      user.emailVerificationTokenHash = null;
      user.emailVerificationExpiry = null;
      await this.userRepository.save(user);

      return { message: 'Email verified successfully' };
    } catch (error) {
      throw new BadRequestException('Invalid or expired verification token');
    }
  }

  /**
   * Change password
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Update password
    const saltRounds = 12;
    user.passwordHash = await bcrypt.hash(newPassword, saltRounds);
    await this.userRepository.save(user);

    return { message: 'Password changed successfully' };
  }

  /**
   * Enable/disable MFA
   */
  async toggleMFA(userId: string, enable: boolean): Promise<{ message: string; mfaEnabled: boolean }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    user.mfaEnabled = enable;
    await this.userRepository.save(user);

    return {
      message: enable ? 'MFA enabled successfully' : 'MFA disabled successfully',
      mfaEnabled: user.mfaEnabled,
    };
  }

  /**
   * Generate JWT tokens
   */
  private async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      userType: user.userType,
      mfaEnabled: user.mfaEnabled,
      mfaVerified: false, // Will be set to true after MFA verification
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m', // Short expiry for security
    });

    const refreshToken = await this.jwtService.signAsync(
      { sub: user.id, type: 'refresh' },
      { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
  }

  /**
   * Generate access token only
   */
  private async generateAccessToken(user: User): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      userType: user.userType,
      mfaEnabled: user.mfaEnabled,
      mfaVerified: false,
    };

    return await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });
  }

  /**
   * Validate JWT token
   */
  async validateToken(token: string): Promise<JwtPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
} 