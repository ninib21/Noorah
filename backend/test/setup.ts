// Test setup file for Noorah backend
import 'reflect-metadata';

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'file:./test.db';
process.env.JWT_SECRET = 'test_secret';
process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
process.env.FRONTEND_URL = 'http://localhost:3000';

// Global test setup
beforeAll(async () => {
  // Setup test database or mock services
});

afterAll(async () => {
  // Cleanup after all tests
});

beforeEach(() => {
  // Setup before each test
});

afterEach(() => {
  // Cleanup after each test
});

