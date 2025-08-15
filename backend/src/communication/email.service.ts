import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587') || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: options.from || process.env.SMTP_FROM || 'noreply@nannyradar.com',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Email send error:', error);
      return false;
    }
  }

  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    const html = `
      <h1>Welcome to NannyRadar, ${name}!</h1>
      <p>Thank you for joining our community of trusted babysitters and parents.</p>
      <p>We're excited to help you find the perfect match for your childcare needs.</p>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Welcome to NannyRadar!',
      html,
    });
  }

  async sendBookingConfirmation(email: string, bookingDetails: any): Promise<boolean> {
    const html = `
      <h1>Booking Confirmed!</h1>
      <p>Your booking has been confirmed for ${bookingDetails.date} at ${bookingDetails.time}.</p>
      <p>Sitter: ${bookingDetails.sitterName}</p>
      <p>Location: ${bookingDetails.location}</p>
      <p>Total: $${bookingDetails.amount}</p>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Booking Confirmation - NannyRadar',
      html,
    });
  }

  async sendPasswordReset(email: string, resetToken: string): Promise<boolean> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const html = `
      <h1>Password Reset Request</h1>
      <p>You requested a password reset for your NannyRadar account.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Password Reset - NannyRadar',
      html,
    });
  }

  async sendEmergencyAlert(email: string, emergencyDetails: any): Promise<boolean> {
    const html = `
      <h1>🚨 Emergency Alert</h1>
      <p>An emergency has been triggered for your booking.</p>
      <p>Details: ${emergencyDetails.description}</p>
      <p>Location: ${emergencyDetails.location}</p>
      <p>Time: ${emergencyDetails.timestamp}</p>
      <p>Please respond immediately.</p>
    `;

    return this.sendEmail({
      to: email,
      subject: '🚨 Emergency Alert - NannyRadar',
      html,
    });
  }
} 