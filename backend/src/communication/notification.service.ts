import { Injectable } from '@nestjs/common';
import { EmailService } from './email.service';
import { SmsService } from './sms.service';

export interface NotificationOptions {
  email?: boolean;
  sms?: boolean;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

@Injectable()
export class NotificationService {
  constructor(
    private emailService: EmailService,
    private smsService: SmsService,
  ) {}

  async sendNotification(
    userId: string,
    type: string,
    data: any,
    options: NotificationOptions = {},
  ): Promise<boolean> {
    const { email = true, sms = false, priority = 'normal' } = options;
    let success = true;

    try {
      if (email && data.email) {
        const emailSent = await this.emailService.sendEmail(data.email);
        if (!emailSent) success = false;
      }

      if (sms && data.phoneNumber) {
        const smsSent = await this.smsService.sendSms(
          data.phoneNumber,
          this.generateSmsMessage(type, data),
        );
        if (!smsSent) success = false;
      }
    } catch (error) {
      console.error('Notification sending failed:', error);
      success = false;
    }

    return success;
  }

  async sendBookingNotification(
    userId: string,
    bookingData: any,
    options: NotificationOptions = {},
  ): Promise<boolean> {
    return this.sendNotification(userId, 'booking', bookingData, options);
  }

  async sendEmergencyNotification(
    userId: string,
    emergencyData: any,
    options: NotificationOptions = { priority: 'urgent' },
  ): Promise<boolean> {
    return this.sendNotification(userId, 'emergency', emergencyData, options);
  }

  async sendPaymentNotification(
    userId: string,
    paymentData: any,
    options: NotificationOptions = {},
  ): Promise<boolean> {
    return this.sendNotification(userId, 'payment', paymentData, options);
  }

  async sendReminderNotification(
    userId: string,
    reminderData: any,
    options: NotificationOptions = {},
  ): Promise<boolean> {
    return this.sendNotification(userId, 'reminder', reminderData, options);
  }

  private generateSmsMessage(type: string, data: any): string {
    switch (type) {
      case 'booking':
        return `Booking confirmed! Sitter: ${data.sitterName}, Date: ${data.date}, Time: ${data.time}. NannyRadar`;
      case 'emergency':
        return `EMERGENCY ALERT: ${data.type} at ${data.location}. NannyRadar support team has been notified.`;
      case 'payment':
        return `Payment ${data.status}: $${data.amount} for booking on ${data.date}. NannyRadar`;
      case 'reminder':
        return `Reminder: Your booking with ${data.sitterName} is in ${data.timeUntil} minutes. NannyRadar`;
      default:
        return `NannyRadar notification: ${data.message}`;
    }
  }
} 