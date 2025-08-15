# 💳 Stripe Connect Payment System Integration

## Overview

This document outlines the complete Stripe Connect Payment System integration for the GuardianNest babysitting app. The system implements a secure Parent → App → Sitter payment flow using Stripe Connect for marketplace payments.

## 🏗️ Architecture

### Payment Flow
1. **Parent Books Sitter** → Creates booking with payment intent
2. **Parent Pays** → Payment processed via Stripe (funds held in escrow)
3. **Session Completes** → Parent confirms payment, funds transferred to sitter
4. **Sitter Receives Payout** → Via Stripe Connect to their bank account

### Key Components
- **Backend**: NestJS API with Stripe integration
- **Frontend**: React Native with payment UI components
- **Database**: PostgreSQL with payment tracking
- **Stripe Connect**: For sitter payouts and marketplace payments

## 🔧 Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install stripe @nestjs/config
```

### 2. Environment Variables

Create `.env` file in backend directory:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=babysitting_app

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Server
PORT=3001
NODE_ENV=development
```

### 3. Database Entities

The system uses the following entities:

#### Payment Entity
```typescript
@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  bookingId: string;

  @Column({ unique: true, nullable: true })
  stripePaymentIntentId: string;

  @Column({ nullable: true })
  stripeTransferId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ length: 3, default: 'USD' })
  currency: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.CARD,
  })
  paymentMethod: PaymentMethod;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

#### Sitter Profile Entity
```typescript
@Entity('sitter_profiles')
export class SitterProfile {
  // ... other fields

  @Column({ nullable: true })
  stripeAccountId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  hourlyRate: number;

  @Column({ default: true })
  isAvailable: boolean;
}
```

### 4. API Endpoints

#### Payment Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/payments/create-intent` | Create payment intent for booking |
| POST | `/payments/process` | Process payment (capture funds) |
| POST | `/payments/:id/confirm` | Confirm payment (transfer to sitter) |
| POST | `/payments/:id/refund` | Refund payment |
| GET | `/payments` | Get user payments |
| GET | `/payments/:id` | Get specific payment |

#### Stripe Connect Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/payments/sitter/connect` | Create Stripe Connect account |
| GET | `/payments/sitter/connect/status` | Get Connect account status |
| POST | `/payments/sitter/connect/onboarding` | Complete onboarding |
| POST | `/payments/sitter/payout` | Request payout |
| GET | `/payments/sitter/earnings` | Get earnings summary |
| GET | `/payments/sitter/payouts` | Get payout history |

#### Parent Payment Methods

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/payments/parent/add-payment-method` | Add payment method |
| GET | `/payments/parent/payment-methods` | Get payment methods |
| DELETE | `/payments/parent/payment-methods/:id` | Remove payment method |

### 5. Payment Service Methods

```typescript
// Create payment intent for booking
async createPaymentIntent(userId: string, bookingId: string, paymentMethodId?: string)

// Process payment (capture funds)
async processPayment(userId: string, paymentIntentId: string)

// Confirm payment (transfer to sitter)
async confirmPayment(paymentId: string, userId: string)

// Create Stripe Connect account for sitter
async createSitterConnectAccount(userId: string)

// Get sitter earnings
async getSitterEarnings(userId: string, period: string = 'month')

// Request sitter payout
async requestSitterPayout(userId: string, amount: number)
```

## 📱 Frontend Setup

### 1. Install Dependencies

```bash
cd babysitting-app
npm install @stripe/stripe-react-native
```

### 2. Payment Service

The frontend includes a comprehensive payment service (`src/services/payment.service.ts`) that handles all payment-related API calls.

### 3. Key Components

#### SitterEarningsScreen
- **Location**: `src/screens/sitter/SitterEarningsScreen.tsx`
- **Features**:
  - Earnings overview with period selection
  - Stripe Connect setup and status
  - Payout requests and history
  - Real-time earnings data

#### PaymentScreen
- **Location**: `src/screens/parent/PaymentScreen.tsx`
- **Features**:
  - Payment form with card validation
  - Booking summary and breakdown
  - Secure payment processing
  - Payment confirmation

### 4. Payment Flow Implementation

```typescript
// 1. Create payment intent
const paymentIntent = await paymentService.createPaymentIntent(bookingId);

// 2. Process payment
await paymentService.processPayment(paymentIntent.paymentIntentId);

// 3. Confirm payment (after session)
await paymentService.confirmPayment(paymentId);

// 4. Sitter requests payout
await paymentService.requestSitterPayout(amount);
```

## 🔐 Security Features

### 1. Payment Security
- **PCI Compliance**: Stripe handles all card data
- **Encryption**: All sensitive data encrypted in transit and at rest
- **Webhook Verification**: Stripe webhook signatures verified
- **Idempotency**: Payment operations are idempotent

### 2. Access Control
- **JWT Authentication**: All payment endpoints require authentication
- **User Authorization**: Users can only access their own payments
- **Role-based Access**: Different permissions for parents and sitters

### 3. Data Protection
- **Secure Storage**: Payment tokens stored securely
- **Audit Logging**: All payment operations logged
- **Error Handling**: Secure error messages without data leakage

## 🧪 Testing

### 1. Stripe Test Mode

Use Stripe test keys for development:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 2. Test Cards

Use these test card numbers:

| Card Type | Number | CVC | Expiry |
|-----------|--------|-----|--------|
| Visa | 4242424242424242 | 123 | 12/34 |
| Mastercard | 5555555555554444 | 123 | 12/34 |
| Declined | 4000000000000002 | 123 | 12/34 |

### 3. Testing Scenarios

#### Payment Flow Test
```bash
# 1. Create booking
POST /bookings
{
  "sitterId": "sitter_id",
  "startTime": "2024-01-20T10:00:00Z",
  "endTime": "2024-01-20T14:00:00Z",
  "amount": 100.00
}

# 2. Create payment intent
POST /payments/create-intent
{
  "bookingId": "booking_id"
}

# 3. Process payment
POST /payments/process
{
  "paymentIntentId": "pi_..."
}

# 4. Confirm payment
POST /payments/payment_id/confirm
```

#### Sitter Connect Test
```bash
# 1. Create Connect account
POST /payments/sitter/connect

# 2. Check status
GET /payments/sitter/connect/status

# 3. Request payout
POST /payments/sitter/payout
{
  "amount": 50.00
}
```

### 4. Webhook Testing

Use Stripe CLI for webhook testing:

```bash
# Install Stripe CLI
stripe listen --forward-to localhost:3001/payments/stripe/webhook

# Test webhook events
stripe trigger payment_intent.succeeded
stripe trigger transfer.created
```

## 🚀 Deployment

### 1. Production Environment

Update environment variables for production:

```env
NODE_ENV=production
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 2. Webhook Configuration

Configure Stripe webhooks in production:

```
URL: https://your-api.com/payments/stripe/webhook
Events: payment_intent.succeeded, transfer.created, payout.paid
```

### 3. Database Migration

Run database migrations:

```bash
npm run migration:run
```

### 4. SSL/TLS

Ensure HTTPS is enabled for all payment endpoints.

## 📊 Monitoring

### 1. Stripe Dashboard

Monitor payments in Stripe Dashboard:
- **Payments**: Track payment success/failure rates
- **Transfers**: Monitor sitter payouts
- **Connect**: Track sitter onboarding completion

### 2. Application Logs

Monitor application logs for:
- Payment processing errors
- Webhook failures
- API response times

### 3. Metrics

Track key metrics:
- Payment success rate
- Average payment processing time
- Sitter payout completion rate
- Platform fee revenue

## 🔧 Troubleshooting

### Common Issues

#### 1. Payment Intent Creation Fails
- Check Stripe API key configuration
- Verify booking exists and sitter has Stripe Connect account
- Check amount format (must be in cents)

#### 2. Webhook Failures
- Verify webhook secret in environment
- Check webhook endpoint URL
- Ensure proper error handling in webhook handler

#### 3. Sitter Payout Issues
- Verify sitter has completed Stripe Connect onboarding
- Check sitter account verification status
- Ensure sufficient balance for payout

#### 4. Frontend Payment Errors
- Check Stripe publishable key
- Verify payment form validation
- Check network connectivity

### Debug Mode

Enable debug logging:

```typescript
// In payment service
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
  appInfo: {
    name: 'NannyRadar',
    version: '1.0.0',
  },
});
```

## 📚 Additional Resources

### Documentation
- [Stripe Connect Documentation](https://stripe.com/docs/connect)
- [Stripe React Native SDK](https://stripe.com/docs/stripe-react-native)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)

### Support
- [Stripe Support](https://support.stripe.com/)
- [Stripe Community](https://community.stripe.com/)

## 🔄 Version History

- **v1.0.0** - Initial Stripe Connect integration
- **v1.1.0** - Added payment processing and confirmation
- **v1.2.0** - Enhanced sitter payout system
- **v1.3.0** - Added parent payment methods management

---

## 🎯 Next Steps

1. **Real-time Notifications**: Implement push notifications for payment events
2. **Advanced Analytics**: Add detailed payment analytics dashboard
3. **Multi-currency Support**: Extend to support multiple currencies
4. **Automated Payouts**: Implement scheduled automatic payouts
5. **Dispute Resolution**: Add payment dispute handling system

This integration provides a complete, secure, and scalable payment solution for the GuardianNest babysitting platform, ensuring smooth financial transactions between parents and sitters while maintaining the highest security standards. 