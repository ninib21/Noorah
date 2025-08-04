import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SmsService {
  private twilioClient: any;

  constructor(private configService: ConfigService) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    
    if (accountSid && authToken) {
      this.twilioClient = require('twilio')(accountSid, authToken);
    }
  }

  async sendSms(to: string, message: string): Promise<boolean> {
    try {
      if (!this.twilioClient) {
        console.warn('Twilio not configured, SMS not sent');
        return false;
      }

      const from = this.configService.get<string>('TWILIO_PHONE_NUMBER');
      
      await this.twilioClient.messages.create({
        body: message,
        from: from,
        to: to,
      });

      return true;
    } catch (error) {
      console.error('SMS sending failed:', error);
      return false;
    }
  }

  async sendOtp(phoneNumber: string, otp: string): Promise<boolean> {
    const message = `Your NannyRadar verification code is: ${otp}. Valid for 10 minutes.`;
    return this.sendSms(phoneNumber, message);
  }

  async sendBookingConfirmation(phoneNumber: string, bookingDetails: any): Promise<boolean> {
    const message = `Booking confirmed! Sitter: ${bookingDetails.sitterName}, Date: ${bookingDetails.date}, Time: ${bookingDetails.time}. NannyRadar`;
    return this.sendSms(phoneNumber, message);
  }

  async sendEmergencyAlert(phoneNumber: string, emergencyDetails: any): Promise<boolean> {
    const message = `EMERGENCY ALERT: ${emergencyDetails.type} at ${emergencyDetails.location}. NannyRadar support team has been notified.`;
    return this.sendSms(phoneNumber, message);
  }

  async sendReminder(phoneNumber: string, reminderDetails: any): Promise<boolean> {
    const message = `Reminder: Your booking with ${reminderDetails.sitterName} is in ${reminderDetails.timeUntil} minutes. NannyRadar`;
    return this.sendSms(phoneNumber, message);
  }
} 