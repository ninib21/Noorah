import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService {
  private readonly logger = new Logger(FirebaseService.name);
  private app: admin.app.App;

  constructor(private configService: ConfigService) {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    try {
      // For development, we'll use a mock configuration
      // In production, you would use actual Firebase credentials
      const isDevelopment = this.configService.get('NODE_ENV') === 'development';
      
      if (isDevelopment) {
        this.logger.warn('🔥 Firebase running in DEVELOPMENT mode with mock configuration');
        // Don't initialize Firebase in development to avoid credential issues
        return;
      }

      const firebaseConfig = {
        projectId: this.configService.get('FIREBASE_PROJECT_ID'),
        privateKey: this.configService.get('FIREBASE_PRIVATE_KEY')?.replace(/\\n/g, '\n'),
        clientEmail: this.configService.get('FIREBASE_CLIENT_EMAIL'),
      };

      if (!firebaseConfig.projectId || !firebaseConfig.privateKey || !firebaseConfig.clientEmail) {
        this.logger.warn('🔥 Firebase credentials not configured, running in mock mode');
        return;
      }

      this.app = admin.initializeApp({
        credential: admin.credential.cert(firebaseConfig),
        projectId: firebaseConfig.projectId,
      });

      this.logger.log('🔥 Firebase Admin SDK initialized successfully');
    } catch (error) {
      this.logger.error('❌ Failed to initialize Firebase Admin SDK:', error);
    }
  }

  async verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken | null> {
    try {
      if (!this.app) {
        // Mock verification for development
        this.logger.warn('🔥 Mock Firebase token verification (development mode)');
        return {
          uid: 'mock-uid-' + Math.random().toString(36).substr(2, 9),
          email: 'mock@example.com',
          email_verified: true,
          aud: 'mock-project',
          auth_time: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 3600,
          firebase: {
            identities: {},
            sign_in_provider: 'mock'
          },
          iat: Math.floor(Date.now() / 1000),
          iss: 'mock-issuer',
          sub: 'mock-uid'
        } as admin.auth.DecodedIdToken;
      }

      const decodedToken = await admin.auth().verifyIdToken(idToken);
      return decodedToken;
    } catch (error) {
      this.logger.error('❌ Failed to verify Firebase ID token:', error);
      return null;
    }
  }

  async createCustomToken(uid: string, additionalClaims?: object): Promise<string | null> {
    try {
      if (!this.app) {
        // Mock token creation for development
        this.logger.warn('🔥 Mock Firebase custom token creation (development mode)');
        return 'mock-custom-token-' + uid;
      }

      const customToken = await admin.auth().createCustomToken(uid, additionalClaims);
      return customToken;
    } catch (error) {
      this.logger.error('❌ Failed to create custom token:', error);
      return null;
    }
  }

  async getUserByEmail(email: string): Promise<admin.auth.UserRecord | null> {
    try {
      if (!this.app) {
        // Mock user lookup for development
        this.logger.warn('🔥 Mock Firebase user lookup (development mode)');
        return {
          uid: 'mock-uid-' + email.replace('@', '-').replace('.', '-'),
          email: email,
          emailVerified: true,
          disabled: false,
          metadata: {
            creationTime: new Date().toISOString(),
            lastSignInTime: new Date().toISOString(),
            lastRefreshTime: new Date().toISOString()
          },
          providerData: [],
          customClaims: {},
          tenantId: undefined,
          tokensValidAfterTime: new Date().toISOString(),
          toJSON: () => ({})
        } as unknown as admin.auth.UserRecord;
      }

      const userRecord = await admin.auth().getUserByEmail(email);
      return userRecord;
    } catch (error) {
      if ((error as any).code === 'auth/user-not-found') {
        return null;
      }
      this.logger.error('❌ Failed to get user by email:', error);
      return null;
    }
  }

  async createUser(userData: {
    email: string;
    password?: string;
    displayName?: string;
    phoneNumber?: string;
  }): Promise<admin.auth.UserRecord | null> {
    try {
      if (!this.app) {
        // Mock user creation for development
        this.logger.warn('🔥 Mock Firebase user creation (development mode)');
        return {
          uid: 'mock-uid-' + userData.email.replace('@', '-').replace('.', '-'),
          email: userData.email,
          emailVerified: false,
          disabled: false,
          displayName: userData.displayName,
          phoneNumber: userData.phoneNumber,
          metadata: {
            creationTime: new Date().toISOString(),
            lastSignInTime: undefined,
            lastRefreshTime: undefined
          },
          providerData: [],
          customClaims: {},
          tenantId: undefined,
          tokensValidAfterTime: new Date().toISOString(),
          toJSON: () => ({})
        } as unknown as admin.auth.UserRecord;
      }

      const userRecord = await admin.auth().createUser(userData);
      return userRecord;
    } catch (error) {
      this.logger.error('❌ Failed to create Firebase user:', error);
      return null;
    }
  }

  async deleteUser(uid: string): Promise<boolean> {
    try {
      if (!this.app) {
        // Mock user deletion for development
        this.logger.warn('🔥 Mock Firebase user deletion (development mode)');
        return true;
      }

      await admin.auth().deleteUser(uid);
      return true;
    } catch (error) {
      this.logger.error('❌ Failed to delete Firebase user:', error);
      return false;
    }
  }

  async setCustomUserClaims(uid: string, customClaims: object): Promise<boolean> {
    try {
      if (!this.app) {
        // Mock custom claims for development
        this.logger.warn('🔥 Mock Firebase custom claims (development mode)');
        return true;
      }

      await admin.auth().setCustomUserClaims(uid, customClaims);
      return true;
    } catch (error) {
      this.logger.error('❌ Failed to set custom user claims:', error);
      return false;
    }
  }
}

