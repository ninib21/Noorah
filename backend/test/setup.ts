import 'reflect-metadata';

// Global test setup
beforeAll(() => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret-key';
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/nannyradar_test';
  process.env.STRIPE_SECRET_KEY = 'sk_test_test';
});

afterAll(() => {
  // Cleanup
});

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    paymentIntents: {
      create: jest.fn().mockResolvedValue({
        id: 'pi_test_123',
        client_secret: 'pi_test_secret_123',
        status: 'requires_payment_method',
      }),
      confirm: jest.fn().mockResolvedValue({
        id: 'pi_test_123',
        status: 'succeeded',
      }),
      retrieve: jest.fn().mockResolvedValue({
        id: 'pi_test_123',
        status: 'succeeded',
        amount: 1000,
      }),
    },
    refunds: {
      create: jest.fn().mockResolvedValue({
        id: 're_test_123',
        status: 'succeeded',
      }),
    },
    accounts: {
      create: jest.fn().mockResolvedValue({
        id: 'acct_test_123',
        object: 'account',
      }),
    },
  }));
});

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true),
})); 