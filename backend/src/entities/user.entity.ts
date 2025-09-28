import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { SitterProfile } from './sitter-profile.entity';
import { ParentProfile } from './parent-profile.entity';
import { Booking } from './booking.entity';
import { Review } from './review.entity';
import { Payment } from './payment.entity';
import { Message } from './message.entity';
import { VerificationDocument } from './verification-document.entity';
import { Notification } from './notification.entity';

export enum UserType {
  PARENT = 'parent',
  SITTER = 'sitter',
  ADMIN = 'admin',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
}

export enum SubscriptionTier {
  FREE = 'free',
  PLUS = 'plus',
  PREMIUM = 'premium',
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  AGENCY_ADMIN = 'agency_admin',
  AGENCY_USER = 'agency_user',
  PLATFORM_ADMIN = 'platform_admin',
  ENTERPRISE_ADMIN = 'enterprise_admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({
    type: 'varchar',
    default: 'parent',
  })
  userType: string;

  @Column({
    type: 'varchar',
    default: 'active',
  })
  status: string;

  @Column({
    type: 'varchar',
    default: 'free',
  })
  subscriptionTier: string;

  @Column({ nullable: true })
  profilePicture: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  averageRating: number;

  @Column({ type: 'int', default: 0 })
  totalReviews: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  hourlyRate: number;

  @Column({ type: 'int', nullable: true })
  experience: number;

  @Column({ default: false })
  emailVerified: boolean;

  @Column({ default: false })
  phoneVerified: boolean;

  @Column({ nullable: true })
  verificationToken: string;

  @Column({ nullable: true })
  verificationExpires: Date;

  @Column({ nullable: true })
  resetPasswordToken: string;

  @Column({ nullable: true })
  resetPasswordExpires: Date;

  @Column({ nullable: true })
  lastLoginAt: Date;

  @Column({ nullable: true })
  lastActiveAt: Date;

  @Column({ type: 'text', nullable: true })
  preferences: string; // JSON object

  @Column({ type: 'text', nullable: true })
  settings: string; // JSON object

  @Column({ type: 'text', nullable: true })
  metadata: string; // JSON object

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @OneToOne(() => SitterProfile, sitterProfile => sitterProfile.user)
  sitterProfile: SitterProfile;

  @OneToOne(() => ParentProfile, parentProfile => parentProfile.user)
  parentProfile: ParentProfile;

  @OneToMany(() => Booking, booking => booking.parent)
  parentBookings: Booking[];

  @OneToMany(() => Booking, booking => booking.sitter)
  sitterBookings: Booking[];

  @OneToMany(() => Review, review => review.reviewer)
  reviewsGiven: Review[];

  @OneToMany(() => Review, review => review.reviewee)
  reviewsReceived: Review[];

  @OneToMany(() => Payment, payment => payment.user)
  payments: Payment[];

  @OneToMany(() => Message, message => message.sender)
  sentMessages: Message[];

  @OneToMany(() => Message, message => message.receiver)
  receivedMessages: Message[];

  @OneToMany(() => VerificationDocument, doc => doc.user)
  verificationDocuments: VerificationDocument[];

  @OneToMany(() => Notification, notification => notification.user)
  notifications: Notification[];

  // Helper methods
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get isVerified(): boolean {
    return this.emailVerified && this.phoneVerified;
  }

  get isPremium(): boolean {
    return this.subscriptionTier === 'premium';
  }

  get isActive(): boolean {
    return this.status === 'active';
  }

  get hasProfile(): boolean {
    return this.userType === 'sitter' ? !!this.sitterProfile : !!this.parentProfile;
  }
} 
