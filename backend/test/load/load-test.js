import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 10 }, // Ramp up to 10 users
    { duration: '5m', target: 10 }, // Stay at 10 users
    { duration: '2m', target: 20 }, // Ramp up to 20 users
    { duration: '5m', target: 20 }, // Stay at 20 users
    { duration: '2m', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.1'],    // Error rate must be less than 10%
    errors: ['rate<0.1'],             // Custom error rate must be less than 10%
  },
};

// Test data
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const TEST_USER_TOKEN = __ENV.TEST_USER_TOKEN || 'test-token';

// Helper function to generate random data
function generateRandomData() {
  return {
    bookingId: `booking_${Math.random().toString(36).substr(2, 9)}`,
    paymentMethodId: `pm_${Math.random().toString(36).substr(2, 9)}`,
    amount: Math.floor(Math.random() * 10000) + 1000, // $10-$100
  };
}

// Main test function
export default function () {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${TEST_USER_TOKEN}`,
  };

  const data = generateRandomData();

  // Test 1: Create Payment Intent
  const createIntentResponse = http.post(
    `${BASE_URL}/payments/create-intent`,
    JSON.stringify({
      bookingId: data.bookingId,
      paymentMethodId: data.paymentMethodId,
    }),
    { headers }
  );

  check(createIntentResponse, {
    'create payment intent status is 201': (r) => r.status === 201,
    'create payment intent response time < 500ms': (r) => r.timings.duration < 500,
    'create payment intent has client_secret': (r) => r.json('client_secret') !== undefined,
  }) || errorRate.add(1);

  if (createIntentResponse.status === 201) {
    const paymentIntentId = createIntentResponse.json('id');
    
    // Test 2: Process Payment
    const processPaymentResponse = http.post(
      `${BASE_URL}/payments/process`,
      JSON.stringify({
        paymentIntentId: paymentIntentId,
      }),
      { headers }
    );

    check(processPaymentResponse, {
      'process payment status is 200': (r) => r.status === 200,
      'process payment response time < 500ms': (r) => r.timings.duration < 500,
    }) || errorRate.add(1);

    // Test 3: Get Payment Details
    const getPaymentResponse = http.get(
      `${BASE_URL}/payments/${paymentIntentId}`,
      { headers }
    );

    check(getPaymentResponse, {
      'get payment status is 200': (r) => r.status === 200,
      'get payment response time < 300ms': (r) => r.timings.duration < 300,
    }) || errorRate.add(1);
  }

  // Test 4: Get Payments List
  const getPaymentsResponse = http.get(
    `${BASE_URL}/payments?page=1&limit=10`,
    { headers }
  );

  check(getPaymentsResponse, {
    'get payments status is 200': (r) => r.status === 200,
    'get payments response time < 300ms': (r) => r.timings.duration < 300,
    'get payments returns array': (r) => Array.isArray(r.json()),
  }) || errorRate.add(1);

  // Test 5: Get Sitter Earnings (if user is sitter)
  const getEarningsResponse = http.get(
    `${BASE_URL}/payments/sitter/earnings?period=month`,
    { headers }
  );

  check(getEarningsResponse, {
    'get earnings status is 200 or 403': (r) => r.status === 200 || r.status === 403,
    'get earnings response time < 300ms': (r) => r.timings.duration < 300,
  }) || errorRate.add(1);

  // Test 6: Get Parent Payment Methods (if user is parent)
  const getPaymentMethodsResponse = http.get(
    `${BASE_URL}/payments/parent/payment-methods`,
    { headers }
  );

  check(getPaymentMethodsResponse, {
    'get payment methods status is 200 or 403': (r) => r.status === 200 || r.status === 403,
    'get payment methods response time < 300ms': (r) => r.timings.duration < 300,
  }) || errorRate.add(1);

  // Random sleep between requests to simulate real user behavior
  sleep(Math.random() * 3 + 1); // 1-4 seconds
}

// Setup function (runs once at the beginning)
export function setup() {
  console.log('Starting load test for payments API');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Test user token: ${TEST_USER_TOKEN ? 'Provided' : 'Not provided'}`);
}

// Teardown function (runs once at the end)
export function teardown(data) {
  console.log('Load test completed');
} 