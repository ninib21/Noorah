// Real Stripe Integration Service
const Stripe = require('stripe');
require('dotenv').config();

// Initialize Stripe with secret key
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

class StripeService {
    constructor() {
        this.stripe = stripe;
    }

    // Create payment intent for booking
    async createPaymentIntent(amount, currency = 'usd', metadata = {}) {
        try {
            const paymentIntent = await this.stripe.paymentIntents.create({
                amount: Math.round(amount * 100), // Convert to cents
                currency,
                metadata,
                automatic_payment_methods: {
                    enabled: true,
                },
                // Enable specific payment methods
                payment_method_types: ['card', 'us_bank_account'],
            });

            return {
                clientSecret: paymentIntent.client_secret,
                intentId: paymentIntent.id,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency,
                status: paymentIntent.status
            };
        } catch (error) {
            console.error('Stripe payment intent creation failed:', error);
            throw new Error(`Payment setup failed: ${error.message}`);
        }
    }

    // Confirm payment intent
    async confirmPaymentIntent(paymentIntentId, paymentMethodId = null) {
        try {
            const params = { payment_intent: paymentIntentId };
            if (paymentMethodId) {
                params.payment_method = paymentMethodId;
            }

            const paymentIntent = await this.stripe.paymentIntents.confirm(paymentIntentId, params);
            
            return {
                id: paymentIntent.id,
                status: paymentIntent.status,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency,
                payment_method: paymentIntent.payment_method
            };
        } catch (error) {
            console.error('Stripe payment confirmation failed:', error);
            throw new Error(`Payment confirmation failed: ${error.message}`);
        }
    }

    // Create customer for recurring payments
    async createCustomer(email, name, metadata = {}) {
        try {
            const customer = await this.stripe.customers.create({
                email,
                name,
                metadata
            });

            return {
                id: customer.id,
                email: customer.email,
                name: customer.name
            };
        } catch (error) {
            console.error('Stripe customer creation failed:', error);
            throw new Error(`Customer creation failed: ${error.message}`);
        }
    }

    // Process tip payment
    async processTip(amount, paymentMethodId, customerId, metadata = {}) {
        try {
            const paymentIntent = await this.stripe.paymentIntents.create({
                amount: Math.round(amount * 100),
                currency: 'usd',
                customer: customerId,
                payment_method: paymentMethodId,
                confirmation_method: 'manual',
                confirm: true,
                metadata: {
                    type: 'tip',
                    ...metadata
                }
            });

            return {
                id: paymentIntent.id,
                status: paymentIntent.status,
                amount: paymentIntent.amount / 100,
                currency: paymentIntent.currency
            };
        } catch (error) {
            console.error('Stripe tip processing failed:', error);
            throw new Error(`Tip processing failed: ${error.message}`);
        }
    }

    // Create refund
    async createRefund(paymentIntentId, amount = null, reason = 'requested_by_customer') {
        try {
            const refundData = {
                payment_intent: paymentIntentId,
                reason
            };

            if (amount) {
                refundData.amount = Math.round(amount * 100);
            }

            const refund = await this.stripe.refunds.create(refundData);

            return {
                id: refund.id,
                amount: refund.amount / 100,
                currency: refund.currency,
                status: refund.status,
                reason: refund.reason
            };
        } catch (error) {
            console.error('Stripe refund failed:', error);
            throw new Error(`Refund failed: ${error.message}`);
        }
    }

    // Handle webhook events
    async handleWebhook(payload, signature) {
        try {
            const event = this.stripe.webhooks.constructEvent(
                payload,
                signature,
                process.env.STRIPE_WEBHOOK_SECRET
            );

            console.log('Stripe webhook received:', event.type);

            switch (event.type) {
                case 'payment_intent.succeeded':
                    await this.handlePaymentSuccess(event.data.object);
                    break;
                case 'payment_intent.payment_failed':
                    await this.handlePaymentFailure(event.data.object);
                    break;
                case 'customer.created':
                    await this.handleCustomerCreated(event.data.object);
                    break;
                default:
                    console.log(`Unhandled event type: ${event.type}`);
            }

            return { received: true };
        } catch (error) {
            console.error('Stripe webhook error:', error);
            throw new Error(`Webhook handling failed: ${error.message}`);
        }
    }

    // Handle successful payment
    async handlePaymentSuccess(paymentIntent) {
        console.log('Payment succeeded:', paymentIntent.id);
        // Update database with successful payment
        // Send confirmation emails
        // Update booking status
    }

    // Handle failed payment
    async handlePaymentFailure(paymentIntent) {
        console.log('Payment failed:', paymentIntent.id);
        // Update database with failed payment
        // Send failure notification
        // Handle booking cancellation if needed
    }

    // Handle customer creation
    async handleCustomerCreated(customer) {
        console.log('Customer created:', customer.id);
        // Update user record with Stripe customer ID
    }

    // Get payment methods for customer
    async getPaymentMethods(customerId) {
        try {
            const paymentMethods = await this.stripe.paymentMethods.list({
                customer: customerId,
                type: 'card',
            });

            return paymentMethods.data.map(pm => ({
                id: pm.id,
                type: pm.type,
                card: pm.card ? {
                    brand: pm.card.brand,
                    last4: pm.card.last4,
                    exp_month: pm.card.exp_month,
                    exp_year: pm.card.exp_year
                } : null
            }));
        } catch (error) {
            console.error('Failed to get payment methods:', error);
            throw new Error(`Failed to get payment methods: ${error.message}`);
        }
    }

    // Create setup intent for saving payment methods
    async createSetupIntent(customerId) {
        try {
            const setupIntent = await this.stripe.setupIntents.create({
                customer: customerId,
                payment_method_types: ['card'],
            });

            return {
                clientSecret: setupIntent.client_secret,
                id: setupIntent.id
            };
        } catch (error) {
            console.error('Setup intent creation failed:', error);
            throw new Error(`Setup intent creation failed: ${error.message}`);
        }
    }

    // Calculate application fee (platform commission)
    calculateApplicationFee(amount, feePercentage = 0.05) {
        return Math.round(amount * feePercentage * 100); // 5% platform fee in cents
    }

    // Health check for Stripe connection
    async healthCheck() {
        try {
            const account = await this.stripe.accounts.retrieve();
            return {
                status: 'healthy',
                account_id: account.id,
                charges_enabled: account.charges_enabled,
                payouts_enabled: account.payouts_enabled
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                error: error.message
            };
        }
    }
}

module.exports = new StripeService();
