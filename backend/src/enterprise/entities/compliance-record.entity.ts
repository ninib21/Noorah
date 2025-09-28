import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum ComplianceType {
  SOC2_TYPE_II = 'soc2_type_ii',
  ISO_27001 = 'iso_27001',
  GDPR = 'gdpr',
  CCPA = 'ccpa',
  COPPA = 'coppa',
  HIPAA = 'hipaa',
  PCI_DSS = 'pci_dss',
  FISMA = 'fisma',
  FERPA = 'ferpa',
  STATE_CHILD_CARE = 'state_child_care',
}

export enum ComplianceStatus {
  COMPLIANT = 'compliant',
  NON_COMPLIANT = 'non_compliant',
  PARTIALLY_COMPLIANT = 'partially_compliant',
  PENDING_ASSESSMENT = 'pending_assessment',
  UNDER_REVIEW = 'under_review',
  EXPIRED = 'expired',
}

export enum ComplianceSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity('compliance_records')
@Index(['complianceType', 'status'])
@Index(['entityType', 'entityId'])
@Index(['expiryDate'])
export class ComplianceRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ComplianceType,
  })
  complianceType: ComplianceType;

  @Column({
    type: 'enum',
    enum: ComplianceStatus,
    default: ComplianceStatus.PENDING_ASSESSMENT,
  })
  status: ComplianceStatus;

  @Column({
    type: 'enum',
    enum: ComplianceSeverity,
    default: ComplianceSeverity.MEDIUM,
  })
  severity: ComplianceSeverity;

  @Column()
  entityType: string; // 'user', 'agency', 'enterprise_client', 'system'

  @Column()
  entityId: string;

  @Column({ nullable: true })
  requirement: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  evidence: string;

  @Column({ type: 'jsonb', nullable: true })
  controls: {
    technical: string[];
    administrative: string[];
    physical: string[];
  };

  @Column({ type: 'jsonb', nullable: true })
  assessment: {
    assessor: string;
    assessmentDate: Date;
    findings: string[];
    recommendations: string[];
    score: number;
    maxScore: number;
  };

  @Column({ type: 'jsonb', nullable: true })
  remediation: {
    plan: string;
    assignedTo: string;
    dueDate: Date;
    status: string;
    notes: string;
  };

  @Column({ type: 'timestamp', nullable: true })
  assessmentDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiryDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  nextAssessmentDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    version: string;
    framework: string;
    standard: string;
    additionalInfo: Record<string, any>;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

