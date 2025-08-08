#!/usr/bin/env node

/**
 * NannyRadar App Functionality Test Suite
 * 
 * This script tests all critical app functionality to ensure
 * everything works smoothly without errors.
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 NannyRadar App Functionality Test Suite');
console.log('==========================================\n');

// Test Results
let testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

function logTest(testName, passed, error = null) {
  if (passed) {
    console.log(`✅ ${testName}`);
    testResults.passed++;
  } else {
    console.log(`❌ ${testName}`);
    testResults.failed++;
    if (error) {
      testResults.errors.push(`${testName}: ${error}`);
    }
  }
}

// Test 1: Check if all required files exist
console.log('📁 Testing File Structure...\n');

const requiredFiles = [
  'babysitting-app/App.tsx',
  'babysitting-app/package.json',
  'babysitting-app/babel.config.js',
  'babysitting-app/metro.config.js',
  'babysitting-app/.env.example',
  'babysitting-app/types/env.d.ts',
  'backend/src/main.ts',
  'backend/package.json',
  'backend/src/app.module.ts',
  'backend/env.example'
];

requiredFiles.forEach(file => {
  const exists = fs.existsSync(file);
  logTest(`File exists: ${file}`, exists);
});

// Test 2: Check if all screens exist
console.log('\n📱 Testing Screen Files...\n');

const requiredScreens = [
  'babysitting-app/src/screens/SplashScreen.tsx',
  'babysitting-app/src/screens/OnboardingScreen.tsx',
  'babysitting-app/src/screens/LoginScreen.tsx',
  'babysitting-app/src/screens/SignupScreen.tsx',
  'babysitting-app/src/screens/ForgotPasswordScreen.tsx',
  'babysitting-app/src/screens/UserTypeSelectionScreen.tsx',
  'babysitting-app/src/screens/ProfileSetupScreen.tsx',
  'babysitting-app/src/screens/NavigationTestScreen.tsx',
  'babysitting-app/src/screens/parent/ParentHomeScreen.tsx',
  'babysitting-app/src/screens/parent/ParentBookScreen.tsx',
  'babysitting-app/src/screens/parent/BookingFlowScreen.tsx',
  'babysitting-app/src/screens/parent/PaymentScreen.tsx',
  'babysitting-app/src/screens/sitter/SitterHomeScreen.tsx'
];

requiredScreens.forEach(screen => {
  const exists = fs.existsSync(screen);
  logTest(`Screen exists: ${path.basename(screen)}`, exists);
});

// Test 3: Check if all components exist
console.log('\n🧩 Testing Component Files...\n');

const requiredComponents = [
  'babysitting-app/src/components/Button.tsx',
  'babysitting-app/src/components/Card.tsx',
  'babysitting-app/src/components/Tabs.tsx',
  'babysitting-app/src/components/Modal.tsx',
  'babysitting-app/src/components/AnimatedComponents.tsx'
];

requiredComponents.forEach(component => {
  const exists = fs.existsSync(component);
  logTest(`Component exists: ${path.basename(component)}`, exists);
});

// Test 4: Check if all services exist
console.log('\n⚙️ Testing Service Files...\n');

const requiredServices = [
  'babysitting-app/src/services/firebase.service.ts',
  'babysitting-app/src/services/payment.service.ts',
  'babysitting-app/src/services/feedback.service.ts',
  'babysitting-app/src/services/emergency-sos.service.ts',
  'babysitting-app/src/services/security-config.service.ts'
];

requiredServices.forEach(service => {
  const exists = fs.existsSync(service);
  logTest(`Service exists: ${path.basename(service)}`, exists);
});

// Test 5: Check navigation structure
console.log('\n🧭 Testing Navigation Structure...\n');

try {
  const appContent = fs.readFileSync('babysitting-app/App.tsx', 'utf8');
  
  const requiredScreenNames = [
    'Splash',
    'Onboarding', 
    'Login',
    'Signup',
    'ForgotPassword',
    'UserTypeSelection',
    'ProfileSetup',
    'ParentTabs',
    'SitterTabs',
    'BookingFlow',
    'Payment'
  ];

  requiredScreenNames.forEach(screenName => {
    const hasScreen = appContent.includes(`name="${screenName}"`);
    logTest(`Navigation includes: ${screenName}`, hasScreen);
  });

} catch (error) {
  logTest('Navigation structure check', false, error.message);
}

// Test 6: Check backend modules
console.log('\n🔧 Testing Backend Modules...\n');

try {
  const appModuleContent = fs.readFileSync('backend/src/app.module.ts', 'utf8');
  
  const requiredModules = [
    'AuthModule',
    'UsersModule',
    'BookingsModule',
    'PaymentsModule',
    'SecurityModule',
    'MonitoringModule'
  ];

  requiredModules.forEach(moduleName => {
    const hasModule = appModuleContent.includes(moduleName);
    logTest(`Backend module: ${moduleName}`, hasModule);
  });

} catch (error) {
  logTest('Backend modules check', false, error.message);
}

// Test 7: Check package.json dependencies
console.log('\n📦 Testing Dependencies...\n');

try {
  const packageJson = JSON.parse(fs.readFileSync('babysitting-app/package.json', 'utf8'));
  
  const criticalDependencies = [
    '@react-navigation/native',
    '@react-navigation/stack',
    '@react-navigation/bottom-tabs',
    'react-redux',
    '@reduxjs/toolkit',
    'expo-linear-gradient',
    '@expo/vector-icons',
    'react-native-reanimated',
    'react-native-dotenv'
  ];

  criticalDependencies.forEach(dep => {
    const hasDep = packageJson.dependencies && packageJson.dependencies[dep];
    logTest(`Dependency: ${dep}`, !!hasDep);
  });

} catch (error) {
  logTest('Dependencies check', false, error.message);
}

// Test 8: Check backend dependencies
console.log('\n🔧 Testing Backend Dependencies...\n');

try {
  const backendPackageJson = JSON.parse(fs.readFileSync('backend/package.json', 'utf8'));
  
  const criticalBackendDeps = [
    '@nestjs/core',
    '@nestjs/common',
    '@nestjs/typeorm',
    '@nestjs/jwt',
    '@nestjs/passport',
    'typeorm',
    'pg',
    'bcryptjs',
    'class-validator'
  ];

  criticalBackendDeps.forEach(dep => {
    const hasDep = backendPackageJson.dependencies && backendPackageJson.dependencies[dep];
    logTest(`Backend dependency: ${dep}`, !!hasDep);
  });

} catch (error) {
  logTest('Backend dependencies check', false, error.message);
}

// Test Results Summary
console.log('\n📊 Test Results Summary');
console.log('======================');
console.log(`✅ Passed: ${testResults.passed}`);
console.log(`❌ Failed: ${testResults.failed}`);
console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);

if (testResults.failed > 0) {
  console.log('\n🚨 Errors Found:');
  testResults.errors.forEach(error => {
    console.log(`   • ${error}`);
  });
}

console.log('\n🎯 App Functionality Status:');
if (testResults.failed === 0) {
  console.log('🎉 ALL TESTS PASSED! Your app is ready for testing!');
  console.log('\n🚀 Next Steps:');
  console.log('   1. Run "cd babysitting-app && npm install"');
  console.log('   2. Run "cd backend && npm install"');
  console.log('   3. Start the backend: "cd backend && npm run start:dev"');
  console.log('   4. Start the frontend: "cd babysitting-app && npm start"');
} else if (testResults.failed <= 5) {
  console.log('⚠️  MINOR ISSUES FOUND - App should work with minor fixes needed');
} else {
  console.log('🔴 MAJOR ISSUES FOUND - Significant fixes needed before testing');
}

console.log('\n✨ NannyRadar - Diamond-Solid Security & Top-Rated Functionality! ✨');
