# 🚀 NannyRadar Local Development Setup

This guide will help you set up NannyRadar locally for testing both parent and sitter sides with admin credentials.

## 📋 Prerequisites

### Required Software
- **Node.js 18+** - [Download here](https://nodejs.org/)
- **PostgreSQL 14+** - [Download here](https://www.postgresql.org/download/)
- **Git** - [Download here](https://git-scm.com/)
- **Expo CLI** - Install with `npm install -g @expo/cli`

### Optional (for mobile testing)
- **iOS Simulator** (Mac only) - Install Xcode from App Store
- **Android Emulator** - Install Android Studio
- **Physical Device** - Install Expo Go app

## 🛠️ Quick Setup

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <your-repo-url>
cd babysitting-app

# Install frontend dependencies
cd babysitting-app
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 2. Database Setup

```bash
# Create PostgreSQL database
createdb nannyradar
createdb nannyradar_test

# Navigate to backend
cd backend

# Run database migrations
npm run migration:run

# Seed the database with test data
npm run seed
```

### 3. Environment Configuration

#### Backend Environment (backend/.env)
```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/nannyradar

# JWT
JWT_SECRET=your-super-secret-jwt-key-for-development
JWT_REFRESH_SECRET=your-super-secret-refresh-key-for-development

# Server
PORT=3001
NODE_ENV=development

# Stripe (use test keys)
STRIPE_SECRET_KEY=sk_test_your_stripe_test_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Email (optional for development)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# SMS (optional for development)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Security
ENCRYPTION_KEY=your-32-byte-encryption-key-for-dev
```

#### Frontend Environment (babysitting-app/.env)
```env
# API Configuration
EXPO_PUBLIC_API_URL=http://localhost:3001

# Google Maps (optional)
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Firebase (optional)
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Start the Backend

```bash
# Navigate to backend directory
cd backend

# Start development server
npm run start:dev
```

The backend will be available at: http://localhost:3001
API Documentation: http://localhost:3001/api/docs

### 5. Start the Frontend

```bash
# Navigate to frontend directory
cd babysitting-app

# Start Expo development server
npx expo start
```

## 🔑 Admin Testing Credentials

### Admin Account
```
Email: admin@nannyradar.com
Password: admin123
Role: ADMIN
```

### Parent Test Accounts
```
Email: sarah.johnson@example.com
Password: password123
Role: PARENT

Email: mike.chen@example.com
Password: password123
Role: PARENT
```

### Sitter Test Accounts
```
Email: emma.wilson@example.com
Password: password123
Role: SITTER
Hourly Rate: $25

Email: james.rodriguez@example.com
Password: password123
Role: SITTER
Hourly Rate: $30

Email: lisa.thompson@example.com
Password: password123
Role: SITTER
Hourly Rate: $28
```

## 📱 Testing Both Sides

### Testing Parent Side
1. **Login as Parent**: Use `sarah.johnson@example.com` / `password123`
2. **Browse Sitters**: View available sitters in your area
3. **Book a Sitter**: Create a new booking
4. **Messaging**: Send messages to sitters
5. **Payment**: Test payment flow (uses Stripe test mode)
6. **Reviews**: Leave reviews for completed bookings
7. **Emergency Features**: Test SOS functionality

### Testing Sitter Side
1. **Login as Sitter**: Use `emma.wilson@example.com` / `password123`
2. **Profile Management**: Update your profile and availability
3. **Booking Requests**: Respond to incoming booking requests
4. **Session Management**: Start/stop sessions and upload photos
5. **Earnings**: View your earnings and payment history
6. **Reviews**: View reviews from parents

### Testing Admin Features
1. **Login as Admin**: Use `admin@nannyradar.com` / `admin123`
2. **User Management**: View all users and their profiles
3. **Booking Overview**: Monitor all bookings and their status
4. **Payment Monitoring**: Track payment processing
5. **Safety Monitoring**: View emergency alerts and sessions
6. **Analytics**: Access platform analytics and metrics

## 🧪 Available Test Data

### Users Created
- **1 Admin User**: Full platform access
- **2 Parent Users**: With complete profiles and booking history
- **3 Sitter Users**: With verified profiles, reviews, and earnings

### Bookings Created
- **10 Sample Bookings**: Mix of pending, confirmed, and completed
- **Payment Records**: Associated with completed bookings
- **Reviews**: For completed bookings
- **Messages**: Conversations between parents and sitters

### Additional Data
- **Verification Documents**: ID cards, selfies, CPR certificates
- **Notifications**: Welcome messages and system updates
- **Sessions**: Completed session data with activities and photos

## 🔧 Development Commands

### Backend Commands
```bash
cd backend

# Development
npm run start:dev          # Start with hot reload
npm run start:debug        # Start with debugger

# Testing
npm run test              # Run unit tests
npm run test:e2e          # Run E2E tests
npm run test:cov          # Run tests with coverage

# Database
npm run migration:generate # Generate new migration
npm run migration:run     # Run migrations
npm run migration:revert  # Revert last migration
npm run seed              # Seed database

# Production
npm run build             # Build for production
npm run start:prod        # Start production server
```

### Frontend Commands
```bash
cd babysitting-app

# Development
npx expo start            # Start development server
npx expo start --ios      # Start iOS simulator
npx expo start --android  # Start Android emulator

# Testing
npm run test              # Run unit tests
npm run test:e2e          # Run E2E tests
npm run test:coverage     # Run tests with coverage

# Building
npx expo build:ios        # Build for iOS
npx expo build:android    # Build for Android
```

## 📊 API Endpoints for Testing

### Authentication
```
POST /auth/login          # Login with email/password
POST /auth/register       # Register new user
POST /auth/refresh        # Refresh JWT token
GET  /auth/profile        # Get current user profile
```

### Users
```
GET  /users               # Get all users (admin only)
GET  /users/:id           # Get specific user
PUT  /users/:id           # Update user
DELETE /users/:id         # Delete user (admin only)
```

### Bookings
```
GET  /bookings            # Get user's bookings
POST /bookings            # Create new booking
GET  /bookings/:id        # Get booking details
PUT  /bookings/:id        # Update booking
DELETE /bookings/:id      # Cancel booking
```

### Sitters
```
GET  /sitters             # Get all sitters
GET  /sitters/:id         # Get sitter profile
POST /sitters             # Create sitter profile
PUT  /sitters/:id         # Update sitter profile
```

### Payments
```
POST /payments/create-intent  # Create payment intent
POST /payments/confirm        # Confirm payment
GET  /payments                # Get payment history
```

## 🐛 Troubleshooting

### Common Issues

#### Backend Won't Start
```bash
# Check if PostgreSQL is running
sudo service postgresql status

# Check database connection
psql -h localhost -U postgres -d nannyradar

# Reset database
dropdb nannyradar
createdb nannyradar
npm run migration:run
npm run seed
```

#### Frontend Won't Start
```bash
# Clear Expo cache
npx expo start --clear

# Reset Metro bundler
npx expo start --reset-cache

# Check Node.js version
node --version  # Should be 18+
```

#### Database Connection Issues
```bash
# Check PostgreSQL status
sudo service postgresql status

# Restart PostgreSQL
sudo service postgresql restart

# Check connection string
echo $DATABASE_URL
```

### Debug Mode
```bash
# Backend debug
cd backend
npm run start:debug

# Frontend debug
cd babysitting-app
npx expo start --dev-client
```

## 📱 Mobile Testing

### iOS Simulator (Mac only)
```bash
# Install Xcode from App Store
# Open iOS Simulator
npx expo start --ios
```

### Android Emulator
```bash
# Install Android Studio
# Create and start Android Virtual Device
npx expo start --android
```

### Physical Device
1. Install Expo Go app from App Store/Play Store
2. Scan QR code from `npx expo start`
3. App will load on your device

## 🔒 Security Testing

### Emergency SOS Testing
1. Login as any user
2. Navigate to Emergency SOS screen
3. Test SOS button (won't send real alerts in development)
4. Test emergency contact management

### GPS Tracking Testing
1. Login as sitter
2. Start a session
3. Test location tracking (simulated in development)
4. Test geofencing alerts

### Payment Testing
1. Use Stripe test card numbers:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
2. Test payment flow with test credentials

## 📈 Monitoring

### Backend Health Check
```
GET http://localhost:3001/api/v1/health
```

### API Documentation
```
GET http://localhost:3001/api/docs
```

### Database Status
```bash
# Check database tables
psql -h localhost -U postgres -d nannyradar -c "\dt"

# Check user count
psql -h localhost -U postgres -d nannyradar -c "SELECT COUNT(*) FROM users;"
```

## 🎯 Next Steps

1. **Explore the App**: Test all features with different user types
2. **Modify Code**: Make changes and see them reflect immediately
3. **Add Features**: Implement new functionality
4. **Test Security**: Verify all security features work correctly
5. **Performance Testing**: Monitor app performance and optimize

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review the console logs for error messages
3. Check the API documentation at http://localhost:3001/api/docs
4. Create an issue in the repository

---

**Happy Testing! 🚀**

The NannyRadar application is now ready for local development and testing. You can explore both the parent and sitter sides with the provided admin credentials and test data. 