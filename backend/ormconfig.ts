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
  type: 'postgres',
  host: configService.get('DB_HOST') || 'localhost',
  port: parseInt(configService.get('DB_PORT')) || 5432,
  username: configService.get('DB_USERNAME') || 'postgres',
  password: configService.get('DB_PASSWORD') || 'password',
  database: configService.get('DB_NAME') || 'nannyradar',
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
  synchronize: configService.get('NODE_ENV') !== 'production',
  logging: configService.get('NODE_ENV') === 'development',
  ssl: configService.get('NODE_ENV') === 'production' 
    ? { rejectUnauthorized: false } 
    : false,
}); 