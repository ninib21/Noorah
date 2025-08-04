import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Booking } from './booking.entity';

export enum ReviewType {
  PARENT_TO_SITTER = 'parent_to_sitter',
  SITTER_TO_PARENT = 'sitter_to_parent',
  SITTER_TO_SITTER = 'sitter_to_sitter',
}

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ReviewType,
    default: ReviewType.PARENT_TO_SITTER,
  })
  type: ReviewType;

  @Column({ type: 'int' })
  rating: number; // 1-5 stars

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ type: 'text', nullable: true })
  tags: string; // JSON array of tags like "punctual", "playful", "reliable"

  @Column({ type: 'boolean', default: false })
  isAnonymous: boolean;

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ type: 'text', nullable: true })
  response: string; // Response from the reviewed person

  @Column({ nullable: true })
  respondedAt: Date;

  @Column({ type: 'text', nullable: true })
  metadata: string; // JSON object for additional data

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User, user => user.reviewsGiven)
  @JoinColumn({ name: 'reviewerId' })
  reviewer: User;

  @Column()
  reviewerId: string;

  @ManyToOne(() => User, user => user.reviewsReceived)
  @JoinColumn({ name: 'revieweeId' })
  reviewee: User;

  @Column()
  revieweeId: string;

  @ManyToOne(() => Booking, booking => booking.reviews)
  @JoinColumn({ name: 'bookingId' })
  booking: Booking;

  @Column({ nullable: true })
  bookingId: string;

  // Helper methods
  get isPositive(): boolean {
    return this.rating >= 4;
  }

  get isNegative(): boolean {
    return this.rating <= 2;
  }

  get isNeutral(): boolean {
    return this.rating === 3;
  }

  get hasResponse(): boolean {
    return !!this.response;
  }

  get isVerifiedReview(): boolean {
    return this.isVerified;
  }
} 