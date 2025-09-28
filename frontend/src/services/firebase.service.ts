import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  PhoneAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInWithCredential,
} from 'firebase/auth';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'your-api-key',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'your-auth-domain',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'your-project-id',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'your-storage-bucket',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 'your-messaging-sender-id',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || 'your-app-id',
};

export interface AuthUser {
  id: string;
  email: string | null;
  phone: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  phoneNumber: string | null;
  isAnonymous: boolean;
  metadata: {
    creationTime: string | null;
    lastSignInTime: string | null;
  };
}

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
  user?: AuthUser;
}

class FirebaseService {
  private app: FirebaseApp;
  private auth: Auth;
  private recaptchaVerifier: RecaptchaVerifier | null = null;

  constructor() {
    this.app = initializeApp(firebaseConfig);
    this.auth = getAuth(this.app);
    this.initializeRecaptcha();
  }

  /**
   * Initialize reCAPTCHA verifier
   */
  private initializeRecaptcha(): void {
    try {
      // For web, we would use a container ID
      // For React Native, we'll handle this differently
      console.log('reCAPTCHA initialized for React Native');
    } catch (error) {
      console.error('Error initializing reCAPTCHA:', error);
    }
  }

  /**
   * Convert Firebase user to our AuthUser interface
   */
  private convertFirebaseUser(firebaseUser: FirebaseUser): AuthUser {
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email,
      phone: firebaseUser.phoneNumber,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      emailVerified: firebaseUser.emailVerified,
      phoneNumber: firebaseUser.phoneNumber,
      isAnonymous: firebaseUser.isAnonymous,
      metadata: {
        creationTime: firebaseUser.metadata.creationTime || null,
        lastSignInTime: firebaseUser.metadata.lastSignInTime || null,
      },
    };
  }

  /**
   * Sign in with email and password
   */
  async signInWithEmail(email: string, password: string): Promise<AuthUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const user = this.convertFirebaseUser(userCredential.user);
      
      // Store auth token securely
      const token = await userCredential.user.getIdToken();
      await SecureStore.setItemAsync('auth_token', token);
      
      return user;
    } catch (error: any) {
      console.error('Email sign in error:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  /**
   * Create user with email and password
   */
  async createUserWithEmail(email: string, password: string): Promise<AuthUser> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = this.convertFirebaseUser(userCredential.user);
      
      // Store auth token securely
      const token = await userCredential.user.getIdToken();
      await SecureStore.setItemAsync('auth_token', token);
      
      return user;
    } catch (error: any) {
      console.error('Email sign up error:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, email);
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  /**
   * Sign in with phone number (OTP)
   */
  async signInWithPhone(phoneNumber: string): Promise<string> {
    try {
      // For React Native, we need to handle phone auth differently
      // This is a placeholder implementation
      console.log(`Sending OTP to ${phoneNumber}`);
      
      // In a real implementation, you would:
      // 1. Use Firebase Phone Auth with React Native
      // 2. Handle the verification code
      // 3. Return the verification ID
      
      return 'mock_verification_id';
    } catch (error: any) {
      console.error('Phone sign in error:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  /**
   * Verify phone OTP
   */
  async verifyPhoneOTP(verificationId: string, code: string): Promise<AuthUser> {
    try {
      // This is a placeholder implementation
      // In a real implementation, you would verify the OTP with Firebase
      console.log(`Verifying OTP: ${code} for ID: ${verificationId}`);
      
      // Mock successful verification
      const mockUser: AuthUser = {
        id: 'mock_user_id',
        email: null,
        phone: '+1234567890',
        displayName: null,
        photoURL: null,
        emailVerified: false,
        phoneNumber: '+1234567890',
        isAnonymous: false,
        metadata: {
          creationTime: new Date().toISOString(),
          lastSignInTime: new Date().toISOString(),
        },
      };
      
      // Store mock token
      await SecureStore.setItemAsync('auth_token', 'mock_token');
      
      return mockUser;
    } catch (error: any) {
      console.error('OTP verification error:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    try {
      await signOut(this.auth);
      await SecureStore.deleteItemAsync('auth_token');
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  /**
   * Get current user
   */
  getCurrentUser(): AuthUser | null {
    const firebaseUser = this.auth.currentUser;
    return firebaseUser ? this.convertFirebaseUser(firebaseUser) : null;
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    return onAuthStateChanged(this.auth, (firebaseUser) => {
      const user = firebaseUser ? this.convertFirebaseUser(firebaseUser) : null;
      callback(user);
    });
  }

  /**
   * Get auth token
   */
  async getAuthToken(): Promise<string | null> {
    try {
      const currentUser = this.auth.currentUser;
      if (currentUser) {
        return await currentUser.getIdToken();
      }
      return await SecureStore.getItemAsync('auth_token');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  /**
   * Check if biometric authentication is available
   */
  async isBiometricAvailable(): Promise<boolean> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      return hasHardware && isEnrolled;
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return false;
    }
  }

  /**
   * Get supported biometric types
   */
  async getSupportedBiometricTypes(): Promise<LocalAuthentication.AuthenticationType[]> {
    try {
      return await LocalAuthentication.supportedAuthenticationTypesAsync();
    } catch (error) {
      console.error('Error getting supported biometric types:', error);
      return [];
    }
  }

  /**
   * Authenticate with biometrics
   */
  async authenticateWithBiometrics(): Promise<BiometricAuthResult> {
    try {
      const isAvailable = await this.isBiometricAvailable();
      if (!isAvailable) {
        return {
          success: false,
          error: 'Biometric authentication not available',
        };
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access Noorah',
        fallbackLabel: 'Use passcode',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (result.success) {
        // Get the stored user from secure storage
        const userData = await SecureStore.getItemAsync('biometric_user');
        if (userData) {
          const user: AuthUser = JSON.parse(userData);
          return {
            success: true,
            user,
          };
        } else {
          return {
            success: false,
            error: 'No user data found for biometric authentication',
          };
        }
      } else {
        return {
          success: false,
          error: result.error || 'Biometric authentication failed',
        };
      }
    } catch (error: any) {
      console.error('Biometric authentication error:', error);
      return {
        success: false,
        error: error.message || 'Biometric authentication failed',
      };
    }
  }

  /**
   * Enable biometric authentication for current user
   */
  async enableBiometricAuth(user: AuthUser): Promise<boolean> {
    try {
      const isAvailable = await this.isBiometricAvailable();
      if (!isAvailable) {
        throw new Error('Biometric authentication not available');
      }

      // Store user data securely for biometric authentication
      await SecureStore.setItemAsync('biometric_user', JSON.stringify(user));
      await SecureStore.setItemAsync('biometric_enabled', 'true');
      
      return true;
    } catch (error) {
      console.error('Error enabling biometric auth:', error);
      return false;
    }
  }

  /**
   * Disable biometric authentication
   */
  async disableBiometricAuth(): Promise<boolean> {
    try {
      await SecureStore.deleteItemAsync('biometric_user');
      await SecureStore.deleteItemAsync('biometric_enabled');
      return true;
    } catch (error) {
      console.error('Error disabling biometric auth:', error);
      return false;
    }
  }

  /**
   * Check if biometric authentication is enabled
   */
  async isBiometricEnabled(): Promise<boolean> {
    try {
      const enabled = await SecureStore.getItemAsync('biometric_enabled');
      return enabled === 'true';
    } catch (error) {
      console.error('Error checking biometric enabled status:', error);
      return false;
    }
  }

  /**
   * Get error message from Firebase error code
   */
  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No account found with this email address';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters';
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection';
      case 'auth/invalid-verification-code':
        return 'Invalid verification code';
      case 'auth/invalid-verification-id':
        return 'Invalid verification ID';
      default:
        return 'Authentication failed. Please try again';
    }
  }
}

export default new FirebaseService(); 
