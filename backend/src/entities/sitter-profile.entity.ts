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

export enum BackgroundCheckStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('sitter_profiles')
export class SitterProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  hourlyRate: number;

  @Column({ nullable: true })
  experienceYears: number;

  @Column({ type: 'text', array: true, default: [] })
  certifications: string[];

  @Column({ type: 'jsonb', nullable: true })
  availabilitySchedule: any;

  @Column({
    type: 'enum',
    enum: BackgroundCheckStatus,
    default: BackgroundCheckStatus.PENDING,
  })
  backgroundCheckStatus: BackgroundCheckStatus;

  @Column({ nullable: true })
  backgroundCheckDate: Date;

  @Column({ nullable: true })
  stripeAccountId: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ default: 0 })
  totalReviews: number;

  @Column({ default: true })
  isAvailable: boolean;

  @Column({ type: 'jsonb', nullable: true })
  skills: string[];

  @Column({ type: 'jsonb', nullable: true })
  languages: string[];

  @Column({ type: 'jsonb', nullable: true })
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @OneToOne(() => User, (user) => user.sitterProfile)
  @JoinColumn({ name: 'userId' })
  user: User;
} 