// Test setup file for Noorah frontend
import 'react-native-gesture-handler/jestSetup';

// Mock environment variables for testing
process.env.EXPO_PUBLIC_API_URL = 'http://localhost:3001';
process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY = 'test_key';

// Mock react-native modules (path may differ across RN versions)
try {
  // RN <= 0.71 path
  jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
} catch {}

// Mock Expo modules
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  watchPositionAsync: jest.fn(),
  Accuracy: {
    BestForNavigation: 6,
  },
}));

jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
}));

// Mock expo-camera even if not installed in deps
jest.mock(
  'expo-camera',
  () => ({
    Camera: {
      requestCameraPermissionsAsync: jest.fn(),
      getCameraPermissionsAsync: jest.fn(),
    },
  }),
  { virtual: true }
);

// Mock Firebase
jest.mock('@react-native-firebase/app', () => ({}), { virtual: true });
jest.mock('@react-native-firebase/auth', () => ({}), { virtual: true });

// Global test setup
beforeAll(async () => {
  // Setup test environment
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

