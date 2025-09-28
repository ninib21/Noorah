import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../entities/user.entity';
import { Agency } from './agency.entity';
import { WhiteLabelConfig } from './white-label-config.entity';

export enum EnterpriseTier {
  CORPORATE = 'corporate',
  ENTERPRISE = 'enterprise',
  WHITE_LABEL = 'white_label',
}

export enum EnterpriseStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
  CANCELLED = 'cancelled',
}

@Entity('enterprise_clients')
export class EnterpriseClient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  companyName: string;

  @Column({ unique: true })
  domain: string;

  @Column({ unique: true })
  subdomain: string;

  @OneToOne(() => User)
  @JoinColumn()
  adminUser: User;

  @Column({
    type: 'enum',
    enum: EnterpriseTier,
    default: EnterpriseTier.CORPORATE,
  })
  tier: EnterpriseTier;

  @Column({
    type: 'enum',
    enum: EnterpriseStatus,
    default: EnterpriseStatus.PENDING,
  })
  status: EnterpriseStatus;

  @Column({ type: 'jsonb', nullable: true })
  ssoConfig: {
    provider: string;
    entityId: string;
    ssoUrl: string;
    certificate: string;
    attributeMapping: Record<string, string>;
  };

  @Column({ type: 'jsonb', nullable: true })
  customWorkflows: {
    approvalProcess: boolean;
    customFields: Record<string, any>;
    notifications: Record<string, any>;
    integrations: Record<string, any>;
  };

  @Column({ type: 'jsonb', nullable: true })
  billingInfo: {
    billingEmail: string;
    paymentMethod: string;
    billingAddress: Record<string, any>;
    taxId: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  settings: {
    maxUsers: number;
    maxBookings: number;
    features: string[];
    restrictions: Record<string, any>;
  };

  @OneToMany(() => Agency, (agency) => agency.enterpriseClient)
  agencies: Agency[];

  @OneToOne(() => WhiteLabelConfig, (config) => config.enterpriseClient)
  whiteLabelConfig: WhiteLabelConfig;

  @Column({ type: 'timestamp', nullable: true })
  contractStartDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  contractEndDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  monthlyFee: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  transactionFee: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

