import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { SitterProfile } from './sitter-profile.entity';
import { ParentProfile } from './parent-profile.entity';
import { Booking } from './booking.entity';
import { Review } from './review.entity';

export enum UserType {
  PARENT = 'parent',
  SITTER = 'sitter',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true, nullable: true })
  phone: string;

  @Column({ nullable: true })
  passwordHash: string;

  @Column({
    type: 'enum',
    enum: UserType,
    default: UserType.PARENT,
  })
  userType: UserType;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  profileImageUrl: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  lastLoginAt: Date;

  // Email verification
  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ default: false })
  isPhoneVerified: boolean;

  // MFA settings
  @Column({ default: false })
  mfaEnabled: boolean;

  @Column({ nullable: true })
  mfaSecret: string;

  // OTP fields
  @Column({ nullable: true })
  otpHash: string;

  @Column({ nullable: true })
  otpExpiry: Date;

  // Password reset fields
  @Column({ nullable: true })
  resetTokenHash: string;

  @Column({ nullable: true })
  resetTokenExpiry: Date;

  // Email verification fields
  @Column({ nullable: true })
  emailVerificationTokenHash: string;

  @Column({ nullable: true })
  emailVerificationExpiry: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @OneToOne(() => SitterProfile, (sitterProfile) => sitterProfile.user, {
    cascade: true,
  })
  sitterProfile: SitterProfile;

  @OneToOne(() => ParentProfile, (parentProfile) => parentProfile.user, {
    cascade: true,
  })
  parentProfile: ParentProfile;

  @OneToMany(() => Booking, (booking) => booking.parent)
  parentBookings: Booking[];

  @OneToMany(() => Booking, (booking) => booking.sitter)
  sitterBookings: Booking[];

  @OneToMany(() => Review, (review) => review.reviewer)
  reviewsGiven: Review[];

  @OneToMany(() => Review, (review) => review.reviewee)
  reviewsReceived: Review[];
} 