# NannyRadar Backend API

A robust NestJS backend API for the NannyRadar babysitting application, featuring military-grade security, real-time tracking, and comprehensive payment processing.

## 🚀 Features

### 🔐 Security & Authentication
- **JWT Authentication**: Secure token-based authentication
- **Multi-Factor Authentication**: TOTP-based 2FA support
- **Role-Based Access Control**: Granular permissions system
- **Rate Limiting**: Protection against abuse
- **Input Validation**: Comprehensive request validation

### 💳 Payment Processing
- **Stripe Connect**: Marketplace payment processing
- **Automatic Payouts**: Direct deposits to sitter accounts
- **Payment Protection**: Escrow and dispute handling
- **Webhook Processing**: Real-time payment updates

### 📊 Data Management
- **PostgreSQL**: Reliable relational database
- **TypeORM**: Type-safe database operations
- **Migrations**: Version-controlled schema changes
- **Seeding**: Development data population

### 🔍 Monitoring & Observability
- **Health Checks**: Application health monitoring
- **Structured Logging**: JSON-formatted logs
- **Metrics Collection**: Prometheus metrics
- **Error Tracking**: Comprehensive error handling

## 🏗️ Architecture

```
src/
├── auth/                    # Authentication & Authorization
│   ├── guards/             # JWT and role guards
│   ├── strategies/         # Passport strategies
│   └── dto/               # Auth DTOs
├── bookings/               # Booking Management
│   ├── entities/          # Booking models
│   ├── dto/              # Booking DTOs
│   └── services/         # Booking logic
├── payments/              # Payment Processing
│   ├── stripe/           # Stripe integration
│   ├── webhooks/         # Webhook handlers
│   └── services/         # Payment logic
├── sitters/               # Sitter Management
│   ├── profiles/         # Sitter profiles
│   ├── verification/     # Document verification
│   └── services/         # Sitter logic
├── users/                 # User Management
│   ├── profiles/         # User profiles
│   ├── preferences/      # User preferences
│   └── services/         # User logic
├── security/              # Security Features
│   ├── encryption/       # Data encryption
│   ├── monitoring/       # Security monitoring
│   └── services/         # Security logic
├── communication/         # Communication Services
│   ├── email/           # Email service
│   ├── sms/             # SMS service
│   └── notifications/   # Push notifications
└── monitoring/            # Health & Metrics
    ├── health/          # Health checks
    ├── logging/         # Logging service
    └── metrics/         # Metrics collection
```

## 🛠️ Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis (optional)

### Installation
```bash
npm install
```

### Environment Setup
Create a `.env` file:
```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/nannyradar

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# SMS (Twilio)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Security
ENCRYPTION_KEY=your-32-byte-encryption-key
```

### Database Setup
```bash
# Create database
createdb nannyradar

# Run migrations
npm run migration:run

# Seed data (optional)
npm run seed
```

### Development
```bash
npm run start:dev
```

### Production
```bash
npm run build
npm run start:prod
```

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### Coverage
```bash
npm run test:cov
```

## 📊 API Documentation

### Swagger UI
Once the server is running, visit:
- **Development**: http://localhost:3001/api/docs
- **Production**: https://api.nannyradar.com/api/docs

### Authentication Endpoints
```
POST /auth/register          # User registration
POST /auth/login            # User login
POST /auth/refresh          # Refresh token
POST /auth/logout           # User logout
POST /auth/forgot-password  # Password reset request
POST /auth/reset-password   # Password reset
POST /auth/verify-email     # Email verification
```

### Booking Endpoints
```
GET    /bookings            # Get user bookings
POST   /bookings            # Create booking
GET    /bookings/:id        # Get booking details
PUT    /bookings/:id        # Update booking
DELETE /bookings/:id        # Cancel booking
POST   /bookings/:id/accept # Accept booking
POST   /bookings/:id/reject # Reject booking
```

### Payment Endpoints
```
POST /payments/create-intent    # Create payment intent
POST /payments/confirm          # Confirm payment
GET  /payments                  # Get payment history
POST /payments/refund           # Refund payment
POST /payments/webhook          # Stripe webhook
```

### Sitter Endpoints
```
GET    /sitters                 # Get sitters
GET    /sitters/:id             # Get sitter profile
POST   /sitters                 # Create sitter profile
PUT    /sitters/:id             # Update sitter profile
POST   /sitters/:id/verify      # Verify sitter documents
```

## 🔒 Security Features

### Data Protection
- **Encryption**: AES-256-GCM for sensitive data
- **Hashing**: bcrypt for password hashing
- **TLS**: HTTPS enforcement
- **CORS**: Cross-origin resource sharing

### Authentication
- **JWT**: Stateless authentication
- **Refresh Tokens**: Secure token refresh
- **MFA**: Multi-factor authentication
- **Session Management**: Secure session handling

### Authorization
- **RBAC**: Role-based access control
- **Guards**: Route protection
- **Decorators**: Permission checking
- **Interceptors**: Request validation

## 📈 Monitoring

### Health Checks
```
GET /api/v1/health           # Basic health check
GET /api/v1/health/detailed  # Detailed health status
```

### Metrics
```
GET /metrics                 # Prometheus metrics
```

### Logging
- **Structured Logs**: JSON format
- **Log Levels**: Error, Warn, Info, Debug
- **Request Logging**: All API requests
- **Error Tracking**: Comprehensive error logging

## 🚀 Deployment

### Docker
```bash
# Build image
docker build -t nannyradar-backend .

# Run container
docker run -p 3001:3001 nannyradar-backend
```

### Environment Variables
```env
# Production
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:pass@host:5432/nannyradar
JWT_SECRET=your-production-jwt-secret
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**🔒 Security Notice**: This API handles sensitive personal data. Always follow security best practices and test thoroughly before deployment. 