# 🏠 NannyRadar - Smart Babysitting App

A comprehensive, AI-powered babysitting platform that connects parents with trusted sitters, featuring advanced security, real-time monitoring, and intelligent matching.

## 🌟 Features

### 🔐 Security & Safety
- **Real-time GPS tracking** with geofencing
- **Emergency SOS** with instant alerts
- **Biometric authentication** (Face ID, Touch ID)
- **End-to-end encryption** for all communications
- **Session monitoring** with AI-powered safety checks

### 🤖 AI-Powered Features
- **Smart sitter matching** based on preferences and compatibility
- **AI booking recommendations** for optimal scheduling
- **Voice assistant** for hands-free operation
- **Session summaries** with AI-generated insights
- **Predictive analytics** for demand forecasting

### 💳 Payment & Financial
- **Stripe integration** for secure payments
- **Automated payouts** for sitters
- **Tip suggestions** and automatic rebooking
- **Financial tracking** and reporting
- **Multi-currency support**

### 📱 User Experience
- **Intuitive mobile app** (iOS & Android)
- **Real-time messaging** with media sharing
- **Calendar integration** and scheduling
- **Review and rating system**
- **Multi-language support**

## 🏗️ Architecture

```
nannyradar/
├── 📱 babysitting-app/          # React Native Frontend
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── screens/             # App screens
│   │   ├── services/            # API services
│   │   ├── store/               # Redux store
│   │   ├── navigation/          # Navigation setup
│   │   └── utils/               # Utility functions
│   ├── assets/                  # Images, fonts, etc.
│   └── e2e/                     # End-to-end tests
├── 🔧 backend/                  # NestJS Backend
│   ├── src/
│   │   ├── auth/                # Authentication
│   │   ├── payments/            # Payment processing
│   │   ├── bookings/            # Booking management
│   │   ├── ai/                  # AI services
│   │   └── entities/            # Database models
│   └── test/                    # Backend tests
├── 🧪 Testing Suite
│   ├── Unit Tests               # Jest + React Native Testing Library
│   ├── E2E Tests                # Detox
│   ├── Load Tests               # k6
│   └── Security Tests           # OWASP ZAP + Snyk
└── 📚 Documentation
    ├── API Documentation        # Swagger/OpenAPI
    ├── Security Guidelines      # Security best practices
    └── Deployment Guide         # CI/CD setup
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL 15+
- Expo CLI
- Android Studio / Xcode (for mobile development)

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure your environment variables
npm run start:dev
```

### Frontend Setup
```bash
cd babysitting-app
npm install
npx expo start
```

### Database Setup
```bash
# Create database
createdb nannyradar_dev
createdb nannyradar_test

# Run migrations
cd backend
npm run migration:run
```

## 🧪 Testing

### Run All Tests
```bash
# Backend tests
cd backend
npm run test:all

# Frontend tests
cd babysitting-app
npm run test:all

# Load testing
cd backend
npm run test:load

# Security testing
npm run test:security
```

### Test Coverage
- **Backend**: 80%+ coverage target
- **Frontend**: 80%+ coverage target
- **E2E**: Critical user flows
- **Security**: OWASP compliance

## 🔒 Security Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- Multi-factor authentication (MFA)
- Session management

### Data Protection
- End-to-end encryption
- Secure API communication (HTTPS)
- Input validation and sanitization
- SQL injection prevention

### Privacy Compliance
- GDPR compliance
- COPPA compliance (child protection)
- Data retention policies
- Privacy by design

## 🛠️ Technology Stack

### Frontend
- **React Native** with Expo
- **TypeScript** for type safety
- **Redux Toolkit** for state management
- **React Navigation** for routing
- **NativeWind** for styling

### Backend
- **NestJS** framework
- **TypeScript** for type safety
- **PostgreSQL** database
- **TypeORM** for database management
- **JWT** for authentication

### AI & ML
- **OpenAI GPT** for natural language processing
- **TensorFlow.js** for client-side ML
- **Custom recommendation algorithms**

### Infrastructure
- **Docker** for containerization
- **GitHub Actions** for CI/CD
- **AWS/Google Cloud** for hosting
- **Stripe** for payments

## 📊 API Documentation

### Authentication Endpoints
```
POST /auth/login          # User login
POST /auth/register       # User registration
POST /auth/refresh        # Refresh token
POST /auth/logout         # User logout
```

### Booking Endpoints
```
GET    /bookings          # Get user bookings
POST   /bookings          # Create new booking
PUT    /bookings/:id      # Update booking
DELETE /bookings/:id      # Cancel booking
```

### Payment Endpoints
```
POST /payments/create-intent    # Create payment intent
POST /payments/process          # Process payment
GET  /payments                  # Get payment history
POST /payments/refund           # Refund payment
```

### AI Endpoints
```
POST /ai/match-sitter          # AI sitter matching
POST /ai/booking-recommend     # Booking recommendations
POST /ai/session-summary       # Generate session summary
```

## 🚀 Deployment

### Production Deployment
```bash
# Build backend
cd backend
npm run build
npm run start:prod

# Build frontend
cd babysitting-app
npx expo build:android
npx expo build:ios
```

### Environment Variables
```bash
# Backend (.env)
DATABASE_URL=postgresql://user:pass@localhost:5432/nannyradar
JWT_SECRET=your-jwt-secret
STRIPE_SECRET_KEY=sk_live_...
OPENAI_API_KEY=sk-...

# Frontend (app.config.js)
EXPO_PUBLIC_API_URL=https://api.nannyradar.com
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- **TypeScript** for type safety
- **ESLint** + **Prettier** for code formatting
- **Conventional Commits** for commit messages
- **80%+ test coverage** requirement
- **Security review** for all changes

### Testing Requirements
- Unit tests for all new features
- Integration tests for API endpoints
- E2E tests for critical user flows
- Security tests for vulnerability scanning

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- [API Documentation](docs/api.md)
- [Security Guidelines](docs/security.md)
- [Deployment Guide](docs/deployment.md)
- [Testing Guide](TESTING_SUITE_README.md)

### Contact
- **Email**: support@nannyradar.com
- **Website**: [nannyradar.com](https://nannyradar.com)
- **GitHub Issues**: [Report a bug](https://github.com/nannyradar/babysitting-app/issues)

## 🙏 Acknowledgments

- **OpenAI** for AI capabilities
- **Stripe** for payment processing
- **Expo** for React Native development
- **NestJS** for backend framework
- **OWASP** for security guidelines

---

**Made with ❤️ by BidayaX and Divitiae Good Doers Inc. - NPO: 2023-001341848**

*Building the future of safe, smart childcare* 