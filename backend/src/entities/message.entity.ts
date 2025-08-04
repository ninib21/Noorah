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
import { Booking } from './booking.entity';

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  LOCATION = 'location',
  SYSTEM = 'system',
  SOS = 'sos',
}

export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
}

@Entity('messages')
@Index(['bookingId', 'createdAt'])
@Index(['senderId', 'receiverId'])
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: MessageType,
    default: MessageType.TEXT,
  })
  type: MessageType;

  @Column({
    type: 'enum',
    enum: MessageStatus,
    default: MessageStatus.SENT,
  })
  status: MessageStatus;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text', nullable: true })
  metadata: string; // JSON object for additional data (image URL, location, etc.)

  @Column({ type: 'boolean', default: false })
  isEdited: boolean;

  @Column({ nullable: true })
  editedAt: Date;

  @Column({ type: 'text', nullable: true })
  editHistory: string; // JSON array of previous versions

  @Column({ type: 'boolean', default: false })
  isDeleted: boolean;

  @Column({ nullable: true })
  deletedAt: Date;

  @Column({ type: 'boolean', default: false })
  isPinned: boolean;

  @Column({ nullable: true })
  pinnedAt: Date;

  @Column({ type: 'text', nullable: true })
  replyTo: string; // UUID of message being replied to

  @Column({ type: 'text', nullable: true })
  reactions: string; // JSON object of reactions {userId: emoji}

  @Column({ type: 'boolean', default: false })
  isUrgent: boolean;

  @Column({ type: 'boolean', default: false })
  requiresAction: boolean;

  @Column({ type: 'text', nullable: true })
  actionType: string; // 'confirm', 'approve', 'reject', etc.

  @Column({ type: 'text', nullable: true })
  actionData: string; // JSON object for action-specific data

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User, user => user.sentMessages)
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @Column()
  senderId: string;

  @ManyToOne(() => User, user => user.receivedMessages)
  @JoinColumn({ name: 'receiverId' })
  receiver: User;

  @Column()
  receiverId: string;

  @ManyToOne(() => Booking, booking => booking.messages)
  @JoinColumn({ name: 'bookingId' })
  booking: Booking;

  @Column({ nullable: true })
  bookingId: string;

  // Helper methods
  get isText(): boolean {
    return this.type === MessageType.TEXT;
  }

  get isImage(): boolean {
    return this.type === MessageType.IMAGE;
  }

  get isLocation(): boolean {
    return this.type === MessageType.LOCATION;
  }

  get isSystem(): boolean {
    return this.type === MessageType.SYSTEM;
  }

  get isSOS(): boolean {
    return this.type === MessageType.SOS;
  }

  get isRead(): boolean {
    return this.status === MessageStatus.READ;
  }

  get isDelivered(): boolean {
    return this.status === MessageStatus.DELIVERED;
  }

  get isFailed(): boolean {
    return this.status === MessageStatus.FAILED;
  }

  get hasReactions(): boolean {
    return !!this.reactions;
  }

  get hasReply(): boolean {
    return !!this.replyTo;
  }

  get isActionable(): boolean {
    return this.requiresAction && !this.isDeleted;
  }

  get isUrgentMessage(): boolean {
    return this.isUrgent || this.type === MessageType.SOS;
  }
} 