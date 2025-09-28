import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SittersModule } from './sitters/sitters.module';
import { BookingsModule } from './bookings/bookings.module';
import { PaymentsModule } from './payments/payments.module';
import { ReviewsModule } from './reviews/reviews.module';
import { AIModule } from './ai/ai.module';
// import { SecurityModule } from './security/security-minimal.module'; // Disabled for development
import { FileModule } from './file/file.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { SearchModule } from './search/search.module';
import { CommunicationModule } from './communication/communication.module';
import { FirebaseModule } from './firebase/firebase.module';
import { EnterpriseModule } from './enterprise/enterprise.module';
import { QuantumModule } from './quantum/quantum.module';
import { AgentsModule } from './agents/agents.module';
import { User } from './entities/user.entity';
import { SitterProfile } from './entities/sitter-profile.entity';
import { ParentProfile } from './entities/parent-profile.entity';
import { Booking } from './entities/booking.entity';
import { Payment } from './entities/payment.entity';
import { Review } from './entities/review.entity';
import { Notification } from './entities/notification.entity';
import { VerificationDocument } from './entities/verification-document.entity';
import { Message } from './entities/message.entity';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env.DB_PATH || 'Noorah.db',
      entities: [
        User,
        SitterProfile,
        ParentProfile,
        Booking,
        Payment,
        Review,
        Notification,
        VerificationDocument,
        Message,
      ],
      synchronize: true,
      logging: process.env.NODE_ENV === 'development',
    }),
    AuthModule,
    UsersModule,
    SittersModule,
    BookingsModule,
    PaymentsModule,
    ReviewsModule,
    AIModule,
    // SecurityModule, // Disabled for development
    FileModule,
    MonitoringModule,
    SearchModule,
    CommunicationModule,
    FirebaseModule,
    EnterpriseModule,
    QuantumModule,
    AgentsModule,
  ],
})
export class AppModule {} 
