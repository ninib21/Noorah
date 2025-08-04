# 🏠 NannyRadar - Smart Babysitting Platform

A comprehensive, AI-powered babysitting platform that connects parents with trusted sitters, featuring advanced security, real-time monitoring, and intelligent matching.

## 🚀 Features

### 🔐 Military-Grade Security
- **End-to-End Encryption**: AES-256-GCM encryption for all sensitive data
- **Biometric Authentication**: Fingerprint and Face ID support
- **Multi-Factor Authentication**: TOTP-based 2FA with backup codes
- **Real-Time GPS Tracking**: High-accuracy location monitoring with geofencing
- **Emergency SOS System**: One-tap emergency alerts with automatic escalation

### 🤖 AI-Powered Matching
- **Smart Sitter Matching**: Location and rating-based recommendations
- **Booking Recommendations**: AI-driven booking suggestions
- **Voice Assistant**: Hands-free app interaction
- **Translation Services**: Multi-language support

### 💳 Secure Payments
- **Stripe Connect Integration**: Secure marketplace payments
- **Automatic Payouts**: Direct deposits to sitter accounts
- **Payment Protection**: Escrow and dispute resolution
- **Tipping System**: In-app tipping with rebooking incentives

### 📱 Modern Mobile App
- **React Native**: Cross-platform iOS and Android support
- **Expo Framework**: Rapid development and deployment
- **Real-Time Updates**: Live notifications and status updates
- **Offline Support**: Core functionality without internet

## 🏗️ Architecture

```
nannyradar/
├── 📱 babysitting-app/          # React Native Frontend
│   ├── src/
│   │   ├── screens/             # UI Screens
│   │   ├── components/          # Reusable Components
│   │   ├── services/            # API Services
│   │   ├── store/               # Redux State Management
│   │   └── navigation/          # App Navigation
│   └── assets/                  # Images, Icons, Fonts
├── 🔧 backend/                  # NestJS Backend API
│   ├── src/
│   │   ├── auth/                # Authentication & Authorization
│   │   ├── bookings/            # Booking Management
│   │   ├── payments/            # Payment Processing
│   │   ├── sitters/             # Sitter Management
│   │   ├── users/               # User Management
│   │   ├── security/            # Security Features
│   │   └── monitoring/          # Health & Metrics
│   └── test/                    # Backend Tests
├── 🐳 infrastructure/           # Docker & Deployment
├── 📚 docs/                     # Documentation
└── 🧪 test/                     # E2E Tests
```

## 🛠️ Quick Start

### Prerequisites
- Node.js 18+
- Expo CLI
- PostgreSQL 14+
- Redis (optional)

### Frontend Setup
```bash
cd babysitting-app
npm install
npx expo start
```

### Backend Setup
```bash
cd backend
npm install
npm run start:dev
```

### Database Setup
```bash
# Create database
createdb nannyradar

# Run migrations
cd backend
npm run migration:run

# Seed data (optional)
npm run seed
```

## 🔧 Configuration

### Environment Variables
Create `.env` files in both `babysitting-app/` and `backend/` directories:

**Frontend (.env)**
```env
EXPO_PUBLIC_API_URL=http://localhost:3001
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_key
```

**Backend (.env)**
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/nannyradar
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_key
```

## 🧪 Testing

### Frontend Tests
```bash
cd babysitting-app
npm run test
npm run test:e2e
```

### Backend Tests
```bash
cd backend
npm run test
npm run test:e2e
```

### Security Tests
```bash
npm run test:security
npm run test:owasp
npm run test:snyk
```

## 🚀 Deployment

### Frontend (Expo)
```bash
cd babysitting-app
npx expo build:ios
npx expo build:android
```

### Backend (Docker)
```bash
cd backend
docker build -t nannyradar-backend .
docker run -p 3001:3001 nannyradar-backend
```

## 📊 Monitoring

- **Health Checks**: `/api/v1/health`
- **API Documentation**: `/api/docs`
- **Metrics**: Prometheus endpoints
- **Logs**: Structured JSON logging

## 🔒 Security

- **Encryption**: AES-256-GCM for data at rest
- **Transport**: TLS 1.3 for all communications
- **Authentication**: JWT with refresh tokens
- **Authorization**: Role-based access control
- **Audit Logging**: Complete activity tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **Email**: support@nannyradar.com
- **Documentation**: [docs.nannyradar.com](https://docs.nannyradar.com)
- **GitHub Issues**: [Report a bug](https://github.com/nannyradar/babysitting-app/issues)

---

**🔒 Security Notice**: This application handles sensitive personal data and implements military-grade security measures. Always test security features in controlled environments before deployment.

**⚠️ Emergency Features**: The emergency SOS system is designed for real emergency situations. Misuse may result in legal consequences. 