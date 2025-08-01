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

export enum SubscriptionTier {
  FREE = 'free',
  PLUS = 'plus',
  PREMIUM = 'premium',
}

@Entity('parent_profiles')
export class ParentProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'jsonb', nullable: true })
  emergencyContacts: {
    name: string;
    phone: string;
    relationship: string;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  childrenProfiles: {
    name: string;
    age: number;
    specialNeeds?: string;
    allergies?: string[];
  }[];

  @Column({ type: 'jsonb', nullable: true })
  paymentMethods: {
    id: string;
    type: string;
    last4?: string;
    brand?: string;
  }[];

  @Column({
    type: 'enum',
    enum: SubscriptionTier,
    default: SubscriptionTier.FREE,
  })
  subscriptionTier: SubscriptionTier;

  @Column({ nullable: true })
  subscriptionExpiresAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  preferences: {
    maxDistance: number;
    preferredAgeRange: {
      min: number;
      max: number;
    };
    preferredLanguages: string[];
    specialRequirements: string[];
  };

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
  @OneToOne(() => User, (user) => user.parentProfile)
  @JoinColumn({ name: 'userId' })
  user: User;
} 