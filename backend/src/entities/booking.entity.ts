import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Payment } from './payment.entity';
import { Session } from './session.entity';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  parentId: string;

  @Column()
  sitterId: string;

  @Column()
  startTime: Date;

  @Column()
  endTime: Date;

  @Column({ type: 'text' })
  location: string;

  @Column()
  childrenCount: number;

  @Column({ type: 'text', nullable: true })
  specialInstructions: string;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  platformFee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  sitterPayout: number;

  @Column({ type: 'jsonb', nullable: true })
  childrenDetails: {
    name: string;
    age: number;
    specialNeeds?: string;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  locationDetails: {
    latitude: number;
    longitude: number;
    address: string;
  };

  @Column({ nullable: true })
  cancelledAt: Date;

  @Column({ nullable: true })
  cancelledBy: string;

  @Column({ nullable: true })
  cancellationReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.parentBookings)
  @JoinColumn({ name: 'parentId' })
  parent: User;

  @ManyToOne(() => User, (user) => user.sitterBookings)
  @JoinColumn({ name: 'sitterId' })
  sitter: User;

  @OneToMany(() => Payment, (payment) => payment.booking)
  payments: Payment[];

  @OneToMany(() => Session, (session) => session.booking)
  sessions: Session[];
} 