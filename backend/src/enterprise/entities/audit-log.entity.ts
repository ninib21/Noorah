import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum AuditEventType {
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  USER_CREATED = 'user_created',
  USER_UPDATED = 'user_updated',
  USER_DELETED = 'user_deleted',
  BOOKING_CREATED = 'booking_created',
  BOOKING_UPDATED = 'booking_updated',
  BOOKING_CANCELLED = 'booking_cancelled',
  PAYMENT_PROCESSED = 'payment_processed',
  PAYMENT_REFUNDED = 'payment_refunded',
  SITTER_VERIFIED = 'sitter_verified',
  SITTER_SUSPENDED = 'sitter_suspended',
  AGENCY_CREATED = 'agency_created',
  AGENCY_UPDATED = 'agency_updated',
  ENTERPRISE_CLIENT_CREATED = 'enterprise_client_created',
  ENTERPRISE_CLIENT_UPDATED = 'enterprise_client_updated',
  SECURITY_ALERT = 'security_alert',
  COMPLIANCE_VIOLATION = 'compliance_violation',
  DATA_EXPORT = 'data_export',
  DATA_DELETION = 'data_deletion',
  SYSTEM_CONFIGURATION = 'system_configuration',
  API_ACCESS = 'api_access',
  WEBHOOK_TRIGGERED = 'webhook_triggered',
  INTEGRATION_CONNECTED = 'integration_connected',
  INTEGRATION_DISCONNECTED = 'integration_disconnected',
}

export enum AuditEventResult {
  SUCCESS = 'success',
  FAILURE = 'failure',
  WARNING = 'warning',
  ERROR = 'error',
}

@Entity('audit_logs')
@Index(['userId', 'createdAt'])
@Index(['eventType', 'createdAt'])
@Index(['ipAddress', 'createdAt'])
@Index(['createdAt'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  userId: string;

  @Column({ nullable: true })
  sessionId: string;

  @Column({
    type: 'enum',
    enum: AuditEventType,
  })
  eventType: AuditEventType;

  @Column({ nullable: true })
  resource: string;

  @Column({ nullable: true })
  resourceId: string;

  @Column({
    type: 'enum',
    enum: AuditEventResult,
    default: AuditEventResult.SUCCESS,
  })
  result: AuditEventResult;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @Column({ nullable: true })
  requestId: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
    additionalData?: Record<string, any>;
    errorMessage?: string;
    stackTrace?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  context: {
    tenantId?: string;
    agencyId?: string;
    enterpriseClientId?: string;
    environment?: string;
    version?: string;
  };

  @CreateDateColumn()
  createdAt: Date;
}

