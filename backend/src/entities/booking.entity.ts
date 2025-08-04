import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Message } from './message.entity';
import { Review } from './review.entity';
import { Session } from './session.entity';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  DISPUTED = 'disputed',
}

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  parentId: string;

  @Column()
  sitterId: string;

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp' })
  endTime: Date;

  @Column({ type: 'int' })
  childrenCount: number;

  @Column({ type: 'text', nullable: true })
  specialInstructions: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text' })
  location: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  hourlyRate: number;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  totalAmount: number;

  @Column({ type: 'text', nullable: true })
  cancellationReason: string;

  @Column({ nullable: true })
  cancelledAt: Date;

  @Column({ nullable: true })
  cancelledBy: string;

  @Column({ nullable: true })
  confirmedAt: Date;

  @Column({ nullable: true })
  startedAt: Date;

  @Column({ nullable: true })
  completedAt: Date;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  rating: number;

  @Column({ type: 'text', nullable: true })
  review: string;

  @Column({ type: 'jsonb', nullable: true })
  checkIns: {
    time: Date;
    location: {
      latitude: number;
      longitude: number;
      address: string;
    };
    photos: string[];
  }[];

  @Column({ type: 'jsonb', nullable: true })
  photos: {
    url: string;
    caption: string;
    uploadedAt: Date;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  activities: {
    name: string;
    description: string;
    startTime: Date;
    endTime: Date;
    photos: string[];
  }[];

  @Column({ type: 'jsonb', nullable: true })
  expenses: {
    description: string;
    amount: number;
    receipt: string;
    approved: boolean;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  emergencyContacts: {
    name: string;
    phone: string;
    relationship: string;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  children: {
    name: string;
    age: number;
    specialNeeds?: string;
    allergies?: string[];
  }[];

  @Column({ type: 'jsonb', nullable: true })
  requirements: {
    meals: boolean;
    transportation: boolean;
    homework: boolean;
    activities: string[];
  };

  @Column({ type: 'jsonb', nullable: true })
  schedule: {
    arrivalTime: Date;
    departureTime: Date;
    breaks: {
      startTime: Date;
      endTime: Date;
      reason: string;
    }[];
  };

  @Column({ type: 'jsonb', nullable: true })
  communication: {
    messages: {
      sender: string;
      message: string;
      timestamp: Date;
      read: boolean;
    }[];
    updates: {
      type: string;
      message: string;
      timestamp: Date;
    }[];
  };

  @Column({ type: 'jsonb', nullable: true })
  safety: {
    emergencyProcedures: string[];
    medicalInfo: {
      allergies: string[];
      medications: string[];
      conditions: string[];
    };
    contactProtocol: {
      whenToContact: string[];
      emergencyNumbers: string[];
    };
  };

  @Column({ type: 'jsonb', nullable: true })
  feedback: {
    parentRating: number;
    parentComment: string;
    sitterRating: number;
    sitterComment: string;
    submittedAt: Date;
  };

  @Column({ type: 'jsonb', nullable: true })
  payment: {
    method: string;
    status: string;
    amount: number;
    tip: number;
    processedAt: Date;
  };

  @Column({ type: 'jsonb', nullable: true })
  insurance: {
    coverage: string;
    policyNumber: string;
    provider: string;
    validUntil: Date;
  };

  @Column({ type: 'jsonb', nullable: true })
  documents: {
    contract: string;
    waivers: string[];
    certificates: string[];
  };

  @Column({ type: 'jsonb', nullable: true })
  settings: {
    notifications: {
      checkIn: boolean;
      checkOut: boolean;
      updates: boolean;
      emergencies: boolean;
    };
    privacy: {
      sharePhotos: boolean;
      shareLocation: boolean;
      shareUpdates: boolean;
    };
  };

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  matchScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  aiMatchScore: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  aiRating: number;

  @Column({ type: 'int', nullable: true })
  experience: number;

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

  @OneToMany(() => Review, review => review.bookingId)
  reviews: Review[];

  @OneToMany(() => Session, session => session.booking)
  sessions: Session[];

  @OneToMany(() => Message, message => message.booking)
  messages: Message[];

  // Helper methods
  get duration(): number {
    return this.endTime.getTime() - this.startTime.getTime();
  }

  get isActive(): boolean {
    const now = new Date();
    return this.startTime <= now && this.endTime >= now;
  }

  get isUpcoming(): boolean {
    return this.startTime > new Date();
  }

  get isPast(): boolean {
    return this.endTime < new Date();
  }

  get isCompleted(): boolean {
    return this.status === BookingStatus.COMPLETED;
  }

  get isCancelled(): boolean {
    return this.status === BookingStatus.CANCELLED;
  }

  get totalHours(): number {
    return this.duration / (1000 * 60 * 60);
  }

  get estimatedCost(): number {
    return this.totalHours * this.hourlyRate;
  }
} 