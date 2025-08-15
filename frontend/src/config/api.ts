// API Configuration
export const API_CONFIG = {
  baseURL: __DEV__
    ? 'http://localhost:3001' // Development URL
    : 'https://api.nannyradar.com'; // Production URL
};

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGIN_OTP: '/auth/login/otp',
    VERIFY_OTP: '/auth/verify-otp',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    REFRESH_TOKEN: '/auth/refresh-token',
    PROFILE: '/auth/profile',
    LOGOUT: '/auth/logout',
    VERIFY_EMAIL: '/auth/verify-email',
    CONFIRM_EMAIL: '/auth/verify-email/confirm',
    CHANGE_PASSWORD: '/auth/change-password',
  },

  // Bookings
  BOOKINGS: {
    CREATE: '/bookings',
    GET_ALL: '/bookings',
    GET_BY_ID: (id: string) => `/bookings/${id}`,
    UPDATE: (id: string) => `/bookings/${id}`,
    DELETE: (id: string) => `/bookings/${id}`,
    CONFIRM: (id: string) => `/bookings/${id}/confirm`,
    START: (id: string) => `/bookings/${id}/start`,
    COMPLETE: (id: string) => `/bookings/${id}/complete`,
    SESSION: (id: string) => `/bookings/${id}/session`,
    CHECK_IN: (id: string) => `/bookings/${id}/session/check-in`,
    PHOTO: (id: string) => `/bookings/${id}/session/photo`,
    UPCOMING: '/bookings/upcoming',
    PAST: '/bookings/past',
  },

  // Payments
  PAYMENTS: {
    CREATE_INTENT: '/payments/create-intent',
    PROCESS: '/payments/process',
    CONFIRM: (id: string) => `/payments/${id}/confirm`,
    REFUND: (id: string) => `/payments/${id}/refund`,
    GET_ALL: '/payments',
    GET_BY_ID: (id: string) => `/payments/${id}`,
    GET_BY_BOOKING: (bookingId: string) => `/payments/booking/${bookingId}`,
    WEBHOOK: '/payments/stripe/webhook',
    
    // Sitter Connect
    SITTER_CONNECT: '/payments/sitter/connect',
    SITTER_CONNECT_STATUS: '/payments/sitter/connect/status',
    SITTER_ONBOARDING: '/payments/sitter/connect/onboarding',
    SITTER_PAYOUT: '/payments/sitter/payout',
    SITTER_EARNINGS: '/payments/sitter/earnings',
    SITTER_PAYOUTS: '/payments/sitter/payouts',
    
    // Parent Payment Methods
    PARENT_ADD_PAYMENT_METHOD: '/payments/parent/add-payment-method',
    PARENT_PAYMENT_METHODS: '/payments/parent/payment-methods',
    PARENT_REMOVE_PAYMENT_METHOD: (methodId: string) => `/payments/parent/payment-methods/${methodId}`,
  },

  // Sitters
  SITTERS: {
    SEARCH: '/sitters/search',
    GET_ALL: '/sitters',
    GET_BY_ID: (id: string) => `/sitters/${id}`,
    GET_REVIEWS: (id: string) => `/sitters/${id}/reviews`,
    GET_AVAILABILITY: (id: string) => `/sitters/${id}/availability`,
    CREATE_PROFILE: '/sitters/profile',
    UPDATE_PROFILE: '/sitters/profile',
    UPDATE_AVAILABILITY: '/sitters/availability',
    UPDATE_STATUS: '/sitters/status',
    GET_MY_PROFILE: '/sitters/profile/me',
    GET_EARNINGS: '/sitters/earnings/summary',
    GET_BOOKING_STATS: '/sitters/bookings/stats',
    REQUEST_BACKGROUND_CHECK: '/sitters/background-check/request',
    GET_BACKGROUND_CHECK_STATUS: '/sitters/background-check/status',
    UPLOAD_CERTIFICATION: '/sitters/certifications/upload',
    GET_CERTIFICATIONS: '/sitters/certifications',
    REMOVE_CERTIFICATION: (certId: string) => `/sitters/certifications/${certId}`,
    GET_NEARBY: '/sitters/nearby',
    GET_FEATURED: '/sitters/featured',
  },

  // Users
  USERS: {
    GET_PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    UPLOAD_AVATAR: '/users/avatar',
  },

  // Reviews
  REVIEWS: {
    CREATE: '/reviews',
    GET_BY_BOOKING: (bookingId: string) => `/reviews/booking/${bookingId}`,
    GET_BY_USER: (userId: string) => `/reviews/user/${userId}`,
  },
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
};

// Request Timeout (in milliseconds)
export const REQUEST_TIMEOUT = 30000; // 30 seconds

// Retry Configuration
export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
  BACKOFF_MULTIPLIER: 2,
};

// Cache Configuration
export const CACHE_CONFIG = {
  TTL: 5 * 60 * 1000, // 5 minutes
  MAX_SIZE: 100,
};

// Stripe Configuration
export const STRIPE_CONFIG = {
  PUBLISHABLE_KEY: __DEV__ 
    ? 'pk_test_your_stripe_publishable_key' 
    : 'pk_live_your_stripe_publishable_key',
  CURRENCY: 'usd',
  COUNTRY: 'US',
}; 