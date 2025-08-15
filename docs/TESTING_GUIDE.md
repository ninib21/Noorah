# 🧪 NannyRadar App Testing Guide

## 🚀 Quick Start Testing

### 📱 **How to Access the App**

1. **Start the Backend Server:**
   ```bash
   cd backend
   npm install
   npm run start:dev
   ```
   Backend will run at: `http://localhost:3001`

2. **Start the Frontend App:**
   ```bash
   cd babysitting-app
   npm install
   npm start
   ```
   Frontend will run at: `http://localhost:19006` (web) or scan QR code for mobile

---

## 🔗 **Direct Testing Links**

### **🌐 Web Testing URLs**
- **Main App:** `http://localhost:19006`
- **Signup Page:** `http://localhost:19006` → Skip onboarding → "Sign Up"
- **Login Page:** `http://localhost:19006` → Skip onboarding → "Already have account"
- **Navigation Test:** Access via NavigationTest screen in app

### **📱 Mobile Testing**
- Scan QR code from Expo CLI
- Use Expo Go app on your phone
- All same functionality as web version

---

## 👥 **Test User Credentials**

### 🏠 **PARENT TEST ACCOUNTS**

#### **Parent Account #1 - Jennifer Smith**
```
Email: jennifer.parent@test.com
Password: TestParent123!
Phone: +1-555-0101
First Name: Jennifer
Last Name: Smith
User Type: Parent
```

#### **Parent Account #2 - Michael Johnson**
```
Email: michael.parent@test.com
Password: TestParent456!
Phone: +1-555-0102
First Name: Michael
Last Name: Johnson
User Type: Parent
```

### 👶 **SITTER TEST ACCOUNTS**

#### **Sitter Account #1 - Sarah Wilson**
```
Email: sarah.sitter@test.com
Password: TestSitter123!
Phone: +1-555-0201
First Name: Sarah
Last Name: Wilson
User Type: Sitter
```

#### **Sitter Account #2 - Emma Rodriguez**
```
Email: emma.sitter@test.com
Password: TestSitter456!
Phone: +1-555-0202
First Name: Emma
Last Name: Rodriguez
User Type: Sitter
```

---

## 🧭 **Complete Testing Flow**

### **🔥 STEP-BY-STEP TESTING PROCESS**

#### **1. 🎬 Initial App Launch**
1. Open app → **SplashScreen** (3 seconds)
2. Auto-navigate to **OnboardingScreen**
3. Swipe through 3 slides or tap "Skip"
4. Tap "Get Started" → Navigate to **SignupScreen**

#### **2. 📝 Test Signup Flow**

**For Parent Testing:**
1. Fill signup form with Parent credentials above
2. Tap "Create Account"
3. Navigate to **UserTypeSelectionScreen**
4. Select "I'm a Parent"
5. Navigate to **ParentTabs**

**For Sitter Testing:**
1. Fill signup form with Sitter credentials above
2. Tap "Create Account"
3. Navigate to **UserTypeSelectionScreen**
4. Select "I'm a Babysitter"
5. Navigate to **SitterTabs**

#### **3. 🏠 Test Parent Side Features**

**Parent Home Tab:**
- View upcoming bookings
- Quick actions (Book Sitter, My Sitters, Messages, Emergency)
- Recent sitters list
- Safety features section

**Parent Book Tab:**
- Search for sitters
- Filter by availability, rate, skills
- View sitter profiles
- Book a sitter
- Navigate to BookingFlow

**Parent My Sitters Tab:**
- View favorite sitters
- Sitter availability
- Contact sitters
- View booking history

**Parent Messages Tab:**
- Chat with sitters
- View message history
- Send photos/updates

**Parent Profile Tab:**
- Edit profile information
- Payment methods
- Settings and preferences
- Emergency contacts

#### **4. 👶 Test Sitter Side Features**

**Sitter Home Tab:**
- View available jobs
- Earnings summary
- Recent bookings
- Quick actions

**Sitter Jobs Tab:**
- Browse available jobs
- Accept/decline bookings
- View job details
- Set availability

**Sitter Messages Tab:**
- Chat with parents
- View booking communications
- Send updates during jobs

**Sitter Earnings Tab:**
- View earnings history
- Payment information
- Tax documents
- Withdrawal options

**Sitter Profile Tab:**
- Edit profile and bio
- Upload verification documents
- Skills and certifications
- Availability settings

---

## 🔧 **Advanced Testing Features**

### **🛠️ Navigation Test Screen**
Access via: App → NavigationTest (if available in navigation)

**Test Categories:**
- Parent Flow Testing
- Sitter Flow Testing
- Security Features Testing
- Emergency SOS Testing
- Session Monitoring Testing
- Payment Flow Testing
- Booking Flow Testing

### **🔒 Security Features Testing**
- Emergency SOS button
- Real-time GPS tracking
- Session monitoring
- Secure messaging
- Payment security
- Background checks

### **💳 Payment Testing**
Use test payment credentials:
```
Card Number: 4242 4242 4242 4242
Expiry: 12/25
CVV: 123
Name: Test User
```

---

## 🎯 **Specific Test Scenarios**

### **📋 Parent User Journey**
1. **Signup** → **Select Parent** → **Parent Home**
2. **Book Sitter** → **Search** → **Select Sitter** → **BookingFlow**
3. **Complete Booking** → **Payment** → **Confirmation**
4. **Message Sitter** → **Track Session** → **Emergency Features**

### **📋 Sitter User Journey**
1. **Signup** → **Select Sitter** → **Sitter Home**
2. **Browse Jobs** → **Accept Job** → **View Details**
3. **Message Parent** → **Start Session** → **Complete Job**
4. **View Earnings** → **Update Profile** → **Set Availability**

---

## 🚨 **Testing Checklist**

### **✅ Authentication Testing**
- [ ] Signup with parent credentials
- [ ] Signup with sitter credentials
- [ ] Login with existing accounts
- [ ] Forgot password flow
- [ ] Logout functionality

### **✅ Navigation Testing**
- [ ] All tabs work in parent flow
- [ ] All tabs work in sitter flow
- [ ] Back navigation works
- [ ] Deep linking works
- [ ] Screen transitions smooth

### **✅ Core Features Testing**
- [ ] Booking flow complete
- [ ] Payment processing works
- [ ] Messaging system functional
- [ ] Profile editing works
- [ ] Search and filters work

### **✅ Security Features Testing**
- [ ] Emergency SOS activates
- [ ] GPS tracking works
- [ ] Session monitoring active
- [ ] Secure data handling
- [ ] Authentication secure

---

## 🐛 **Troubleshooting**

### **Common Issues & Solutions**

**App won't start:**
- Check if backend is running on port 3001
- Verify npm install completed successfully
- Clear Metro cache: `npx react-native start --reset-cache`

**Navigation not working:**
- Check console for navigation errors
- Verify all screens are registered in App.tsx
- Test with NavigationTest screen

**Backend API errors:**
- Check backend logs for errors
- Verify database connection
- Check environment variables

**Styling issues:**
- Clear Metro cache
- Restart development server
- Check for missing dependencies

---

## 📞 **Support & Next Steps**

**If you encounter any issues:**
1. Check browser/app console for errors
2. Verify backend server is running
3. Use provided test credentials exactly
4. Test on both web and mobile
5. Use NavigationTest screen for debugging

**Your app is ready for comprehensive testing! 🚀**
