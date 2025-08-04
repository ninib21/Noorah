# 🧪 NannyRadar Test Credentials

## 📱 **Testing URLs**

### **Web App (Development)**
- **URL**: http://localhost:19006
- **Alternative**: http://localhost:3000 (if backend is running)

### **Mobile App Testing**
- **iOS Simulator**: Available via Expo Go app
- **Android Emulator**: Available via Expo Go app
- **Physical Device**: Scan QR code from Expo CLI

## 👤 **Test User Accounts**

### **Parent Account**
```
Email: parent@nannyradar.com
Password: TestParent123!
Phone: +1-555-0123
```

### **Sitter Account**
```
Email: sitter@nannyradar.com
Password: TestSitter123!
Phone: +1-555-0456
```

### **Admin Account**
```
Email: admin@nannyradar.com
Password: AdminTest123!
Phone: +1-555-0789
```

## 🔑 **Test API Keys**

### **Stripe Test Keys**
```
Publishable Key: pk_test_your_stripe_publishable_key_here
Secret Key: sk_test_your_stripe_secret_key_here
```

### **Firebase Test Config**
```
API Key: AIzaSyBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890
Project ID: nannyradar-test
```

## 🧪 **Test Scenarios**

### **1. User Registration Flow**
1. Open app → Splash Screen
2. Tap "Sign Up" → Registration Form
3. Enter test credentials
4. Verify email/phone
5. Complete profile setup

### **2. Parent Booking Flow**
1. Login as parent
2. Browse available sitters
3. Select sitter and time
4. Confirm booking
5. Make payment
6. Track session

### **3. Sitter Job Flow**
1. Login as sitter
2. View job requests
3. Accept/decline bookings
4. Start/end sessions
5. Submit reports

### **4. Emergency Features**
1. Test SOS button
2. Verify location sharing
3. Test emergency contacts
4. Check real-time tracking

## 🛠️ **Development Commands**

### **Start Development Server**
```bash
# Web version
npx expo start --web

# iOS Simulator
npx expo start --ios

# Android Emulator
npx expo start --android

# All platforms
npx expo start
```

### **Run Tests**
```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# All tests
npm run test:all
```

### **Backend API Testing**
```bash
# Start backend server
cd backend && npm run start:dev

# Test API endpoints
curl http://localhost:3000/api/health
```

## 📊 **Test Data**

### **Sample Bookings**
```
Booking 1:
- Parent: parent@nannyradar.com
- Sitter: sitter@nannyradar.com
- Date: Today
- Time: 2:00 PM - 6:00 PM
- Rate: $25/hour
- Status: Confirmed

Booking 2:
- Parent: parent@nannyradar.com
- Sitter: sitter@nannyradar.com
- Date: Tomorrow
- Time: 9:00 AM - 1:00 PM
- Rate: $30/hour
- Status: Pending
```

### **Sample Reviews**
```
Review 1:
- Rating: 5 stars
- Comment: "Excellent sitter! Very reliable and great with kids."
- Date: 2024-01-15

Review 2:
- Rating: 4 stars
- Comment: "Good experience, kids had fun."
- Date: 2024-01-10
```

## 🔒 **Security Testing**

### **Authentication Tests**
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Password reset flow
- [ ] Biometric authentication
- [ ] Session timeout

### **Authorization Tests**
- [ ] Parent-only features
- [ ] Sitter-only features
- [ ] Admin-only features
- [ ] Cross-user data access

### **Data Protection Tests**
- [ ] Sensitive data encryption
- [ ] Secure communication
- [ ] Privacy compliance
- [ ] GDPR compliance

## 📱 **Device Testing Checklist**

### **iOS Testing**
- [ ] iPhone 14 Pro
- [ ] iPhone 12
- [ ] iPad
- [ ] iOS 16+
- [ ] iOS 17+

### **Android Testing**
- [ ] Samsung Galaxy S23
- [ ] Google Pixel 7
- [ ] OnePlus 11
- [ ] Android 13+
- [ ] Android 14+

### **Web Testing**
- [ ] Chrome (latest)
- [ ] Safari (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers

## 🚨 **Known Issues & Workarounds**

### **Current Issues**
1. **Expo Web Loading**: Sometimes slow to load - use `--offline` flag
2. **Metro Bundler**: May need restart - use `npx expo start --clear`
3. **Backend Connection**: Ensure backend is running on port 3000

### **Troubleshooting**
```bash
# Clear cache
npx expo start --clear

# Reset Metro bundler
npx expo start --reset-cache

# Offline mode
npx expo start --offline

# Specific port
npx expo start --web --port 19006
```

---

**Last Updated**: January 2024
**Version**: 1.0.0
**Environment**: Development/Testing 