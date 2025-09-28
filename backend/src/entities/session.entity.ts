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
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    default: 'active',
  })
  status: string;

  @Column({ type: 'datetime' })
  startTime: Date;

  @Column({ nullable: true })
  endTime: Date;

  @Column({ type: 'int', default: 0 })
  durationMinutes: number;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  startLatitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  startLongitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  endLatitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  endLongitude: number;

  @Column({ type: 'text', nullable: true })
  locationHistory: string; // JSON array of location points

  @Column({ type: 'text', nullable: true })
  activities: string; // JSON array of activities performed

  @Column({ type: 'text', nullable: true })
  photos: string; // JSON array of photo URLs

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  emergencyAlerts: string; // JSON array of emergency alerts

  @Column({ type: 'text', nullable: true })
  checkIns: string; // JSON array of check-in events

  @Column({ type: 'text', nullable: true })
  metadata: string; // JSON object for additional data

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Booking)
  @JoinColumn({ name: 'bookingId' })
  booking: Booking;

  @Column()
  bookingId: string;

  // Helper methods
  get isActive(): boolean {
    return this.status === 'active';
  }

  get isCompleted(): boolean {
    return this.status === 'completed';
  }

  get duration(): number {
    if (!this.endTime) return 0;
    return Math.round((this.endTime.getTime() - this.startTime.getTime()) / (1000 * 60));
  }

  get hasLocationTracking(): boolean {
    return !!(this.startLatitude && this.startLongitude);
  }

  get hasPhotos(): boolean {
    return !!this.photos;
  }

  get hasEmergencyAlerts(): boolean {
    return !!this.emergencyAlerts;
  }
} 
