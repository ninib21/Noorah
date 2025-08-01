import { TestApp, createTestApp, createTestUser, createTestBooking } from './setup-e2e';
import * as request from 'supertest';

describe('Payments API (e2e)', () => {
  let app: TestApp;
  let authToken: string;

  beforeAll(async () => {
    app = await createTestApp();
    
    // Create test user and get auth token
    const testUser = createTestUser();
    const loginResponse = await app.request()
      .post('/auth/login')
      .send({
        email: testUser.email,
        password: 'testpassword',
      });
    
    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /payments/create-intent', () => {
    it('should create a payment intent successfully', async () => {
      const createPaymentIntentData = {
        bookingId: 'test-booking-id',
        paymentMethodId: 'pm_test_123',
      };

      const response = await app.request()
        .post('/payments/create-intent')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createPaymentIntentData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('client_secret');
      expect(response.body.status).toBe('requires_payment_method');
    });

    it('should return 400 for invalid booking ID', async () => {
      const invalidData = {
        bookingId: '',
        paymentMethodId: 'pm_test_123',
      };

      await app.request()
        .post('/payments/create-intent')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);
    });

    it('should return 401 without authentication', async () => {
      const createPaymentIntentData = {
        bookingId: 'test-booking-id',
        paymentMethodId: 'pm_test_123',
      };

      await app.request()
        .post('/payments/create-intent')
        .send(createPaymentIntentData)
        .expect(401);
    });
  });

  describe('POST /payments/process', () => {
    it('should process a payment successfully', async () => {
      const processPaymentData = {
        paymentIntentId: 'pi_test_123',
      };

      const response = await app.request()
        .post('/payments/process')
        .set('Authorization', `Bearer ${authToken}`)
        .send(processPaymentData)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('status');
    });
  });

  describe('POST /payments/:id/confirm', () => {
    it('should confirm a payment successfully', async () => {
      const paymentId = 'test-payment-id';

      const response = await app.request()
        .post(`/payments/${paymentId}/confirm`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', paymentId);
      expect(response.body).toHaveProperty('status');
    });

    it('should return 404 for non-existent payment', async () => {
      const nonExistentPaymentId = 'non-existent-payment-id';

      await app.request()
        .post(`/payments/${nonExistentPaymentId}/confirm`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('POST /payments/:id/refund', () => {
    it('should refund a payment successfully', async () => {
      const paymentId = 'test-payment-id';
      const refundData = {
        reason: 'Customer requested refund',
      };

      const response = await app.request()
        .post(`/payments/${paymentId}/refund`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(refundData)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('status');
    });
  });

  describe('GET /payments', () => {
    it('should get payments with filters', async () => {
      const response = await app.request()
        .get('/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          status: 'completed',
          page: 1,
          limit: 10,
        })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should get payments without filters', async () => {
      const response = await app.request()
        .get('/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /payments/:id', () => {
    it('should get a specific payment by ID', async () => {
      const paymentId = 'test-payment-id';

      const response = await app.request()
        .get(`/payments/${paymentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', paymentId);
    });

    it('should return 404 for non-existent payment', async () => {
      const nonExistentPaymentId = 'non-existent-payment-id';

      await app.request()
        .get(`/payments/${nonExistentPaymentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('GET /payments/booking/:bookingId', () => {
    it('should get payments for a specific booking', async () => {
      const bookingId = 'test-booking-id';

      const response = await app.request()
        .get(`/payments/booking/${bookingId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /payments/stripe/webhook', () => {
    it('should handle Stripe webhook successfully', async () => {
      const webhookPayload = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test_123',
            status: 'succeeded',
            amount: 10000,
          },
        },
      };

      const response = await app.request()
        .post('/payments/stripe/webhook')
        .send(webhookPayload)
        .expect(200);

      expect(response.body).toHaveProperty('received', true);
    });
  });

  describe('POST /payments/sitter/connect', () => {
    it('should create Stripe Connect account for sitter', async () => {
      const response = await app.request()
        .post('/payments/sitter/connect')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);

      expect(response.body).toHaveProperty('accountId');
      expect(response.body).toHaveProperty('onboardingUrl');
    });
  });

  describe('GET /payments/sitter/connect/status', () => {
    it('should get sitter connect status', async () => {
      const response = await app.request()
        .get('/payments/sitter/connect/status')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('accountId');
      expect(response.body).toHaveProperty('status');
    });
  });

  describe('POST /payments/sitter/payout', () => {
    it('should request sitter payout successfully', async () => {
      const payoutData = {
        amount: 5000, // $50.00
      };

      const response = await app.request()
        .post('/payments/sitter/payout')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payoutData)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('amount', 5000);
    });
  });

  describe('GET /payments/sitter/earnings', () => {
    it('should get sitter earnings summary', async () => {
      const response = await app.request()
        .get('/payments/sitter/earnings')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ period: 'month' })
        .expect(200);

      expect(response.body).toHaveProperty('totalEarnings');
      expect(response.body).toHaveProperty('pendingPayouts');
      expect(response.body).toHaveProperty('completedPayouts');
    });
  });

  describe('GET /payments/sitter/payouts', () => {
    it('should get sitter payout history', async () => {
      const response = await app.request()
        .get('/payments/sitter/payouts')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /payments/parent/add-payment-method', () => {
    it('should add parent payment method', async () => {
      const paymentMethodData = {
        token: 'tok_test_123',
        type: 'card',
      };

      const response = await app.request()
        .post('/payments/parent/add-payment-method')
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentMethodData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('type', 'card');
    });
  });

  describe('GET /payments/parent/payment-methods', () => {
    it('should get parent payment methods', async () => {
      const response = await app.request()
        .get('/payments/parent/payment-methods')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('DELETE /payments/parent/payment-methods/:methodId', () => {
    it('should remove parent payment method', async () => {
      const methodId = 'pm_test_123';

      await app.request()
        .delete(`/payments/parent/payment-methods/${methodId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);
    });
  });
}); 