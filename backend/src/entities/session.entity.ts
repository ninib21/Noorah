import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Booking } from './booking.entity';

export enum SessionStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  EMERGENCY = 'emergency',
  PAUSED = 'paused',
}

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  bookingId: string;

  @Column({ nullable: true })
  startTime: Date;

  @Column({ nullable: true })
  endTime: Date;

  @Column({
    type: 'enum',
    enum: SessionStatus,
    default: SessionStatus.ACTIVE,
  })
  status: SessionStatus;

  @Column({ type: 'jsonb', nullable: true })
  gpsTrackingData: {
    latitude: number;
    longitude: number;
    timestamp: Date;
    accuracy?: number;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  activityLog: {
    timestamp: Date;
    type: string;
    description: string;
    location?: {
      latitude: number;
      longitude: number;
    };
  }[];

  @Column({ type: 'jsonb', nullable: true })
  emergencyAlerts: {
    timestamp: Date;
    type: string;
    description: string;
    resolved: boolean;
    resolvedAt?: Date;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  photos: {
    id: string;
    url: string;
    timestamp: Date;
    description?: string;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  checkIns: {
    timestamp: Date;
    type: 'start' | 'break' | 'resume' | 'end';
    location?: {
      latitude: number;
      longitude: number;
    };
    notes?: string;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  notes: {
    timestamp: Date;
    content: string;
    author: 'parent' | 'sitter';
  }[];

  @Column({ nullable: true })
  actualStartTime: Date;

  @Column({ nullable: true })
  actualEndTime: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  actualDuration: number;

  @Column({ nullable: true })
  pausedAt: Date;

  @Column({ nullable: true })
  resumedAt: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalPauseTime: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Booking, (booking) => booking.sessions)
  @JoinColumn({ name: 'bookingId' })
  booking: Booking;
} 