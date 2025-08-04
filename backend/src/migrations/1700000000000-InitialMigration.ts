import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1700000000000 implements MigrationInterface {
  name = 'InitialMigration1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types
    await queryRunner.query(`
      CREATE TYPE "public"."user_type_enum" AS ENUM('parent', 'sitter', 'admin')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."user_status_enum" AS ENUM('active', 'inactive', 'suspended', 'pending')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."subscription_tier_enum" AS ENUM('free', 'plus', 'premium')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."booking_status_enum" AS ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."payment_type_enum" AS ENUM('booking', 'subscription', 'tip', 'refund', 'withdrawal')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."payment_status_enum" AS ENUM('pending', 'authorized', 'paid', 'failed', 'refunded', 'disputed')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."review_type_enum" AS ENUM('parent_to_sitter', 'sitter_to_parent', 'sitter_to_sitter')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."message_type_enum" AS ENUM('text', 'image', 'location', 'system', 'sos')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."message_status_enum" AS ENUM('sent', 'delivered', 'read', 'failed')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."document_type_enum" AS ENUM('id_card', 'passport', 'drivers_license', 'selfie', 'background_check', 'cpr_certificate', 'first_aid_certificate', 'childcare_certificate', 'nursing_license', 'teaching_certificate', 'special_needs_certificate', 'insurance_document', 'references', 'other')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."verification_status_enum" AS ENUM('pending', 'in_review', 'approved', 'rejected', 'expired')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."notification_type_enum" AS ENUM('booking_request', 'booking_confirmed', 'booking_cancelled', 'booking_started', 'booking_completed', 'payment_received', 'payment_processed', 'payment_failed', 'message_received', 'sos_alert', 'emergency_alert', 'verification_approved', 'verification_rejected', 'review_received', 'system_update', 'promotional', 'reminder', 'welcome', 'other')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."notification_priority_enum" AS ENUM('low', 'normal', 'high', 'urgent', 'critical')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."notification_status_enum" AS ENUM('pending', 'sent', 'delivered', 'read', 'failed', 'cancelled')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."notification_channel_enum" AS ENUM('push', 'email', 'sms', 'in_app', 'webhook')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."experience_level_enum" AS ENUM('beginner', 'intermediate', 'experienced', 'expert')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."family_size_enum" AS ENUM('small', 'medium', 'large')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."income_level_enum" AS ENUM('low', 'middle', 'high', 'luxury')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."session_status_enum" AS ENUM('active', 'paused', 'completed', 'cancelled')
    `);

    // Create users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "phone" character varying,
        "password" character varying NOT NULL,
        "firstName" character varying NOT NULL,
        "lastName" character varying NOT NULL,
        "userType" "public"."user_type_enum" NOT NULL DEFAULT 'parent',
        "status" "public"."user_status_enum" NOT NULL DEFAULT 'active',
        "subscriptionTier" "public"."subscription_tier_enum" NOT NULL DEFAULT 'free',
        "profilePicture" character varying,
        "averageRating" numeric(3,2) NOT NULL DEFAULT '0',
        "totalReviews" integer NOT NULL DEFAULT '0',
        "hourlyRate" numeric(5,2),
        "experience" integer,
        "emailVerified" boolean NOT NULL DEFAULT false,
        "phoneVerified" boolean NOT NULL DEFAULT false,
        "verificationToken" character varying,
        "verificationExpires" TIMESTAMP,
        "resetPasswordToken" character varying,
        "resetPasswordExpires" TIMESTAMP,
        "lastLoginAt" TIMESTAMP,
        "lastActiveAt" TIMESTAMP,
        "preferences" text,
        "settings" text,
        "metadata" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
        CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
      )
    `);

    // Create sitter_profiles table
    await queryRunner.query(`
      CREATE TABLE "sitter_profiles" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "bio" text,
        "experienceLevel" "public"."experience_level_enum" NOT NULL DEFAULT 'beginner',
        "yearsOfExperience" integer NOT NULL DEFAULT '0',
        "hourlyRate" numeric(5,2) NOT NULL,
        "skills" text,
        "certifications" text,
        "languages" text,
        "availability" text,
        "serviceAreas" text,
        "specializations" text,
        "education" text,
        "workHistory" text,
        "references" text,
        "backgroundCheck" text,
        "insurance" text,
        "photos" text,
        "videos" text,
        "documents" text,
        "isVerified" boolean NOT NULL DEFAULT false,
        "verifiedAt" TIMESTAMP,
        "verifiedBy" character varying,
        "averageRating" numeric(3,2) NOT NULL DEFAULT '0',
        "totalReviews" integer NOT NULL DEFAULT '0',
        "totalBookings" integer NOT NULL DEFAULT '0',
        "completedBookings" integer NOT NULL DEFAULT '0',
        "cancelledBookings" integer NOT NULL DEFAULT '0',
        "totalEarnings" numeric(10,2) NOT NULL DEFAULT '0',
        "preferences" text,
        "settings" text,
        "metadata" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "userId" uuid NOT NULL,
        CONSTRAINT "REL_1234567890abcdef1234567890abcdef" UNIQUE ("userId"),
        CONSTRAINT "PK_1234567890abcdef1234567890abcdef" PRIMARY KEY ("id")
      )
    `);

    // Create parent_profiles table
    await queryRunner.query(`
      CREATE TABLE "parent_profiles" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "bio" text,
        "familySize" "public"."family_size_enum" NOT NULL DEFAULT 'small',
        "incomeLevel" "public"."income_level_enum" NOT NULL DEFAULT 'middle',
        "children" text,
        "preferences" text,
        "requirements" text,
        "emergencyContacts" text,
        "homeInfo" text,
        "pets" text,
        "allergies" text,
        "specialNeeds" text,
        "activities" text,
        "schedule" text,
        "rules" text,
        "photos" text,
        "documents" text,
        "isVerified" boolean NOT NULL DEFAULT false,
        "verifiedAt" TIMESTAMP,
        "verifiedBy" character varying,
        "totalBookings" integer NOT NULL DEFAULT '0',
        "completedBookings" integer NOT NULL DEFAULT '0',
        "cancelledBookings" integer NOT NULL DEFAULT '0',
        "totalSpent" numeric(10,2) NOT NULL DEFAULT '0',
        "averageRating" numeric(3,2) NOT NULL DEFAULT '0',
        "totalReviews" integer NOT NULL DEFAULT '0',
        "preferences" text,
        "settings" text,
        "metadata" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "userId" uuid NOT NULL,
        CONSTRAINT "REL_abcdef1234567890abcdef1234567890" UNIQUE ("userId"),
        CONSTRAINT "PK_abcdef1234567890abcdef1234567890" PRIMARY KEY ("id")
      )
    `);

    // Create bookings table
    await queryRunner.query(`
      CREATE TABLE "bookings" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "parentId" character varying NOT NULL,
        "sitterId" character varying NOT NULL,
        "startTime" TIMESTAMP NOT NULL,
        "endTime" TIMESTAMP NOT NULL,
        "childrenCount" integer NOT NULL,
        "specialInstructions" text,
        "location" text,
        "hourlyRate" numeric(10,2) NOT NULL,
        "status" "public"."booking_status_enum" NOT NULL DEFAULT 'pending',
        "totalAmount" numeric(5,2),
        "cancellationReason" text,
        "cancelledAt" TIMESTAMP,
        "cancelledBy" character varying,
        "confirmedAt" TIMESTAMP,
        "startedAt" TIMESTAMP,
        "completedAt" TIMESTAMP,
        "rating" numeric(3,2),
        "review" text,
        "checkIns" jsonb,
        "photos" jsonb,
        "activities" jsonb,
        "expenses" jsonb,
        "emergencyContacts" jsonb,
        "children" jsonb,
        "requirements" jsonb,
        "schedule" jsonb,
        "communication" jsonb,
        "safety" jsonb,
        "feedback" jsonb,
        "payment" jsonb,
        "insurance" jsonb,
        "documents" jsonb,
        "settings" jsonb,
        "matchScore" numeric(5,2),
        "aiMatchScore" numeric(5,2),
        "aiRating" numeric(3,2),
        "experience" integer,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_1234567890abcdef1234567890abcdef" PRIMARY KEY ("id")
      )
    `);

    // Create payments table
    await queryRunner.query(`
      CREATE TABLE "payments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "type" "public"."payment_type_enum" NOT NULL DEFAULT 'booking',
        "status" "public"."payment_status_enum" NOT NULL DEFAULT 'pending',
        "amount" numeric(10,2) NOT NULL,
        "fee" numeric(10,2) NOT NULL DEFAULT '0',
        "totalAmount" numeric(10,2) NOT NULL,
        "stripePaymentIntentId" character varying,
        "stripeTransferId" character varying,
        "stripeRefundId" character varying,
        "description" text,
        "metadata" text,
        "processedAt" TIMESTAMP,
        "refundedAt" TIMESTAMP,
        "refundReason" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "userId" character varying NOT NULL,
        "bookingId" character varying,
        CONSTRAINT "PK_1234567890abcdef1234567890abcdef" PRIMARY KEY ("id")
      )
    `);

    // Create reviews table
    await queryRunner.query(`
      CREATE TABLE "reviews" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "type" "public"."review_type_enum" NOT NULL DEFAULT 'parent_to_sitter',
        "rating" integer NOT NULL,
        "comment" text,
        "tags" text,
        "isAnonymous" boolean NOT NULL DEFAULT false,
        "isVerified" boolean NOT NULL DEFAULT false,
        "response" text,
        "respondedAt" TIMESTAMP,
        "metadata" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "reviewerId" character varying NOT NULL,
        "revieweeId" character varying NOT NULL,
        "bookingId" character varying,
        CONSTRAINT "PK_1234567890abcdef1234567890abcdef" PRIMARY KEY ("id")
      )
    `);

    // Create sessions table
    await queryRunner.query(`
      CREATE TABLE "sessions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "status" "public"."session_status_enum" NOT NULL DEFAULT 'active',
        "startTime" TIMESTAMP NOT NULL,
        "endTime" TIMESTAMP,
        "durationMinutes" integer NOT NULL DEFAULT '0',
        "startLatitude" numeric(10,8),
        "startLongitude" numeric(11,8),
        "endLatitude" numeric(10,8),
        "endLongitude" numeric(11,8),
        "locationHistory" text,
        "activities" text,
        "photos" text,
        "notes" text,
        "emergencyAlerts" text,
        "checkIns" text,
        "metadata" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "bookingId" character varying NOT NULL,
        CONSTRAINT "PK_1234567890abcdef1234567890abcdef" PRIMARY KEY ("id")
      )
    `);

    // Create messages table
    await queryRunner.query(`
      CREATE TABLE "messages" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "type" "public"."message_type_enum" NOT NULL DEFAULT 'text',
        "status" "public"."message_status_enum" NOT NULL DEFAULT 'sent',
        "content" text NOT NULL,
        "metadata" text,
        "isEdited" boolean NOT NULL DEFAULT false,
        "editedAt" TIMESTAMP,
        "editHistory" text,
        "isDeleted" boolean NOT NULL DEFAULT false,
        "deletedAt" TIMESTAMP,
        "isPinned" boolean NOT NULL DEFAULT false,
        "pinnedAt" TIMESTAMP,
        "replyTo" text,
        "reactions" text,
        "isUrgent" boolean NOT NULL DEFAULT false,
        "requiresAction" boolean NOT NULL DEFAULT false,
        "actionType" text,
        "actionData" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "senderId" character varying NOT NULL,
        "receiverId" character varying NOT NULL,
        "bookingId" character varying,
        CONSTRAINT "PK_1234567890abcdef1234567890abcdef" PRIMARY KEY ("id")
      )
    `);

    // Create verification_documents table
    await queryRunner.query(`
      CREATE TABLE "verification_documents" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "documentType" "public"."document_type_enum" NOT NULL,
        "status" "public"."verification_status_enum" NOT NULL DEFAULT 'pending',
        "documentUrl" text NOT NULL,
        "thumbnailUrl" text,
        "fileName" text,
        "fileSize" text,
        "mimeType" text,
        "documentNumber" text,
        "issueDate" TIMESTAMP,
        "expiryDate" TIMESTAMP,
        "issuingAuthority" text,
        "issuingCountry" text,
        "documentData" text,
        "verificationNotes" text,
        "reviewedAt" TIMESTAMP,
        "reviewedBy" text,
        "rejectionReason" text,
        "metadata" text,
        "isPrimary" boolean NOT NULL DEFAULT false,
        "isVerified" boolean NOT NULL DEFAULT false,
        "verifiedAt" TIMESTAMP,
        "verificationMethod" text,
        "confidenceScore" numeric(3,2),
        "aiAnalysis" text,
        "isExpired" boolean NOT NULL DEFAULT false,
        "requiresRenewal" boolean NOT NULL DEFAULT false,
        "renewalReminderSent" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "userId" character varying NOT NULL,
        CONSTRAINT "PK_1234567890abcdef1234567890abcdef" PRIMARY KEY ("id")
      )
    `);

    // Create notifications table
    await queryRunner.query(`
      CREATE TABLE "notifications" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "type" "public"."notification_type_enum" NOT NULL,
        "priority" "public"."notification_priority_enum" NOT NULL DEFAULT 'normal',
        "status" "public"."notification_status_enum" NOT NULL DEFAULT 'pending',
        "channel" "public"."notification_channel_enum" NOT NULL DEFAULT 'push',
        "title" text NOT NULL,
        "message" text NOT NULL,
        "subtitle" text,
        "imageUrl" text,
        "deepLink" text,
        "actionUrl" text,
        "actionText" text,
        "metadata" text,
        "category" text,
        "threadId" text,
        "isRead" boolean NOT NULL DEFAULT false,
        "readAt" TIMESTAMP,
        "isArchived" boolean NOT NULL DEFAULT false,
        "archivedAt" TIMESTAMP,
        "isSilent" boolean NOT NULL DEFAULT false,
        "requiresAction" boolean NOT NULL DEFAULT false,
        "actionType" text,
        "actionData" text,
        "retryCount" integer NOT NULL DEFAULT '0',
        "lastRetryAt" TIMESTAMP,
        "failureReason" text,
        "scheduledAt" TIMESTAMP,
        "sentAt" TIMESTAMP,
        "deliveredAt" TIMESTAMP,
        "deviceToken" text,
        "emailAddress" text,
        "phoneNumber" text,
        "webhookUrl" text,
        "webhookResponse" text,
        "webhookStatusCode" integer,
        "tags" text,
        "isTest" boolean NOT NULL DEFAULT false,
        "campaignId" text,
        "batchId" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "userId" character varying NOT NULL,
        CONSTRAINT "PK_1234567890abcdef1234567890abcdef" PRIMARY KEY ("id")
      )
    `);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "sitter_profiles" ADD CONSTRAINT "FK_1234567890abcdef1234567890abcdef" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "parent_profiles" ADD CONSTRAINT "FK_abcdef1234567890abcdef1234567890" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "bookings" ADD CONSTRAINT "FK_1234567890abcdef1234567890abcdef" 
      FOREIGN KEY ("parentId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "bookings" ADD CONSTRAINT "FK_abcdef1234567890abcdef1234567890" 
      FOREIGN KEY ("sitterId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "payments" ADD CONSTRAINT "FK_1234567890abcdef1234567890abcdef" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "payments" ADD CONSTRAINT "FK_abcdef1234567890abcdef1234567890" 
      FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "reviews" ADD CONSTRAINT "FK_1234567890abcdef1234567890abcdef" 
      FOREIGN KEY ("reviewerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "reviews" ADD CONSTRAINT "FK_abcdef1234567890abcdef1234567890" 
      FOREIGN KEY ("revieweeId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "reviews" ADD CONSTRAINT "FK_1234567890abcdef1234567890abcdef" 
      FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "sessions" ADD CONSTRAINT "FK_1234567890abcdef1234567890abcdef" 
      FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "messages" ADD CONSTRAINT "FK_1234567890abcdef1234567890abcdef" 
      FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "messages" ADD CONSTRAINT "FK_abcdef1234567890abcdef1234567890" 
      FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "messages" ADD CONSTRAINT "FK_1234567890abcdef1234567890abcdef" 
      FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "verification_documents" ADD CONSTRAINT "FK_1234567890abcdef1234567890abcdef" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "notifications" ADD CONSTRAINT "FK_1234567890abcdef1234567890abcdef" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX "IDX_bookings_parent_status" ON "bookings" ("parentId", "status")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_bookings_sitter_status" ON "bookings" ("sitterId", "status")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_bookings_start_end" ON "bookings" ("startTime", "endTime")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_messages_booking_created" ON "messages" ("bookingId", "createdAt")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_messages_sender_receiver" ON "messages" ("senderId", "receiverId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_verification_documents_user_type" ON "verification_documents" ("userId", "documentType")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_verification_documents_status_created" ON "verification_documents" ("status", "createdAt")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_notifications_user_created" ON "notifications" ("userId", "createdAt")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_notifications_status_priority" ON "notifications" ("status", "priority")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_notifications_type_created" ON "notifications" ("type", "createdAt")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_notifications_type_created"`);
    await queryRunner.query(`DROP INDEX "IDX_notifications_status_priority"`);
    await queryRunner.query(`DROP INDEX "IDX_notifications_user_created"`);
    await queryRunner.query(`DROP INDEX "IDX_verification_documents_status_created"`);
    await queryRunner.query(`DROP INDEX "IDX_verification_documents_user_type"`);
    await queryRunner.query(`DROP INDEX "IDX_messages_sender_receiver"`);
    await queryRunner.query(`DROP INDEX "IDX_messages_booking_created"`);
    await queryRunner.query(`DROP INDEX "IDX_bookings_start_end"`);
    await queryRunner.query(`DROP INDEX "IDX_bookings_sitter_status"`);
    await queryRunner.query(`DROP INDEX "IDX_bookings_parent_status"`);

    // Drop foreign key constraints
    await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_1234567890abcdef1234567890abcdef"`);
    await queryRunner.query(`ALTER TABLE "verification_documents" DROP CONSTRAINT "FK_1234567890abcdef1234567890abcdef"`);
    await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_1234567890abcdef1234567890abcdef"`);
    await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_abcdef1234567890abcdef1234567890"`);
    await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_1234567890abcdef1234567890abcdef"`);
    await queryRunner.query(`ALTER TABLE "sessions" DROP CONSTRAINT "FK_1234567890abcdef1234567890abcdef"`);
    await queryRunner.query(`ALTER TABLE "reviews" DROP CONSTRAINT "FK_1234567890abcdef1234567890abcdef"`);
    await queryRunner.query(`ALTER TABLE "reviews" DROP CONSTRAINT "FK_abcdef1234567890abcdef1234567890"`);
    await queryRunner.query(`ALTER TABLE "reviews" DROP CONSTRAINT "FK_1234567890abcdef1234567890abcdef"`);
    await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_abcdef1234567890abcdef1234567890"`);
    await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_1234567890abcdef1234567890abcdef"`);
    await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_abcdef1234567890abcdef1234567890"`);
    await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_1234567890abcdef1234567890abcdef"`);
    await queryRunner.query(`ALTER TABLE "parent_profiles" DROP CONSTRAINT "FK_abcdef1234567890abcdef1234567890"`);
    await queryRunner.query(`ALTER TABLE "sitter_profiles" DROP CONSTRAINT "FK_1234567890abcdef1234567890abcdef"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE "notifications"`);
    await queryRunner.query(`DROP TABLE "verification_documents"`);
    await queryRunner.query(`DROP TABLE "messages"`);
    await queryRunner.query(`DROP TABLE "sessions"`);
    await queryRunner.query(`DROP TABLE "reviews"`);
    await queryRunner.query(`DROP TABLE "payments"`);
    await queryRunner.query(`DROP TABLE "bookings"`);
    await queryRunner.query(`DROP TABLE "parent_profiles"`);
    await queryRunner.query(`DROP TABLE "sitter_profiles"`);
    await queryRunner.query(`DROP TABLE "users"`);

    // Drop enum types
    await queryRunner.query(`DROP TYPE "public"."session_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."income_level_enum"`);
    await queryRunner.query(`DROP TYPE "public"."family_size_enum"`);
    await queryRunner.query(`DROP TYPE "public"."experience_level_enum"`);
    await queryRunner.query(`DROP TYPE "public"."notification_channel_enum"`);
    await queryRunner.query(`DROP TYPE "public"."notification_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."notification_priority_enum"`);
    await queryRunner.query(`DROP TYPE "public"."notification_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."verification_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."document_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."message_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."message_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."review_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."payment_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."payment_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."booking_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."subscription_tier_enum"`);
    await queryRunner.query(`DROP TYPE "public"."user_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."user_type_enum"`);
  }
} 