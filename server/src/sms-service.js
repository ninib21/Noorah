// Real SMS Service with Twilio Integration
const twilio = require('twilio');
require('dotenv').config();

// Initialize Twilio client
const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

class SMSService {
    constructor() {
        this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
        this.supportNumber = '+1 (555) 911-HELP';
    }

    // Send SMS verification code
    async sendVerificationCode(phoneNumber, code) {
        try {
            const message = await client.messages.create({
                body: `Your NannyRadar verification code is: ${code}. This code expires in 10 minutes. Do not share this code with anyone.`,
                from: this.fromNumber,
                to: phoneNumber
            });

            console.log('Verification SMS sent successfully:', message.sid);
            return { 
                success: true, 
                messageSid: message.sid,
                status: message.status 
            };
        } catch (error) {
            console.error('Verification SMS failed:', error);
            throw new Error(`SMS verification failed: ${error.message}`);
        }
    }

    // Send booking confirmation SMS
    async sendBookingConfirmation(phoneNumber, booking, recipientType) {
        try {
            const isParent = recipientType === 'parent';
            const otherParty = isParent ? booking.sitterName : booking.parentName;
            const action = isParent ? 'confirmed' : 'requested';

            const message = await client.messages.create({
                body: `NannyRadar: Booking ${action} with ${otherParty} on ${booking.startTime}. Location: ${booking.location}. Track in app: ${process.env.FRONTEND_URL}/bookings/${booking.id}`,
                from: this.fromNumber,
                to: phoneNumber
            });

            console.log('Booking confirmation SMS sent successfully:', message.sid);
            return { 
                success: true, 
                messageSid: message.sid,
                status: message.status 
            };
        } catch (error) {
            console.error('Booking confirmation SMS failed:', error);
            throw new Error(`Booking confirmation SMS failed: ${error.message}`);
        }
    }

    // Send session started notification
    async sendSessionStarted(phoneNumber, session, sitterName) {
        try {
            const message = await client.messages.create({
                body: `🍼 NannyRadar: Session started with ${sitterName}. Real-time tracking is now active. View location: ${process.env.FRONTEND_URL}/sessions/${session.id}/track`,
                from: this.fromNumber,
                to: phoneNumber
            });

            console.log('Session started SMS sent successfully:', message.sid);
            return { 
                success: true, 
                messageSid: message.sid,
                status: message.status 
            };
        } catch (error) {
            console.error('Session started SMS failed:', error);
            throw new Error(`Session started SMS failed: ${error.message}`);
        }
    }

    // Send emergency alert SMS
    async sendEmergencyAlert(phoneNumbers, alert) {
        try {
            const emergencyMessage = `🚨 EMERGENCY ALERT - NannyRadar
Type: ${alert.type}
Location: ${alert.location}
Time: ${alert.timestamp}
Sitter: ${alert.sitterName}
Parent: ${alert.parentName}
Message: ${alert.message}

Call 911 if immediate assistance needed.
Support: ${this.supportNumber}`;

            const messages = await Promise.all(
                phoneNumbers.map(phoneNumber =>
                    client.messages.create({
                        body: emergencyMessage,
                        from: this.fromNumber,
                        to: phoneNumber
                    })
                )
            );

            console.log('Emergency alert SMS sent to all contacts');
            return { 
                success: true, 
                messageSids: messages.map(m => m.sid),
                sent: messages.length
            };
        } catch (error) {
            console.error('Emergency alert SMS failed:', error);
            throw new Error(`Emergency alert SMS failed: ${error.message}`);
        }
    }

    // Send check-in reminder
    async sendCheckInReminder(phoneNumber, sitterName, sessionId) {
        try {
            const message = await client.messages.create({
                body: `📍 NannyRadar: Please check in with ${sitterName}. It's been a while since the last update. View session: ${process.env.FRONTEND_URL}/sessions/${sessionId}`,
                from: this.fromNumber,
                to: phoneNumber
            });

            console.log('Check-in reminder SMS sent successfully:', message.sid);
            return { 
                success: true, 
                messageSid: message.sid,
                status: message.status 
            };
        } catch (error) {
            console.error('Check-in reminder SMS failed:', error);
            throw new Error(`Check-in reminder SMS failed: ${error.message}`);
        }
    }

    // Send session ended notification
    async sendSessionEnded(phoneNumber, session, totalAmount) {
        try {
            const message = await client.messages.create({
                body: `✅ NannyRadar: Session completed successfully. Total: $${totalAmount}. Please rate your experience and consider leaving a tip: ${process.env.FRONTEND_URL}/sessions/${session.id}/complete`,
                from: this.fromNumber,
                to: phoneNumber
            });

            console.log('Session ended SMS sent successfully:', message.sid);
            return { 
                success: true, 
                messageSid: message.sid,
                status: message.status 
            };
        } catch (error) {
            console.error('Session ended SMS failed:', error);
            throw new Error(`Session ended SMS failed: ${error.message}`);
        }
    }

    // Send payment confirmation SMS
    async sendPaymentConfirmation(phoneNumber, payment, recipientType) {
        try {
            const isParent = recipientType === 'parent';
            const action = isParent ? 'charged' : 'received';
            const message = await client.messages.create({
                body: `💳 NannyRadar: Payment ${action} - $${payment.amount} ${payment.currency.toUpperCase()}. Transaction ID: ${payment.id}. Receipt: ${process.env.FRONTEND_URL}/receipts/${payment.id}`,
                from: this.fromNumber,
                to: phoneNumber
            });

            console.log('Payment confirmation SMS sent successfully:', message.sid);
            return { 
                success: true, 
                messageSid: message.sid,
                status: message.status 
            };
        } catch (error) {
            console.error('Payment confirmation SMS failed:', error);
            throw new Error(`Payment confirmation SMS failed: ${error.message}`);
        }
    }

    // Send tip notification SMS
    async sendTipNotification(phoneNumber, tipAmount, fromName) {
        try {
            const message = await client.messages.create({
                body: `🎉 NannyRadar: You received a $${tipAmount} tip from ${fromName}! Thank you for your excellent service. Keep up the great work!`,
                from: this.fromNumber,
                to: phoneNumber
            });

            console.log('Tip notification SMS sent successfully:', message.sid);
            return { 
                success: true, 
                messageSid: message.sid,
                status: message.status 
            };
        } catch (error) {
            console.error('Tip notification SMS failed:', error);
            throw new Error(`Tip notification SMS failed: ${error.message}`);
        }
    }

    // Send booking reminder SMS
    async sendBookingReminder(phoneNumber, booking, hoursUntil) {
        try {
            const message = await client.messages.create({
                body: `⏰ NannyRadar: Reminder - Your booking with ${booking.otherPartyName} starts in ${hoursUntil} hours (${booking.startTime}). Location: ${booking.location}`,
                from: this.fromNumber,
                to: phoneNumber
            });

            console.log('Booking reminder SMS sent successfully:', message.sid);
            return { 
                success: true, 
                messageSid: message.sid,
                status: message.status 
            };
        } catch (error) {
            console.error('Booking reminder SMS failed:', error);
            throw new Error(`Booking reminder SMS failed: ${error.message}`);
        }
    }

    // Send custom notification SMS
    async sendCustomNotification(phoneNumber, message, urgent = false) {
        try {
            const prefix = urgent ? '🚨 URGENT - ' : '📱 ';
            const fullMessage = `${prefix}NannyRadar: ${message}`;

            const sms = await client.messages.create({
                body: fullMessage,
                from: this.fromNumber,
                to: phoneNumber
            });

            console.log('Custom notification SMS sent successfully:', sms.sid);
            return { 
                success: true, 
                messageSid: sms.sid,
                status: sms.status 
            };
        } catch (error) {
            console.error('Custom notification SMS failed:', error);
            throw new Error(`Custom notification SMS failed: ${error.message}`);
        }
    }

    // Verify phone number format
    validatePhoneNumber(phoneNumber) {
        // Remove all non-digit characters
        const cleaned = phoneNumber.replace(/\D/g, '');
        
        // Check if it's a valid US/international number
        if (cleaned.length === 10) {
            return `+1${cleaned}`; // US number
        } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
            return `+${cleaned}`; // US number with country code
        } else if (cleaned.length > 11) {
            return `+${cleaned}`; // International number
        } else {
            throw new Error('Invalid phone number format');
        }
    }

    // Get message status
    async getMessageStatus(messageSid) {
        try {
            const message = await client.messages(messageSid).fetch();
            return {
                sid: message.sid,
                status: message.status,
                errorCode: message.errorCode,
                errorMessage: message.errorMessage,
                dateCreated: message.dateCreated,
                dateSent: message.dateSent,
                dateUpdated: message.dateUpdated
            };
        } catch (error) {
            console.error('Failed to get message status:', error);
            throw new Error(`Failed to get message status: ${error.message}`);
        }
    }

    // Health check for Twilio service
    async healthCheck() {
        try {
            // Verify account by fetching account details
            const account = await client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
            
            return {
                status: 'healthy',
                service: 'Twilio',
                account_sid: account.sid,
                account_status: account.status,
                from_number: this.fromNumber
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                error: error.message
            };
        }
    }

    // Bulk SMS sending (with rate limiting)
    async sendBulkSMS(recipients, message, delayMs = 1000) {
        try {
            const results = [];
            
            for (let i = 0; i < recipients.length; i++) {
                try {
                    const sms = await client.messages.create({
                        body: `📱 NannyRadar: ${message}`,
                        from: this.fromNumber,
                        to: recipients[i].phoneNumber
                    });
                    
                    results.push({
                        recipient: recipients[i],
                        success: true,
                        messageSid: sms.sid
                    });
                    
                    // Rate limiting delay
                    if (i < recipients.length - 1) {
                        await new Promise(resolve => setTimeout(resolve, delayMs));
                    }
                } catch (error) {
                    results.push({
                        recipient: recipients[i],
                        success: false,
                        error: error.message
                    });
                }
            }

            const successful = results.filter(r => r.success).length;
            console.log(`Bulk SMS completed: ${successful}/${recipients.length} sent successfully`);
            
            return {
                success: true,
                total: recipients.length,
                successful: successful,
                failed: recipients.length - successful,
                results: results
            };
        } catch (error) {
            console.error('Bulk SMS failed:', error);
            throw new Error(`Bulk SMS failed: ${error.message}`);
        }
    }
}

module.exports = new SMSService();
