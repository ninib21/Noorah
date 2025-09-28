import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

export enum NotificationType {
  BOOKING_REQUEST = 'booking_request',
  BOOKING_CONFIRMED = 'booking_confirmed',
  BOOKING_CANCELLED = 'booking_cancelled',
  BOOKING_STARTED = 'booking_started',
  BOOKING_COMPLETED = 'booking_completed',
  PAYMENT_RECEIVED = 'payment_received',
  PAYMENT_PROCESSED = 'payment_processed',
  PAYMENT_FAILED = 'payment_failed',
  MESSAGE_RECEIVED = 'message_received',
  SOS_ALERT = 'sos_alert',
  EMERGENCY_ALERT = 'emergency_alert',
  VERIFICATION_APPROVED = 'verification_approved',
  VERIFICATION_REJECTED = 'verification_rejected',
  REVIEW_RECEIVED = 'review_received',
  SYSTEM_UPDATE = 'system_update',
  PROMOTIONAL = 'promotional',
  REMINDER = 'reminder',
  WELCOME = 'welcome',
  OTHER = 'other',
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
  CRITICAL = 'critical',
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum NotificationChannel {
  PUSH = 'push',
  EMAIL = 'email',
  SMS = 'sms',
  IN_APP = 'in_app',
  WEBHOOK = 'webhook',
}

@Entity('notifications')
@Index(['userId', 'createdAt'])
@Index(['status', 'priority'])
@Index(['type', 'createdAt'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
  })
  type: string;

  @Column({
    type: 'varchar',
    default: NotificationPriority.NORMAL,
  })
  priority: NotificationPriority;

  @Column({
    type: 'varchar',
    default: NotificationStatus.PENDING,
  })
  status: NotificationStatus;

  @Column({
    type: 'varchar',
    default: NotificationChannel.PUSH,
  })
  channel: NotificationChannel;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'text', nullable: true })
  subtitle: string;

  @Column({ type: 'text', nullable: true })
  imageUrl: string;

  @Column({ type: 'text', nullable: true })
  deepLink: string;

  @Column({ type: 'text', nullable: true })
  actionUrl: string;

  @Column({ type: 'text', nullable: true })
  actionText: string;

  @Column({ type: 'text', nullable: true })
  metadata: string; // JSON object for additional data

  @Column({ type: 'text', nullable: true })
  category: string; // For grouping notifications

  @Column({ type: 'text', nullable: true })
  threadId: string; // For grouping related notifications

  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  @Column({ nullable: true })
  readAt: Date;

  @Column({ type: 'boolean', default: false })
  isArchived: boolean;

  @Column({ nullable: true })
  archivedAt: Date;

  @Column({ type: 'boolean', default: false })
  isSilent: boolean; // Silent push notification

  @Column({ type: 'boolean', default: false })
  requiresAction: boolean;

  @Column({ type: 'text', nullable: true })
  actionType: string; // 'confirm', 'dismiss', 'reply', etc.

  @Column({ type: 'text', nullable: true })
  actionData: string; // JSON object for action-specific data

  @Column({ type: 'int', default: 0 })
  retryCount: number;

  @Column({ nullable: true })
  lastRetryAt: Date;

  @Column({ type: 'text', nullable: true })
  failureReason: string;

  @Column({ nullable: true })
  scheduledAt: Date;

  @Column({ nullable: true })
  sentAt: Date;

  @Column({ nullable: true })
  deliveredAt: Date;

  @Column({ type: 'text', nullable: true })
  deviceToken: string; // For push notifications

  @Column({ type: 'text', nullable: true })
  emailAddress: string; // For email notifications

  @Column({ type: 'text', nullable: true })
  phoneNumber: string; // For SMS notifications

  @Column({ type: 'text', nullable: true })
  webhookUrl: string; // For webhook notifications

  @Column({ type: 'text', nullable: true })
  webhookResponse: string; // JSON response from webhook

  @Column({ type: 'int', nullable: true })
  webhookStatusCode: number;

  @Column({ type: 'text', nullable: true })
  tags: string; // JSON array of tags for filtering

  @Column({ type: 'boolean', default: false })
  isTest: boolean; // For testing notifications

  @Column({ type: 'text', nullable: true })
  campaignId: string; // For promotional campaigns

  @Column({ type: 'text', nullable: true })
  batchId: string; // For batch notifications

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User, user => user.notifications)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  // Helper methods
  get isUrgent(): boolean {
    return this.priority === NotificationPriority.URGENT || 
           this.priority === NotificationPriority.CRITICAL;
  }

  get isCritical(): boolean {
    return this.priority === NotificationPriority.CRITICAL;
  }

  get isHighPriority(): boolean {
    return this.priority === NotificationPriority.HIGH || this.isUrgent;
  }

  get isSent(): boolean {
    return this.status === NotificationStatus.SENT;
  }

  get isDelivered(): boolean {
    return this.status === NotificationStatus.DELIVERED;
  }

  get isFailed(): boolean {
    return this.status === NotificationStatus.FAILED;
  }

  get isPending(): boolean {
    return this.status === NotificationStatus.PENDING;
  }

  get isScheduled(): boolean {
    return !!this.scheduledAt && this.scheduledAt > new Date();
  }

  get isSOS(): boolean {
    return this.type === 'sos_alert';
  }

  get isEmergency(): boolean {
    return this.type === 'emergency_alert';
  }

  get isBookingRelated(): boolean {
    return [
      'booking_request',
      'booking_confirmed',
      'booking_cancelled',
      'booking_started',
      'booking_completed',
    ].includes(this.type);
  }

  get isPaymentRelated(): boolean {
    return [
      'payment_received',
      'payment_processed',
      'payment_failed',
    ].includes(this.type);
  }

  get isVerificationRelated(): boolean {
    return [
      'verification_approved',
      'verification_rejected',
    ].includes(this.type);
  }

  get hasAction(): boolean {
    return !!this.actionUrl || !!this.actionText || this.requiresAction;
  }

  get canRetry(): boolean {
    return this.isFailed && this.retryCount < 3;
  }

  get isExpired(): boolean {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return this.createdAt < thirtyDaysAgo;
  }

  get shouldArchive(): boolean {
    return this.isRead && this.isExpired;
  }
} 
