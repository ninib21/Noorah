# GuardianNest Backend API

A robust NestJS backend API for the GuardianNest babysitting application, featuring military-grade security, real-time tracking, and comprehensive payment processing.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with OTP support
- **User Management**: Parent and sitter profiles with verification
- **Booking System**: Complete booking lifecycle management
- **Payment Processing**: Stripe integration with Connect for sitters
- **Real-time Tracking**: GPS tracking and session monitoring
- **Review System**: Comprehensive rating and review system
- **Security**: Military-grade encryption and data protection
- **API Documentation**: Swagger/OpenAPI documentation

## 🏗️ Architecture

```
src/
├── entities/           # Database entities (TypeORM)
├── auth/              # Authentication module
├── users/             # User management
├── bookings/          # Booking system
├── payments/          # Payment processing
├── sitters/           # Sitter management
├── reviews/           # Review system
├── guards/            # JWT guards
├── dto/               # Data transfer objects
└── main.ts           # Application entry point
```

## 🛠️ Tech Stack

- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT + Passport
- **Payments**: Stripe Connect
- **Documentation**: Swagger/OpenAPI
- **Validation**: class-validator
- **Security**: bcryptjs, helmet

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- Redis (optional, for caching)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Database setup**
   ```bash
   # Create PostgreSQL database
   createdb babysitting_app
   
   # Run migrations (if using migrations)
   npm run migration:run
   ```

5. **Start the application**
   ```bash
   # Development
   npm run start:dev
   
   # Production
   npm run build
   npm run start:prod
   ```

## 🔐 Environment Variables

Copy `env.example` to `.env` and configure:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=babysitting_app

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Server
PORT=3001
NODE_ENV=development
```

## 📚 API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:3001/api
- **API Base URL**: http://localhost:3001

## 🔌 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login with email/password
- `POST /auth/login/otp` - Send OTP for login
- `POST /auth/verify-otp` - Verify OTP and login
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password
- `GET /auth/profile` - Get current user profile

### Bookings
- `POST /bookings` - Create new booking
- `GET /bookings` - Get user bookings
- `GET /bookings/:id` - Get specific booking
- `PUT /bookings/:id` - Update booking
- `DELETE /bookings/:id` - Cancel booking
- `POST /bookings/:id/confirm` - Confirm booking
- `POST /bookings/:id/start` - Start booking session
- `POST /bookings/:id/complete` - Complete booking

### Payments
- `POST /payments/create-intent` - Create payment intent
- `POST /payments/process` - Process payment
- `POST /payments/:id/refund` - Refund payment
- `GET /payments` - Get payment history
- `POST /payments/sitter/connect` - Create Stripe Connect account
- `GET /payments/sitter/earnings` - Get sitter earnings

### Sitters
- `GET /sitters/search` - Search for sitters
- `GET /sitters/:id` - Get sitter profile
- `GET /sitters/:id/reviews` - Get sitter reviews
- `POST /sitters/profile` - Create sitter profile
- `PUT /sitters/profile` - Update sitter profile
- `PUT /sitters/availability` - Update availability

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with configurable rounds
- **Input Validation**: Comprehensive request validation
- **Rate Limiting**: API rate limiting protection
- **CORS**: Configured for frontend integration
- **Helmet**: Security headers middleware

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📦 Database Schema

The application uses the following main entities:

- **Users**: Core user information
- **SitterProfiles**: Sitter-specific data
- **ParentProfiles**: Parent-specific data
- **Bookings**: Booking information
- **Payments**: Payment records
- **Reviews**: User reviews and ratings
- **Sessions**: Real-time session tracking

## 🚀 Deployment

### Docker (Recommended)

```bash
# Build image
docker build -t guardiannest-backend .

# Run container
docker run -p 3001:3001 guardiannest-backend
```

### Manual Deployment

```bash
# Build for production
npm run build

# Start production server
npm run start:prod
```

## 🔧 Development

### Available Scripts

- `npm run start:dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start:prod` - Start production server
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Code Structure

- **Controllers**: Handle HTTP requests
- **Services**: Business logic implementation
- **Entities**: Database models
- **DTOs**: Data transfer objects
- **Guards**: Authentication guards
- **Interceptors**: Request/response interceptors

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the API documentation at `/api`

## 🔄 Version History

- **v1.0.0** - Initial release with core features
- **v1.1.0** - Added real-time tracking
- **v1.2.0** - Enhanced security features
- **v1.3.0** - Stripe Connect integration 