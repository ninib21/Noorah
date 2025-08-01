import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Booking } from './booking.entity';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  bookingId: string;

  @Column()
  reviewerId: string;

  @Column()
  revieweeId: string;

  @Column({ type: 'int', check: 'rating >= 1 AND rating <= 5' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ default: true })
  isPublic: boolean;

  @Column({ type: 'jsonb', nullable: true })
  categories: {
    punctuality?: number;
    communication?: number;
    safety?: number;
    cleanliness?: number;
    fun?: number;
  };

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  verifiedAt: Date;

  @Column({ default: false })
  isReported: boolean;

  @Column({ nullable: true })
  reportedAt: Date;

  @Column({ nullable: true })
  reportReason: string;

  @CreateDateColumn()
  createdAt: Date;

  // Relationships
  @ManyToOne(() => Booking)
  @JoinColumn({ name: 'bookingId' })
  booking: Booking;

  @ManyToOne(() => User, (user) => user.reviewsGiven)
  @JoinColumn({ name: 'reviewerId' })
  reviewer: User;

  @ManyToOne(() => User, (user) => user.reviewsReceived)
  @JoinColumn({ name: 'revieweeId' })
  reviewee: User;
} 