import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

export class EncryptionService {
  private static readonly ALGORITHM = 'AES-GCM';
  private static readonly KEY_LENGTH = 256;
  private static readonly IV_LENGTH = 12;
  private static readonly TAG_LENGTH = 16;

  /**
   * Generate a cryptographically secure random key
   */
  static async generateKey(): Promise<CryptoKey> {
    return await crypto.subtle.generateKey(
      {
        name: this.ALGORITHM,
        length: this.KEY_LENGTH,
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Generate a random initialization vector
   */
  static generateIV(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));
  }

  /**
   * Encrypt data with AES-GCM
   */
  static async encrypt(data: string, key: CryptoKey): Promise<string> {
    const iv = this.generateIV();
    const encodedData = new TextEncoder().encode(data);

    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: this.ALGORITHM,
        iv: iv,
        tagLength: this.TAG_LENGTH,
      },
      key,
      encodedData
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encryptedBuffer), iv.length);

    return btoa(String.fromCharCode(...combined));
  }

  /**
   * Decrypt data with AES-GCM
   */
  static async decrypt(encryptedData: string, key: CryptoKey): Promise<string> {
    const combined = new Uint8Array(
      atob(encryptedData).split('').map(char => char.charCodeAt(0))
    );

    const iv = combined.slice(0, this.IV_LENGTH);
    const data = combined.slice(this.IV_LENGTH);

    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: this.ALGORITHM,
        iv: iv,
        tagLength: this.TAG_LENGTH,
      },
      key,
      data
    );

    return new TextDecoder().decode(decryptedBuffer);
  }

  /**
   * Hash sensitive data (passwords, etc.)
   */
  static async hashData(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Securely store sensitive data
   */
  static async secureStore(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value, {
      requireAuthentication: true,
      authenticationPrompt: 'Authenticate to access secure data',
    });
  }

  /**
   * Retrieve securely stored data
   */
  static async secureRetrieve(key: string): Promise<string | null> {
    return await SecureStore.getItemAsync(key, {
      requireAuthentication: true,
      authenticationPrompt: 'Authenticate to access secure data',
    });
  }

  /**
   * Generate a secure session token
   */
  static async generateSessionToken(): Promise<string> {
    const randomBytes = crypto.getRandomValues(new Uint8Array(32));
    return Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Verify data integrity with HMAC
   */
  static async verifyIntegrity(data: string, signature: string, key: CryptoKey): Promise<boolean> {
    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      
      const hmacKey = await crypto.subtle.importKey(
        'raw',
        encoder.encode('integrity-verification'),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign', 'verify']
      );

      const expectedSignature = await crypto.subtle.sign(
        'HMAC',
        hmacKey,
        dataBuffer
      );

      const expectedSignatureArray = Array.from(new Uint8Array(expectedSignature));
      const expectedSignatureHex = expectedSignatureArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      return signature === expectedSignatureHex;
    } catch (error) {
      console.error('Integrity verification failed:', error);
      return false;
    }
  }

  /**
   * Wipe sensitive data from memory
   */
  static wipeData(data: Uint8Array): void {
    for (let i = 0; i < data.length; i++) {
      data[i] = 0;
    }
  }

  /**
   * Generate a secure random password
   */
  static generateSecurePassword(length: number = 16): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    const randomValues = crypto.getRandomValues(new Uint8Array(length));
    
    for (let i = 0; i < length; i++) {
      password += charset[randomValues[i] % charset.length];
    }
    
    return password;
  }
} 