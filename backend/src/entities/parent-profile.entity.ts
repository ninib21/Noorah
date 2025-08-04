import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum FamilySize {
  SMALL = 'small', // 1-2 children
  MEDIUM = 'medium', // 3-4 children
  LARGE = 'large', // 5+ children
}

export enum IncomeLevel {
  LOW = 'low',
  MIDDLE = 'middle',
  HIGH = 'high',
  LUXURY = 'luxury',
}

@Entity('parent_profiles')
export class ParentProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({
    type: 'enum',
    enum: FamilySize,
    default: FamilySize.SMALL,
  })
  familySize: FamilySize;

  @Column({
    type: 'enum',
    enum: IncomeLevel,
    default: IncomeLevel.MIDDLE,
  })
  incomeLevel: IncomeLevel;

  @Column({ type: 'text', nullable: true })
  children: string; // JSON array of children info

  @Column({ type: 'text', nullable: true })
  requirements: string; // JSON object of requirements

  @Column({ type: 'text', nullable: true })
  emergencyContacts: string; // JSON array of emergency contacts

  @Column({ type: 'text', nullable: true })
  homeInfo: string; // JSON object of home information

  @Column({ type: 'text', nullable: true })
  pets: string; // JSON array of pets

  @Column({ type: 'text', nullable: true })
  allergies: string; // JSON array of allergies

  @Column({ type: 'text', nullable: true })
  specialNeeds: string; // JSON array of special needs

  @Column({ type: 'text', nullable: true })
  activities: string; // JSON array of preferred activities

  @Column({ type: 'text', nullable: true })
  schedule: string; // JSON object of family schedule

  @Column({ type: 'text', nullable: true })
  rules: string; // JSON array of house rules

  @Column({ type: 'text', nullable: true })
  photos: string; // JSON array of photo URLs

  @Column({ type: 'text', nullable: true })
  documents: string; // JSON array of document URLs

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  verifiedAt: Date;

  @Column({ nullable: true })
  verifiedBy: string;

  @Column({ type: 'int', default: 0 })
  totalBookings: number;

  @Column({ type: 'int', default: 0 })
  completedBookings: number;

  @Column({ type: 'int', default: 0 })
  cancelledBookings: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalSpent: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  averageRating: number;

  @Column({ type: 'int', default: 0 })
  totalReviews: number;

  @Column({ type: 'text', nullable: true })
  settings: string; // JSON object of settings

  @Column({ type: 'text', nullable: true })
  metadata: string; // JSON object for additional data

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @OneToOne(() => User, user => user.parentProfile)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  // Helper methods
  get completionRate(): number {
    if (this.totalBookings === 0) return 0;
    return (this.completedBookings / this.totalBookings) * 100;
  }

  get cancellationRate(): number {
    if (this.totalBookings === 0) return 0;
    return (this.cancelledBookings / this.totalBookings) * 100;
  }

  get averageSpendingPerBooking(): number {
    if (this.completedBookings === 0) return 0;
    return this.totalSpent / this.completedBookings;
  }

  get hasChildren(): boolean {
    return !!this.children;
  }

  get hasSpecialNeeds(): boolean {
    return !!this.specialNeeds;
  }

  get hasPets(): boolean {
    return !!this.pets;
  }

  get isVerifiedParent(): boolean {
    return this.isVerified;
  }

  get familySizeNumber(): number {
    switch (this.familySize) {
      case FamilySize.SMALL: return 2;
      case FamilySize.MEDIUM: return 4;
      case FamilySize.LARGE: return 6;
      default: return 2;
    }
  }
} 