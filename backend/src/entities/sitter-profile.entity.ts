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

export enum ExperienceLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  EXPERIENCED = 'experienced',
  EXPERT = 'expert',
}

export enum CertificationType {
  CPR = 'cpr',
  FIRST_AID = 'first_aid',
  CHILDCARE = 'childcare',
  NURSING = 'nursing',
  TEACHING = 'teaching',
  SPECIAL_NEEDS = 'special_needs',
}

@Entity('sitter_profiles')
export class SitterProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({
    type: 'enum',
    enum: ExperienceLevel,
    default: ExperienceLevel.BEGINNER,
  })
  experienceLevel: ExperienceLevel;

  @Column({ type: 'int', default: 0 })
  yearsOfExperience: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  hourlyRate: number;

  @Column({ type: 'text', nullable: true })
  skills: string; // JSON array of skills

  @Column({ type: 'text', nullable: true })
  certifications: string; // JSON array of certifications

  @Column({ type: 'text', nullable: true })
  languages: string; // JSON array of languages

  @Column({ type: 'text', nullable: true })
  availability: string; // JSON object of availability schedule

  @Column({ type: 'text', nullable: true })
  serviceAreas: string; // JSON array of service areas

  @Column({ type: 'text', nullable: true })
  specializations: string; // JSON array of specializations

  @Column({ type: 'text', nullable: true })
  education: string; // JSON array of education

  @Column({ type: 'text', nullable: true })
  workHistory: string; // JSON array of work history

  @Column({ type: 'text', nullable: true })
  references: string; // JSON array of references

  @Column({ type: 'text', nullable: true })
  backgroundCheck: string; // JSON object of background check info

  @Column({ type: 'text', nullable: true })
  insurance: string; // JSON object of insurance info

  @Column({ type: 'text', nullable: true })
  photos: string; // JSON array of photo URLs

  @Column({ type: 'text', nullable: true })
  videos: string; // JSON array of video URLs

  @Column({ type: 'text', nullable: true })
  documents: string; // JSON array of document URLs

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  verifiedAt: Date;

  @Column({ nullable: true })
  verifiedBy: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  averageRating: number;

  @Column({ type: 'int', default: 0 })
  totalReviews: number;

  @Column({ type: 'int', default: 0 })
  totalBookings: number;

  @Column({ type: 'int', default: 0 })
  completedBookings: number;

  @Column({ type: 'int', default: 0 })
  cancelledBookings: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalEarnings: number;

  @Column({ type: 'text', nullable: true })
  preferences: string; // JSON object of preferences

  @Column({ type: 'text', nullable: true })
  settings: string; // JSON object of settings

  @Column({ type: 'text', nullable: true })
  metadata: string; // JSON object for additional data

  @Column({ type: 'text', nullable: true })
  location: string; // Location string for search

  @Column({ nullable: true })
  profileImageUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @OneToOne(() => User, user => user.sitterProfile)
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

  get isExperienced(): boolean {
    return this.experienceLevel === ExperienceLevel.EXPERIENCED || 
           this.experienceLevel === ExperienceLevel.EXPERT;
  }

  get hasCertifications(): boolean {
    return !!this.certifications;
  }

  get isFullyVerified(): boolean {
    return this.isVerified && !!this.backgroundCheck && !!this.insurance;
  }

  get averageEarningsPerBooking(): number {
    if (this.completedBookings === 0) return 0;
    return this.totalEarnings / this.completedBookings;
  }
} 