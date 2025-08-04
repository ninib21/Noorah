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

export enum DocumentType {
  IDENTITY = 'identity',
  ADDRESS = 'address',
  BACKGROUND_CHECK = 'background_check',
  CERTIFICATION = 'certification',
  INSURANCE = 'insurance',
  REFERENCE = 'reference',
  OTHER = 'other',
}

export enum DocumentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

@Entity('verification_documents')
export class VerificationDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: DocumentType,
    default: DocumentType.OTHER,
  })
  type: DocumentType;

  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.PENDING,
  })
  status: DocumentStatus;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  fileName: string;

  @Column()
  fileUrl: string;

  @Column({ type: 'text', nullable: true })
  metadata: string; // JSON object for additional data

  @Column({ nullable: true })
  submittedAt: Date;

  @Column({ nullable: true })
  reviewedAt: Date;

  @Column({ nullable: true })
  reviewedBy: string;

  @Column({ type: 'text', nullable: true })
  reviewNotes: string;

  @Column({ nullable: true })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User, user => user.verificationDocuments)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  // Helper methods
  get isApproved(): boolean {
    return this.status === DocumentStatus.APPROVED;
  }

  get isRejected(): boolean {
    return this.status === DocumentStatus.REJECTED;
  }

  get isPending(): boolean {
    return this.status === DocumentStatus.PENDING;
  }

  get isExpired(): boolean {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
  }

  get willExpireSoon(): boolean {
    if (!this.expiresAt) return false;
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return this.expiresAt <= thirtyDaysFromNow;
  }

  get daysUntilExpiry(): number {
    if (!this.expiresAt) return Infinity;
    const now = new Date();
    const diffTime = this.expiresAt.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get isReviewed(): boolean {
    return !!this.reviewedAt;
  }

  get isActive(): boolean {
    return this.isApproved && !this.isExpired;
  }
} 