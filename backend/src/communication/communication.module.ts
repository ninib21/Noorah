import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './email.service';
import { SmsService } from './sms.service';
import { NotificationService } from './notification.service';

@Module({
  imports: [ConfigModule],
  providers: [EmailService, SmsService, NotificationService],
  exports: [EmailService, SmsService, NotificationService],
})
export class CommunicationModule {} 