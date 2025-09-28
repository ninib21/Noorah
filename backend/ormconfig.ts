import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from './src/entities/user.entity';
import { Booking } from './src/entities/booking.entity';
import { Payment } from './src/entities/payment.entity';
import { Review } from './src/entities/review.entity';
import { Session } from './src/entities/session.entity';
import { SitterProfile } from './src/entities/sitter-profile.entity';
import { ParentProfile } from './src/entities/parent-profile.entity';
import { Message } from './src/entities/message.entity';
import { VerificationDocument } from './src/entities/verification-document.entity';
import { Notification } from './src/entities/notification.entity';

const configService = new ConfigService();

export default new DataSource({
  type: 'sqlite',
  database: 'Noorah.db',
  entities: [
    User,
    Booking,
    Payment,
    Review,
    Session,
    SitterProfile,
    ParentProfile,
    Message,
    VerificationDocument,
    Notification,
  ],
  migrations: ['src/migrations/*.ts'],
  synchronize: true,
  logging: configService.get('NODE_ENV') === 'development',
}); 
