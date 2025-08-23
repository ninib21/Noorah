// Real Email Service with SendGrid Integration
const sgMail = require('@sendgrid/mail');
require('dotenv').config();

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

class EmailService {
    constructor() {
        this.fromEmail = process.env.FROM_EMAIL || 'noreply@nannyradar.com';
        this.supportEmail = process.env.SUPPORT_EMAIL || 'support@nannyradar.com';
        this.templates = {
            welcome: 'd-welcome-template-id',
            booking_confirmation: 'd-booking-confirmation-id',
            session_started: 'd-session-started-id',
            emergency_alert: 'd-emergency-alert-id',
            payment_receipt: 'd-payment-receipt-id',
            review_request: 'd-review-request-id'
        };
    }

    // Send welcome email to new users
    async sendWelcomeEmail(userEmail, userName, userRole) {
        try {
            const msg = {
                to: userEmail,
                from: {
                    email: this.fromEmail,
                    name: 'NannyRadar Team'
                },
                subject: `Welcome to NannyRadar, ${userName}!`,
                templateId: this.templates.welcome,
                dynamicTemplateData: {
                    user_name: userName,
                    user_role: userRole,
                    app_url: process.env.FRONTEND_URL,
                    support_email: this.supportEmail
                }
            };

            const result = await sgMail.send(msg);
            console.log('Welcome email sent successfully:', result[0].statusCode);
            return { success: true, messageId: result[0].headers['x-message-id'] };
        } catch (error) {
            console.error('Welcome email failed:', error);
            throw new Error(`Welcome email failed: ${error.message}`);
        }
    }

    // Send booking confirmation email
    async sendBookingConfirmation(booking, parentEmail, sitterEmail) {
        try {
            const messages = [
                {
                    to: parentEmail,
                    from: {
                        email: this.fromEmail,
                        name: 'NannyRadar Bookings'
                    },
                    subject: 'Booking Confirmed - NannyRadar',
                    templateId: this.templates.booking_confirmation,
                    dynamicTemplateData: {
                        booking_id: booking.id,
                        sitter_name: booking.sitterName,
                        start_time: booking.startTime,
                        end_time: booking.endTime,
                        location: booking.location,
                        total_amount: booking.totalAmount,
                        recipient_type: 'parent'
                    }
                },
                {
                    to: sitterEmail,
                    from: {
                        email: this.fromEmail,
                        name: 'NannyRadar Bookings'
                    },
                    subject: 'New Booking Request - NannyRadar',
                    templateId: this.templates.booking_confirmation,
                    dynamicTemplateData: {
                        booking_id: booking.id,
                        parent_name: booking.parentName,
                        start_time: booking.startTime,
                        end_time: booking.endTime,
                        location: booking.location,
                        total_amount: booking.totalAmount,
                        recipient_type: 'sitter'
                    }
                }
            ];

            const results = await sgMail.send(messages);
            console.log('Booking confirmation emails sent successfully');
            return { success: true, messageIds: results.map(r => r[0].headers['x-message-id']) };
        } catch (error) {
            console.error('Booking confirmation email failed:', error);
            throw new Error(`Booking confirmation failed: ${error.message}`);
        }
    }

    // Send session started notification
    async sendSessionStarted(session, parentEmail, sitterName) {
        try {
            const msg = {
                to: parentEmail,
                from: {
                    email: this.fromEmail,
                    name: 'NannyRadar Sessions'
                },
                subject: 'Babysitting Session Started',
                templateId: this.templates.session_started,
                dynamicTemplateData: {
                    session_id: session.id,
                    sitter_name: sitterName,
                    start_time: session.startTime,
                    location: session.location,
                    tracking_url: `${process.env.FRONTEND_URL}/sessions/${session.id}/track`
                }
            };

            const result = await sgMail.send(msg);
            console.log('Session started email sent successfully');
            return { success: true, messageId: result[0].headers['x-message-id'] };
        } catch (error) {
            console.error('Session started email failed:', error);
            throw new Error(`Session started email failed: ${error.message}`);
        }
    }

    // Send emergency alert email
    async sendEmergencyAlert(alert, emergencyContacts) {
        try {
            const messages = emergencyContacts.map(contact => ({
                to: contact.email,
                from: {
                    email: this.fromEmail,
                    name: 'NannyRadar Emergency'
                },
                subject: '🚨 EMERGENCY ALERT - NannyRadar',
                templateId: this.templates.emergency_alert,
                dynamicTemplateData: {
                    alert_type: alert.type,
                    location: alert.location,
                    timestamp: alert.timestamp,
                    sitter_name: alert.sitterName,
                    parent_name: alert.parentName,
                    emergency_message: alert.message,
                    contact_name: contact.name,
                    support_phone: '+1 (555) 911-HELP'
                }
            }));

            const results = await sgMail.send(messages);
            console.log('Emergency alert emails sent successfully');
            return { success: true, messageIds: results.map(r => r[0].headers['x-message-id']) };
        } catch (error) {
            console.error('Emergency alert email failed:', error);
            throw new Error(`Emergency alert email failed: ${error.message}`);
        }
    }

    // Send payment receipt
    async sendPaymentReceipt(payment, userEmail, userName) {
        try {
            const msg = {
                to: userEmail,
                from: {
                    email: this.fromEmail,
                    name: 'NannyRadar Payments'
                },
                subject: 'Payment Receipt - NannyRadar',
                templateId: this.templates.payment_receipt,
                dynamicTemplateData: {
                    user_name: userName,
                    payment_id: payment.id,
                    amount: payment.amount,
                    currency: payment.currency,
                    payment_method: payment.paymentMethod,
                    transaction_date: payment.createdAt,
                    booking_id: payment.bookingId,
                    receipt_url: `${process.env.FRONTEND_URL}/receipts/${payment.id}`
                }
            };

            const result = await sgMail.send(msg);
            console.log('Payment receipt email sent successfully');
            return { success: true, messageId: result[0].headers['x-message-id'] };
        } catch (error) {
            console.error('Payment receipt email failed:', error);
            throw new Error(`Payment receipt email failed: ${error.message}`);
        }
    }

    // Send review request after session
    async sendReviewRequest(booking, userEmail, userName, userRole) {
        try {
            const msg = {
                to: userEmail,
                from: {
                    email: this.fromEmail,
                    name: 'NannyRadar Reviews'
                },
                subject: 'How was your experience? Leave a review',
                templateId: this.templates.review_request,
                dynamicTemplateData: {
                    user_name: userName,
                    user_role: userRole,
                    booking_id: booking.id,
                    other_party_name: userRole === 'parent' ? booking.sitterName : booking.parentName,
                    session_date: booking.endTime,
                    review_url: `${process.env.FRONTEND_URL}/reviews/create/${booking.id}`
                }
            };

            const result = await sgMail.send(msg);
            console.log('Review request email sent successfully');
            return { success: true, messageId: result[0].headers['x-message-id'] };
        } catch (error) {
            console.error('Review request email failed:', error);
            throw new Error(`Review request email failed: ${error.message}`);
        }
    }

    // Send custom notification email
    async sendNotification(userEmail, subject, message, templateData = {}) {
        try {
            const msg = {
                to: userEmail,
                from: {
                    email: this.fromEmail,
                    name: 'NannyRadar'
                },
                subject: subject,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background: linear-gradient(135deg, #FF69B4, #6C63FF); padding: 20px; text-align: center;">
                            <h1 style="color: white; margin: 0;">NannyRadar</h1>
                        </div>
                        <div style="padding: 20px; background: #f9f9f9;">
                            <h2 style="color: #2C3E50;">${subject}</h2>
                            <p style="color: #555; line-height: 1.6;">${message}</p>
                            ${templateData.actionUrl ? `
                                <div style="text-align: center; margin: 20px 0;">
                                    <a href="${templateData.actionUrl}" style="background: #FF69B4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                                        ${templateData.actionText || 'View Details'}
                                    </a>
                                </div>
                            ` : ''}
                        </div>
                        <div style="padding: 20px; text-align: center; color: #888; font-size: 12px;">
                            <p>© 2024 NannyRadar. All rights reserved.</p>
                            <p>Need help? Contact us at ${this.supportEmail}</p>
                        </div>
                    </div>
                `
            };

            const result = await sgMail.send(msg);
            console.log('Custom notification email sent successfully');
            return { success: true, messageId: result[0].headers['x-message-id'] };
        } catch (error) {
            console.error('Custom notification email failed:', error);
            throw new Error(`Custom notification email failed: ${error.message}`);
        }
    }

    // Health check for SendGrid service
    async healthCheck() {
        try {
            // SendGrid doesn't have a direct health check, so we'll verify API key format
            if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_API_KEY.startsWith('SG.')) {
                return { status: 'unhealthy', error: 'Invalid SendGrid API key' };
            }

            return {
                status: 'healthy',
                service: 'SendGrid',
                from_email: this.fromEmail
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                error: error.message
            };
        }
    }

    // Bulk email sending for marketing/announcements
    async sendBulkEmail(recipients, subject, templateId, templateData) {
        try {
            const messages = recipients.map(recipient => ({
                to: recipient.email,
                from: {
                    email: this.fromEmail,
                    name: 'NannyRadar'
                },
                subject: subject,
                templateId: templateId,
                dynamicTemplateData: {
                    ...templateData,
                    user_name: recipient.name,
                    user_email: recipient.email
                }
            }));

            // Send in batches of 1000 (SendGrid limit)
            const batchSize = 1000;
            const results = [];

            for (let i = 0; i < messages.length; i += batchSize) {
                const batch = messages.slice(i, i + batchSize);
                const batchResult = await sgMail.send(batch);
                results.push(...batchResult);
            }

            console.log(`Bulk email sent to ${recipients.length} recipients`);
            return { 
                success: true, 
                sent: recipients.length,
                messageIds: results.map(r => r[0].headers['x-message-id'])
            };
        } catch (error) {
            console.error('Bulk email failed:', error);
            throw new Error(`Bulk email failed: ${error.message}`);
        }
    }
}

module.exports = new EmailService();
