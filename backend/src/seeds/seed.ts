import { DataSource } from 'typeorm';
import { User, UserType, UserStatus } from '../entities/user.entity';
import { Booking, BookingStatus } from '../entities/booking.entity';
import { Payment, PaymentType, PaymentStatus } from '../entities/payment.entity';
import { Review, ReviewType } from '../entities/review.entity';
import { SitterProfile, ExperienceLevel } from '../entities/sitter-profile.entity';
import { ParentProfile, FamilySize, IncomeLevel } from '../entities/parent-profile.entity';
import { Message, MessageType, MessageStatus } from '../entities/message.entity';
import { VerificationDocument, DocumentType, DocumentStatus } from '../entities/verification-document.entity';
import { Notification, NotificationType, NotificationPriority, NotificationStatus, NotificationChannel } from '../entities/notification.entity';
import { Session, SessionStatus } from '../entities/session.entity';
import * as bcrypt from 'bcryptjs';

export class SeedService {
  constructor(private dataSource: DataSource) {}

  async seed(): Promise<void> {
    console.log('🌱 Starting database seeding...');

    // Create users
    const users = await this.createUsers();
    console.log(`✅ Created ${users.length} users`);

    // Create profiles
    await this.createProfiles(users);
    console.log('✅ Created user profiles');

    // Create bookings
    const bookings = await this.createBookings(users);
    console.log(`✅ Created ${bookings.length} bookings`);

    // Create payments
    await this.createPayments(users, bookings);
    console.log('✅ Created payments');

    // Create reviews
    await this.createReviews(users, bookings);
    console.log('✅ Created reviews');

    // Create messages
    await this.createMessages(users, bookings);
    console.log('✅ Created messages');

    // Create verification documents
    await this.createVerificationDocuments(users);
    console.log('✅ Created verification documents');

    // Create notifications
    await this.createNotifications(users);
    console.log('✅ Created notifications');

    // Create sessions
    await this.createSessions(bookings);
    console.log('✅ Created sessions');

    console.log('🎉 Database seeding completed successfully!');
  }

  private async createUsers(): Promise<User[]> {
    const userRepository = this.dataSource.getRepository(User);
    
    const users = [
      // Admin user
      {
        email: 'admin@nannyradar.com',
        phone: '+1234567890',
        password: await bcrypt.hash('admin123', 10),
        firstName: 'Admin',
        lastName: 'User',
        userType: UserType.ADMIN,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        phoneVerified: true,
      },
      // Parent users
      {
        email: 'sarah.johnson@example.com',
        phone: '+1234567891',
        password: await bcrypt.hash('password123', 10),
        firstName: 'Sarah',
        lastName: 'Johnson',
        userType: UserType.PARENT,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        phoneVerified: true,
      },
      {
        email: 'mike.chen@example.com',
        phone: '+1234567892',
        password: await bcrypt.hash('password123', 10),
        firstName: 'Mike',
        lastName: 'Chen',
        userType: UserType.PARENT,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        phoneVerified: true,
      },
      // Sitter users
      {
        email: 'emma.wilson@example.com',
        phone: '+1234567893',
        password: await bcrypt.hash('password123', 10),
        firstName: 'Emma',
        lastName: 'Wilson',
        userType: UserType.SITTER,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        phoneVerified: true,
        hourlyRate: 25.00,
        averageRating: 4.8,
        totalReviews: 15,
      },
      {
        email: 'james.rodriguez@example.com',
        phone: '+1234567894',
        password: await bcrypt.hash('password123', 10),
        firstName: 'James',
        lastName: 'Rodriguez',
        userType: UserType.SITTER,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        phoneVerified: true,
        hourlyRate: 30.00,
        averageRating: 4.9,
        totalReviews: 22,
      },
      {
        email: 'lisa.thompson@example.com',
        phone: '+1234567895',
        password: await bcrypt.hash('password123', 10),
        firstName: 'Lisa',
        lastName: 'Thompson',
        userType: UserType.SITTER,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        phoneVerified: true,
        hourlyRate: 28.00,
        averageRating: 4.7,
        totalReviews: 18,
      },
    ];

    const savedUsers = await userRepository.save(users);
    return savedUsers;
  }

  private async createProfiles(users: User[]): Promise<void> {
    const sitterProfileRepository = this.dataSource.getRepository(SitterProfile);
    const parentProfileRepository = this.dataSource.getRepository(ParentProfile);

    const sitters = users.filter(user => user.userType === UserType.SITTER);
    const parents = users.filter(user => user.userType === UserType.PARENT);

    // Create sitter profiles
    const sitterProfiles = sitters.map((sitter, index) => ({
      userId: sitter.id,
      bio: `Experienced childcare provider with ${5 + index} years of experience. I love working with children and creating fun, educational activities.`,
      experienceLevel: index === 0 ? ExperienceLevel.EXPERIENCED : ExperienceLevel.EXPERT,
      yearsOfExperience: 5 + index,
      hourlyRate: 25 + (index * 5),
      skills: JSON.stringify(['CPR Certified', 'First Aid', 'Child Development', 'Creative Activities', 'Homework Help']),
      certifications: JSON.stringify(['CPR Certification', 'First Aid Certification', 'Childcare Certificate']),
      languages: JSON.stringify(['English', 'Spanish']),
      availability: JSON.stringify({
        monday: { start: '09:00', end: '18:00', available: true },
        tuesday: { start: '09:00', end: '18:00', available: true },
        wednesday: { start: '09:00', end: '18:00', available: true },
        thursday: { start: '09:00', end: '18:00', available: true },
        friday: { start: '09:00', end: '18:00', available: true },
        saturday: { start: '10:00', end: '16:00', available: true },
        sunday: { start: '10:00', end: '16:00', available: false },
      }),
      serviceAreas: JSON.stringify(['Downtown', 'Midtown', 'Uptown']),
      specializations: JSON.stringify(['Infants', 'Toddlers', 'School Age', 'Special Needs']),
      isVerified: true,
      verifiedAt: new Date(),
      totalBookings: 20 + (index * 10),
      completedBookings: 18 + (index * 9),
      cancelledBookings: 2 + index,
      totalEarnings: 5000 + (index * 1000),
    }));

    // Create parent profiles
    const parentProfiles = parents.map((parent, index) => ({
      userId: parent.id,
      bio: `Looking for reliable childcare for my ${index === 0 ? '2' : '1'} children.`,
      familySize: index === 0 ? FamilySize.MEDIUM : FamilySize.SMALL,
      incomeLevel: index === 0 ? IncomeLevel.HIGH : IncomeLevel.MIDDLE,
      children: JSON.stringify([
        { name: index === 0 ? 'Emma' : 'Alex', age: 5 + index, specialNeeds: null, allergies: ['Peanuts'] },
        ...(index === 0 ? [{ name: 'Liam', age: 3, specialNeeds: null, allergies: [] }] : []),
      ]),
      preferences: JSON.stringify({
        maxDistance: 10,
        preferredAgeRange: { min: 25, max: 45 },
        preferredLanguages: ['English'],
        specialRequirements: ['CPR Certified', 'First Aid'],
      }),
      emergencyContacts: JSON.stringify([
        { name: 'Emergency Contact', phone: '+1234567890', relationship: 'Parent' },
      ]),
      totalBookings: 5 + (index * 3),
      completedBookings: 4 + (index * 2),
      cancelledBookings: 1 + index,
      totalSpent: 800 + (index * 400),
    }));

    await sitterProfileRepository.save(sitterProfiles);
    await parentProfileRepository.save(parentProfiles);
  }

  private async createBookings(users: User[]): Promise<Booking[]> {
    const bookingRepository = this.dataSource.getRepository(Booking);
    
    const parents = users.filter(user => user.userType === UserType.PARENT);
    const sitters = users.filter(user => user.userType === UserType.SITTER);

    const bookings: any[] = [];
    const now = new Date();

    for (let i = 0; i < 10; i++) {
      const parent = parents[i % parents.length];
      const sitter = sitters[i % sitters.length];
      
      const startTime = new Date(now.getTime() + (i * 24 * 60 * 60 * 1000)); // Each booking 1 day apart
      const endTime = new Date(startTime.getTime() + (4 * 60 * 60 * 1000)); // 4 hours duration

      const booking = {
        parentId: parent.id,
        sitterId: sitter.id,
        startTime,
        endTime,
        childrenCount: i % 2 === 0 ? 1 : 2,
        specialInstructions: i % 3 === 0 ? 'Please bring educational toys' : undefined,
        location: `Address ${i + 1}, City, State`,
        hourlyRate: sitter.hourlyRate,
        status: i < 3 ? BookingStatus.COMPLETED : 
                i < 6 ? BookingStatus.CONFIRMED : 
                BookingStatus.PENDING,
        totalAmount: sitter.hourlyRate * 4,
        confirmedAt: i < 6 ? new Date(startTime.getTime() - (24 * 60 * 60 * 1000)) : undefined,
        startedAt: i < 3 ? startTime : undefined,
        completedAt: i < 3 ? endTime : undefined,
        rating: i < 3 ? 4 + (Math.random() * 1) : undefined,
        review: i < 3 ? `Great experience with ${sitter.firstName}!` : undefined,
        checkIns: i < 3 ? JSON.stringify([
          { time: startTime, location: { latitude: 40.7128, longitude: -74.0060, address: 'New York, NY' }, photos: [] }
        ]) : null,
        children: JSON.stringify([
          { name: 'Child', age: 5 + (i % 3), specialNeeds: null, allergies: i % 2 === 0 ? ['Peanuts'] : [] }
        ]),
        requirements: JSON.stringify({
          meals: true,
          transportation: false,
          homework: true,
          activities: ['Arts and Crafts', 'Outdoor Play']
        }),
        safety: JSON.stringify({
          emergencyProcedures: ['Call 911', 'Contact Parent'],
          medicalInfo: { allergies: ['Peanuts'], medications: [], conditions: [] },
          contactProtocol: { whenToContact: ['Emergency', 'Injury'], emergencyNumbers: ['911'] }
        }),
        matchScore: 0.8 + (Math.random() * 0.2),
        aiMatchScore: 0.85 + (Math.random() * 0.15),
      };

      bookings.push(booking);
    }

    const savedBookings = await bookingRepository.save(bookings);
    return savedBookings;
  }

  private async createPayments(users: User[], bookings: Booking[]): Promise<void> {
    const paymentRepository = this.dataSource.getRepository(Payment);

    const payments = bookings.map((booking, index) => ({
      type: PaymentType.BOOKING,
      status: index < 6 ? PaymentStatus.PAID : PaymentStatus.PENDING,
      amount: booking.totalAmount,
      fee: booking.totalAmount * 0.1, // 10% platform fee
      totalAmount: booking.totalAmount * 1.1,
      stripePaymentIntentId: index < 6 ? `pi_${Math.random().toString(36).substr(2, 9)}` : undefined,
      stripeTransferId: index < 3 ? `tr_${Math.random().toString(36).substr(2, 9)}` : undefined,
      description: `Payment for booking ${booking.id}`,
      processedAt: index < 6 ? new Date() : undefined,
      userId: booking.parentId,
      bookingId: booking.id,
    }));

    await paymentRepository.save(payments);
  }

  private async createReviews(users: User[], bookings: Booking[]): Promise<void> {
    const reviewRepository = this.dataSource.getRepository(Review);

    const completedBookings = bookings.filter(booking => booking.status === BookingStatus.COMPLETED);
    
    const reviews = completedBookings.map((booking, index) => ({
      type: ReviewType.PARENT_TO_SITTER,
      rating: 4 + (Math.random() * 1),
      comment: `Great experience with ${booking.sitter.firstName}! Very professional and caring.`,
      tags: JSON.stringify(['punctual', 'caring', 'professional']),
      isAnonymous: false,
      isVerified: true,
      reviewerId: booking.parentId,
      revieweeId: booking.sitterId,
      bookingId: booking.id,
    }));

    await reviewRepository.save(reviews);
  }

  private async createMessages(users: User[], bookings: Booking[]): Promise<void> {
    const messageRepository = this.dataSource.getRepository(Message);

    const messages: any[] = [];
    
    bookings.forEach((booking, bookingIndex) => {
      // Create conversation between parent and sitter
      const conversation = [
        {
          type: MessageType.TEXT,
          status: MessageStatus.READ,
          content: `Hi ${booking.sitter.firstName}, I'm looking for childcare on ${booking.startTime.toLocaleDateString()}.`,
          senderId: booking.parentId,
          receiverId: booking.sitterId,
          bookingId: booking.id,
          createdAt: new Date(booking.startTime.getTime() - (7 * 24 * 60 * 60 * 1000)), // 7 days before
        },
        {
          type: MessageType.TEXT,
          status: MessageStatus.READ,
          content: `Hi ${booking.parent.firstName}! I'd be happy to help. What time do you need me?`,
          senderId: booking.sitterId,
          receiverId: booking.parentId,
          bookingId: booking.id,
          createdAt: new Date(booking.startTime.getTime() - (6 * 24 * 60 * 60 * 1000)),
        },
        {
          type: MessageType.TEXT,
          status: MessageStatus.READ,
          content: `I need you from ${booking.startTime.toLocaleTimeString()} to ${booking.endTime.toLocaleTimeString()}.`,
          senderId: booking.parentId,
          receiverId: booking.sitterId,
          bookingId: booking.id,
          createdAt: new Date(booking.startTime.getTime() - (5 * 24 * 60 * 60 * 1000)),
        },
        {
          type: MessageType.TEXT,
          status: MessageStatus.READ,
          content: `Perfect! I'll be there. Do you have any special instructions?`,
          senderId: booking.sitterId,
          receiverId: booking.parentId,
          bookingId: booking.id,
          createdAt: new Date(booking.startTime.getTime() - (4 * 24 * 60 * 60 * 1000)),
        },
        {
          type: MessageType.TEXT,
          status: MessageStatus.READ,
          content: booking.specialInstructions || `Just the usual routine. Thanks!`,
          senderId: booking.parentId,
          receiverId: booking.sitterId,
          bookingId: booking.id,
          createdAt: new Date(booking.startTime.getTime() - (3 * 24 * 60 * 60 * 1000)),
        },
      ];

      messages.push(...conversation);
    });

    await messageRepository.save(messages);
  }

  private async createVerificationDocuments(users: User[]): Promise<void> {
    const verificationRepository = this.dataSource.getRepository(VerificationDocument);

    const sitters = users.filter(user => user.userType === UserType.SITTER);
    
    const documents = sitters.flatMap(sitter => [
      {
        userId: sitter.id,
        documentType: DocumentType.IDENTITY,
        status: DocumentStatus.APPROVED,
        documentUrl: 'https://example.com/id-card.jpg',
        fileName: 'id-card.jpg',
        fileSize: '2.5MB',
        mimeType: 'image/jpeg',
        documentNumber: 'ID123456789',
        issueDate: new Date('2023-01-15'),
        expiryDate: new Date('2028-01-15'),
        metadata: JSON.stringify({
          issuingAuthority: 'State Department',
          documentCategory: 'Government ID',
        }),
        confidenceScore: 0.95,
      },
      {
        userId: sitter.id,
        documentType: DocumentType.CERTIFICATION,
        status: DocumentStatus.APPROVED,
        documentUrl: 'https://example.com/selfie.jpg',
        fileName: 'selfie.jpg',
        fileSize: '1.2MB',
        mimeType: 'image/jpeg',
        documentNumber: 'SELFIE001',
        issueDate: new Date('2023-02-01'),
        expiryDate: new Date('2024-02-01'),
        metadata: JSON.stringify({
          verificationMethod: 'Face Recognition',
          confidenceLevel: 'High',
        }),
        confidenceScore: 0.92,
      },
      {
        userId: sitter.id,
        documentType: DocumentType.CERTIFICATION,
        status: DocumentStatus.APPROVED,
        documentUrl: 'https://example.com/cpr-cert.jpg',
        fileName: 'cpr-cert.jpg',
        fileSize: '3.1MB',
        mimeType: 'image/jpeg',
        documentNumber: 'CPR2023001',
        issueDate: new Date('2023-03-10'),
        expiryDate: new Date('2025-03-10'),
        metadata: JSON.stringify({
          certificationType: 'CPR',
          issuingOrganization: 'American Red Cross',
          instructorName: 'Dr. Smith',
        }),
        confidenceScore: 0.98,
      },
    ]);

    await verificationRepository.save(documents);
  }

  private async createNotifications(users: User[]): Promise<void> {
    const notificationRepository = this.dataSource.getRepository(Notification);

    const notifications = users.flatMap(user => [
      {
        userId: user.id,
        type: NotificationType.WELCOME,
        priority: NotificationPriority.NORMAL,
        status: NotificationStatus.SENT,
        channel: NotificationChannel.PUSH,
        title: 'Welcome to NannyRadar!',
        message: 'Thank you for joining our community. We\'re excited to help you find great childcare.',
        sentAt: new Date(user.createdAt.getTime() + (24 * 60 * 60 * 1000)),
        deliveredAt: new Date(user.createdAt.getTime() + (24 * 60 * 60 * 1000) + (5 * 60 * 1000)),
      },
      {
        userId: user.id,
        type: NotificationType.SYSTEM_UPDATE,
        priority: NotificationPriority.LOW,
        status: NotificationStatus.SENT,
        channel: NotificationChannel.IN_APP,
        title: 'App Update Available',
        message: 'A new version of NannyRadar is available with improved features.',
        sentAt: new Date(),
        deliveredAt: new Date(),
      },
    ]);

    await notificationRepository.save(notifications);
  }

  private async createSessions(bookings: Booking[]): Promise<void> {
    const sessionRepository = this.dataSource.getRepository(Session);

    const completedBookings = bookings.filter(booking => booking.status === BookingStatus.COMPLETED);
    
    const sessions = completedBookings.map(booking => ({
      bookingId: booking.id,
      status: SessionStatus.COMPLETED,
      startTime: booking.startedAt,
      endTime: booking.completedAt,
      durationMinutes: Math.round((booking.completedAt.getTime() - booking.startedAt.getTime()) / (1000 * 60)),
      startLatitude: 40.7128,
      startLongitude: -74.0060,
      endLatitude: 40.7128,
      endLongitude: -74.0060,
      locationHistory: JSON.stringify([
        { latitude: 40.7128, longitude: -74.0060, timestamp: booking.startedAt }
      ]),
      activities: JSON.stringify([
        { name: 'Arts and Crafts', description: 'Made paper airplanes', startTime: booking.startedAt, endTime: new Date(booking.startedAt.getTime() + (60 * 60 * 1000)), photos: [] },
        { name: 'Outdoor Play', description: 'Played in the park', startTime: new Date(booking.startedAt.getTime() + (60 * 60 * 1000)), endTime: new Date(booking.startedAt.getTime() + (2 * 60 * 60 * 1000)), photos: [] }
      ]),
      photos: JSON.stringify([
        { url: 'https://example.com/activity1.jpg', caption: 'Arts and crafts time', uploadedAt: booking.startedAt },
        { url: 'https://example.com/activity2.jpg', caption: 'Park play', uploadedAt: new Date(booking.startedAt.getTime() + (60 * 60 * 1000)) }
      ]),
      notes: 'Great session! Children were well-behaved and engaged in activities.',
    }));

    await sessionRepository.save(sessions);
  }
} 