# 🧪 Comprehensive Testing Suite

This document outlines the complete testing infrastructure for the GuardianNest babysitting app, covering unit tests, integration tests, E2E tests, load testing, and security testing.

## 📋 Table of Contents

- [Overview](#overview)
- [Backend Testing](#backend-testing)
- [Frontend Testing](#frontend-testing)
- [E2E Testing](#e2e-testing)
- [Load Testing](#load-testing)
- [Security Testing](#security-testing)
- [Running Tests](#running-tests)
- [CI/CD Integration](#cicd-integration)
- [Test Coverage](#test-coverage)
- [Best Practices](#best-practices)

## 🎯 Overview

Our testing suite follows the testing pyramid approach:
- **Unit Tests**: 70% - Fast, isolated tests for individual components
- **Integration Tests**: 20% - Tests for API endpoints and service interactions
- **E2E Tests**: 10% - Full user journey tests
- **Load Tests**: Performance and scalability validation
- **Security Tests**: Vulnerability scanning and security validation

## 🔧 Backend Testing

### Unit Tests (Jest)

**Location**: `backend/src/**/*.spec.ts`

**Coverage**: Controllers, Services, DTOs, Guards, and Utilities

**Example Test Structure**:
```typescript
describe('PaymentsController', () => {
  let controller: PaymentsController;
  let service: PaymentsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        {
          provide: PaymentsService,
          useValue: mockPaymentsService,
        },
      ],
    }).compile();

    controller = module.get<PaymentsController>(PaymentsController);
    service = module.get<PaymentsService>(PaymentsService);
  });

  it('should create payment intent successfully', async () => {
    // Test implementation
  });
});
```

**Key Features**:
- ✅ Mocked external dependencies (Stripe, Database)
- ✅ Isolated service testing
- ✅ Error handling validation
- ✅ Input validation testing
- ✅ Authentication/Authorization testing

### Integration Tests

**Location**: `backend/test/**/*.e2e-spec.ts`

**Coverage**: Full API endpoint testing with database integration

**Example Test Structure**:
```typescript
describe('Payments API (e2e)', () => {
  let app: TestApp;
  let authToken: string;

  beforeAll(async () => {
    app = await createTestApp();
    authToken = await getAuthToken();
  });

  it('should create payment intent via API', async () => {
    const response = await app.request()
      .post('/payments/create-intent')
      .set('Authorization', `Bearer ${authToken}`)
      .send(createPaymentIntentData)
      .expect(201);
  });
});
```

**Key Features**:
- ✅ Real database connections (test database)
- ✅ Full request/response cycle testing
- ✅ Authentication flow testing
- ✅ Error response validation
- ✅ Database state validation

### Test Setup

**Configuration Files**:
- `backend/jest.config.js` - Unit test configuration
- `backend/test/jest-e2e.json` - E2E test configuration
- `backend/test/setup.ts` - Unit test setup
- `backend/test/setup-e2e.ts` - E2E test setup

**Environment Variables**:
```bash
NODE_ENV=test
JWT_SECRET=test-secret-key
DATABASE_URL=postgresql://test:test@localhost:5432/babysitting_test
STRIPE_SECRET_KEY=sk_test_test
```

## 📱 Frontend Testing

### Unit Tests (Jest + React Native Testing Library)

**Location**: `babysitting-app/src/**/*.test.tsx`

**Coverage**: Components, Hooks, Services, and Utilities

**Example Test Structure**:
```typescript
describe('Button Component', () => {
  const defaultProps = {
    title: 'Test Button',
    onPress: jest.fn(),
  };

  it('renders correctly with default props', () => {
    const { getByText } = render(<Button {...defaultProps} />);
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <Button {...defaultProps} onPress={onPressMock} />
    );
    
    fireEvent.press(getByText('Test Button'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });
});
```

**Key Features**:
- ✅ Component rendering tests
- ✅ User interaction testing
- ✅ Props validation
- ✅ Accessibility testing
- ✅ Error boundary testing

### Test Setup

**Configuration Files**:
- `babysitting-app/jest.config.js` - Jest configuration
- `babysitting-app/test/setup.ts` - Test setup with mocks

**Mocked Dependencies**:
- ✅ Expo modules (Location, Notifications, SecureStore)
- ✅ React Navigation
- ✅ Redux store
- ✅ Firebase services
- ✅ AsyncStorage

## 🚀 E2E Testing

### Detox (React Native)

**Location**: `babysitting-app/e2e/**/*.e2e.js`

**Coverage**: Complete user journeys and critical flows

**Example Test Structure**:
```javascript
describe('Login Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should login successfully', async () => {
    await element(by.placeholder('Email')).typeText('test@example.com');
    await element(by.placeholder('Password')).typeText('password123');
    await element(by.text('Sign In')).tap();
    
    await waitFor(element(by.text('Choose Your Role')))
      .toBeVisible()
      .withTimeout(5000);
  });
});
```

**Key Features**:
- ✅ Real device/simulator testing
- ✅ User interaction simulation
- ✅ Navigation flow testing
- ✅ Error handling validation
- ✅ Performance monitoring

### Configuration

**Files**:
- `.detoxrc.js` - Detox configuration
- `e2e/config.json` - Jest E2E configuration

**Supported Platforms**:
- ✅ iOS Simulator
- ✅ Android Emulator
- ✅ Debug and Release builds

## ⚡ Load Testing

### k6 Performance Testing

**Location**: `backend/test/load/load-test.js`

**Coverage**: API performance under load

**Test Scenarios**:
- ✅ Payment processing load
- ✅ User authentication load
- ✅ Booking creation load
- ✅ Concurrent user simulation

**Configuration**:
```javascript
export const options = {
  stages: [
    { duration: '2m', target: 10 },  // Ramp up
    { duration: '5m', target: 10 },  // Steady load
    { duration: '2m', target: 20 },  // Peak load
    { duration: '5m', target: 20 },  // Sustained peak
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.1'],
  },
};
```

**Key Metrics**:
- ✅ Response time (95th percentile < 500ms)
- ✅ Error rate (< 10%)
- ✅ Throughput (requests per second)
- ✅ Resource utilization

## 🔒 Security Testing

### OWASP ZAP

**Configuration**: `backend/test/security/owasp-zap-baseline.conf`

**Coverage**:
- ✅ SQL Injection testing
- ✅ XSS vulnerability scanning
- ✅ Authentication bypass testing
- ✅ Authorization testing
- ✅ Input validation testing

**Scan Types**:
- ✅ Passive scanning (non-intrusive)
- ✅ Active scanning (intrusive)
- ✅ Spider crawling
- ✅ AJAX spider crawling

### Snyk Security Scanning

**Configuration**: `backend/test/security/snyk-policy.json`

**Coverage**:
- ✅ Dependency vulnerability scanning
- ✅ License compliance checking
- ✅ Container image scanning
- ✅ Infrastructure as Code scanning

**Severity Levels**:
- ✅ High: Fail build
- ✅ Medium: Warning
- ✅ Low: Info only

## 🏃‍♂️ Running Tests

### Backend Tests

```bash
# Install dependencies
cd backend
npm install

# Run unit tests
npm test

# Run unit tests with coverage
npm run test:cov

# Run E2E tests
npm run test:e2e

# Run load tests
npm run test:load

# Run security tests
npm run test:security

# Run all tests
npm run test:all
```

### Frontend Tests

```bash
# Install dependencies
cd babysitting-app
npm install

# Run unit tests
npm test

# Run unit tests with coverage
npm run test:coverage

# Run E2E tests (iOS)
npm run test:e2e

# Run E2E tests (Android)
npm run test:e2e:android

# Run security tests
npm run test:security

# Run all tests
npm run test:all
```

### Load Testing

```bash
# Install k6
# macOS: brew install k6
# Windows: choco install k6
# Linux: https://k6.io/docs/getting-started/installation/

# Run load test
cd backend
k6 run test/load/load-test.js

# Run with custom environment variables
k6 run -e BASE_URL=http://localhost:3000 -e TEST_USER_TOKEN=your-token test/load/load-test.js
```

### Security Testing

```bash
# Install OWASP ZAP
# Download from: https://www.zaproxy.org/download/

# Run ZAP baseline scan
cd backend
zap-baseline.py -t http://localhost:3000 -c test/security/owasp-zap-baseline.conf

# Install Snyk
npm install -g snyk

# Run Snyk security scan
snyk test

# Run Snyk with policy
snyk test --policy-path=test/security/snyk-policy.json
```

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Test Suite

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd backend && npm install
      - run: cd backend && npm run test:all

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd babysitting-app && npm install
      - run: cd babysitting-app && npm run test:all

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install -g snyk
      - run: snyk test --severity-threshold=high
```

## 📊 Test Coverage

### Coverage Targets

**Backend**:
- ✅ Lines: 80%
- ✅ Functions: 80%
- ✅ Branches: 80%
- ✅ Statements: 80%

**Frontend**:
- ✅ Lines: 80%
- ✅ Functions: 80%
- ✅ Branches: 80%
- ✅ Statements: 80%

### Coverage Reports

**Backend**: `backend/coverage/`
**Frontend**: `babysitting-app/coverage/`

## 🎯 Best Practices

### Test Organization

1. **Naming Convention**:
   - Unit tests: `*.spec.ts`
   - E2E tests: `*.e2e-spec.ts`
   - Load tests: `*.load.js`

2. **Test Structure**:
   - Arrange: Set up test data
   - Act: Execute the function/component
   - Assert: Verify the results

3. **Test Isolation**:
   - Each test should be independent
   - Clean up after each test
   - Use beforeEach/afterEach hooks

### Performance Testing

1. **Load Test Scenarios**:
   - Normal load (expected traffic)
   - Peak load (2x expected traffic)
   - Stress test (3x expected traffic)
   - Spike test (sudden traffic increase)

2. **Performance Metrics**:
   - Response time (p95, p99)
   - Throughput (RPS)
   - Error rate
   - Resource utilization

### Security Testing

1. **Regular Scans**:
   - Daily: Dependency vulnerability scans
   - Weekly: OWASP ZAP scans
   - Monthly: Penetration testing

2. **Security Checklist**:
   - ✅ Input validation
   - ✅ Authentication/Authorization
   - ✅ Data encryption
   - ✅ Secure communication (HTTPS)
   - ✅ Error handling (no information leakage)

### Maintenance

1. **Test Maintenance**:
   - Update tests when features change
   - Remove obsolete tests
   - Keep test data current

2. **Monitoring**:
   - Track test execution time
   - Monitor flaky tests
   - Review coverage reports

## 🚨 Troubleshooting

### Common Issues

1. **Test Environment Setup**:
   ```bash
   # Ensure test database is running
   docker-compose -f docker-compose.test.yml up -d
   
   # Reset test database
   npm run test:db:reset
   ```

2. **Detox Issues**:
   ```bash
   # Clean Detox cache
   detox clean-framework-cache
   detox clean-build-cache
   
   # Rebuild app
   detox build
   ```

3. **k6 Issues**:
   ```bash
   # Check k6 installation
   k6 version
   
   # Validate test script
   k6 check test/load/load-test.js
   ```

### Debug Mode

```bash
# Backend tests with debug
npm run test:debug

# Frontend tests with debug
npm run test -- --verbose

# E2E tests with debug
detox test --configuration ios.sim.debug --loglevel trace
```

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Detox Documentation](https://wix.github.io/Detox/)
- [k6 Documentation](https://k6.io/docs/)
- [OWASP ZAP Documentation](https://www.zaproxy.org/docs/)
- [Snyk Documentation](https://docs.snyk.io/)

---

**Note**: This testing suite is designed to ensure high code quality, security, and reliability for the GuardianNest babysitting app. Regular updates and maintenance are essential to keep the tests relevant and effective. 