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
import { User } from '../../entities/user.entity';
import { EnterpriseClient } from './enterprise-client.entity';
import { SitterProfile } from '../../entities/sitter-profile.entity';

export enum AgencyTier {
  STARTER = 'starter',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
}

export enum AgencyStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
  CANCELLED = 'cancelled',
}

@Entity('agencies')
export class Agency {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @ManyToOne(() => User)
  @JoinColumn()
  adminUser: User;

  @ManyToOne(() => EnterpriseClient, (client) => client.agencies, { nullable: true })
  @JoinColumn()
  enterpriseClient: EnterpriseClient;

  @Column({
    type: 'enum',
    enum: AgencyTier,
    default: AgencyTier.STARTER,
  })
  tier: AgencyTier;

  @Column({
    type: 'enum',
    enum: AgencyStatus,
    default: AgencyStatus.PENDING,
  })
  status: AgencyStatus;

  @Column({ type: 'jsonb', nullable: true })
  branding: {
    logo: string;
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    customCSS: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  settings: {
    maxSitters: number;
    maxBookings: number;
    features: string[];
    restrictions: Record<string, any>;
    workflows: Record<string, any>;
  };

  @Column({ type: 'jsonb', nullable: true })
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    latitude: number;
    longitude: number;
    serviceRadius: number;
  };

  @OneToMany(() => SitterProfile, (sitter) => sitter.agencyId)
  sitters: SitterProfile[];

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  monthlyFee: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  commissionRate: number;

  @Column({ type: 'timestamp', nullable: true })
  subscriptionStartDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  subscriptionEndDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

