import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

export class TestApp {
  private app: INestApplication;

  async init() {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    this.app = moduleFixture.createNestApplication();
    await this.app.init();
    return this.app;
  }

  async close() {
    if (this.app) {
      await this.app.close();
    }
  }

  getHttpServer() {
    return this.app.getHttpServer();
  }

  request() {
    return request(this.app.getHttpServer());
  }
}

// Global test utilities
export const createTestApp = async (): Promise<TestApp> => {
  const testApp = new TestApp();
  await testApp.init();
  return testApp;
};

// Test data factories
export const createTestUser = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  password: 'hashedPassword',
  userType: 'parent',
  ...overrides,
});

export const createTestBooking = (overrides = {}) => ({
  id: 'test-booking-id',
  parentId: 'test-parent-id',
  sitterId: 'test-sitter-id',
  startTime: new Date('2024-01-01T10:00:00Z'),
  endTime: new Date('2024-01-01T14:00:00Z'),
  status: 'confirmed',
  hourlyRate: 25,
  ...overrides,
});

export const createTestPayment = (overrides = {}) => ({
  id: 'test-payment-id',
  bookingId: 'test-booking-id',
  amount: 10000, // $100.00 in cents
  currency: 'usd',
  status: 'pending',
  stripePaymentIntentId: 'pi_test_123',
  ...overrides,
}); 