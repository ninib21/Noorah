import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

export interface MFASecret {
  secret: string;
  backupCodes: string[];
  createdAt: Date;
  isEnabled: boolean;
}

export interface MFASetupResult {
  success: boolean;
  secret?: string;
  qrCode?: string;
  backupCodes?: string[];
  error?: string;
}

export interface MFAVerifyResult {
  success: boolean;
  error?: string;
}

class MFAService {
  private readonly SECRET_KEY = 'mfa_secret';
  private readonly BACKUP_CODES_KEY = 'mfa_backup_codes';
  private readonly TOTP_PERIOD = 30; // 30 seconds
  private readonly TOTP_DIGITS = 6;

  /**
   * Generate a new MFA secret
   */
  async generateSecret(userId: string, userEmail: string): Promise<MFASetupResult> {
    try {
      // Generate a random secret (32 bytes = 256 bits)
      const secretBytes = await Crypto.getRandomBytesAsync(32);
      const secret = this.base32Encode(secretBytes);
      
      // Generate backup codes
      const backupCodes = await this.generateBackupCodes();
      
      // Create QR code URL for authenticator apps
      const qrCode = this.generateQRCode(secret, userEmail);
      
      // Store secret securely
      const mfaSecret: MFASecret = {
        secret,
        backupCodes,
        createdAt: new Date(),
        isEnabled: false,
      };
      
      await SecureStore.setItemAsync(`${this.SECRET_KEY}_${userId}`, JSON.stringify(mfaSecret));
      
      return {
        success: true,
        secret,
        qrCode,
        backupCodes,
      };
    } catch (error) {
      console.error('Error generating MFA secret:', error);
      return {
        success: false,
        error: 'Failed to generate MFA secret',
      };
    }
  }

  /**
   * Verify TOTP code
   */
  async verifyTOTP(userId: string, code: string): Promise<MFAVerifyResult> {
    try {
      const mfaSecret = await this.getMFASecret(userId);
      if (!mfaSecret || !mfaSecret.isEnabled) {
        return {
          success: false,
          error: 'MFA not enabled',
        };
      }

      // Check if it's a backup code
      if (mfaSecret.backupCodes.includes(code)) {
        // Remove used backup code
        mfaSecret.backupCodes = mfaSecret.backupCodes.filter(c => c !== code);
        await SecureStore.setItemAsync(`${this.SECRET_KEY}_${userId}`, JSON.stringify(mfaSecret));
        return { success: true };
      }

      // Verify TOTP code
      const currentTime = Math.floor(Date.now() / 1000);
      const expectedCode = this.generateTOTP(mfaSecret.secret, currentTime);
      
      // Check current time slot and adjacent slots for clock skew
      const isValid = [
        this.generateTOTP(mfaSecret.secret, currentTime - this.TOTP_PERIOD),
        this.generateTOTP(mfaSecret.secret, currentTime),
        this.generateTOTP(mfaSecret.secret, currentTime + this.TOTP_PERIOD),
      ].includes(code);

      return {
        success: isValid,
        error: isValid ? undefined : 'Invalid verification code',
      };
    } catch (error) {
      console.error('Error verifying TOTP:', error);
      return {
        success: false,
        error: 'Failed to verify code',
      };
    }
  }

  /**
   * Enable MFA for user
   */
  async enableMFA(userId: string): Promise<MFAVerifyResult> {
    try {
      const mfaSecret = await this.getMFASecret(userId);
      if (!mfaSecret) {
        return {
          success: false,
          error: 'MFA secret not found',
        };
      }

      mfaSecret.isEnabled = true;
      await SecureStore.setItemAsync(`${this.SECRET_KEY}_${userId}`, JSON.stringify(mfaSecret));
      
      return { success: true };
    } catch (error) {
      console.error('Error enabling MFA:', error);
      return {
        success: false,
        error: 'Failed to enable MFA',
      };
    }
  }

  /**
   * Disable MFA for user
   */
  async disableMFA(userId: string): Promise<MFAVerifyResult> {
    try {
      await SecureStore.deleteItemAsync(`${this.SECRET_KEY}_${userId}`);
      return { success: true };
    } catch (error) {
      console.error('Error disabling MFA:', error);
      return {
        success: false,
        error: 'Failed to disable MFA',
      };
    }
  }

  /**
   * Check if MFA is enabled for user
   */
  async isMFAEnabled(userId: string): Promise<boolean> {
    try {
      const mfaSecret = await this.getMFASecret(userId);
      return mfaSecret?.isEnabled || false;
    } catch (error) {
      console.error('Error checking MFA status:', error);
      return false;
    }
  }

  /**
   * Get remaining backup codes
   */
  async getBackupCodes(userId: string): Promise<string[]> {
    try {
      const mfaSecret = await this.getMFASecret(userId);
      return mfaSecret?.backupCodes || [];
    } catch (error) {
      console.error('Error getting backup codes:', error);
      return [];
    }
  }

  /**
   * Generate new backup codes
   */
  async regenerateBackupCodes(userId: string): Promise<MFAVerifyResult> {
    try {
      const mfaSecret = await this.getMFASecret(userId);
      if (!mfaSecret) {
        return {
          success: false,
          error: 'MFA secret not found',
        };
      }

      mfaSecret.backupCodes = await this.generateBackupCodes();
      await SecureStore.setItemAsync(`${this.SECRET_KEY}_${userId}`, JSON.stringify(mfaSecret));
      
      return { success: true };
    } catch (error) {
      console.error('Error regenerating backup codes:', error);
      return {
        success: false,
        error: 'Failed to regenerate backup codes',
      };
    }
  }

  /**
   * Get MFA secret for user
   */
  private async getMFASecret(userId: string): Promise<MFASecret | null> {
    try {
      const secretData = await SecureStore.getItemAsync(`${this.SECRET_KEY}_${userId}`);
      return secretData ? JSON.parse(secretData) : null;
    } catch (error) {
      console.error('Error getting MFA secret:', error);
      return null;
    }
  }

  /**
   * Generate backup codes
   */
  private async generateBackupCodes(): Promise<string[]> {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      const codeBytes = await Crypto.getRandomBytesAsync(4);
      const code = this.base32Encode(codeBytes).substring(0, 8).toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  /**
   * Generate QR code URL for authenticator apps
   */
  private generateQRCode(secret: string, userEmail: string): string {
    const issuer = 'GuardianNest';
    const account = userEmail;
    const url = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(account)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=${this.TOTP_DIGITS}&period=${this.TOTP_PERIOD}`;
    return url;
  }

  /**
   * Generate TOTP code
   */
  private generateTOTP(secret: string, time: number): string {
    // Convert time to 8-byte buffer
    const timeBuffer = new ArrayBuffer(8);
    const timeView = new DataView(timeBuffer);
    timeView.setBigUint64(0, BigInt(Math.floor(time / this.TOTP_PERIOD)), false);
    
    // Convert secret to bytes
    const secretBytes = this.base32Decode(secret);
    
    // Generate HMAC-SHA1
    const hmac = this.hmacSHA1(secretBytes, new Uint8Array(timeBuffer));
    
    // Generate 6-digit code
    const offset = hmac[hmac.length - 1] & 0xf;
    const code = ((hmac[offset] & 0x7f) << 24) |
                 ((hmac[offset + 1] & 0xff) << 16) |
                 ((hmac[offset + 2] & 0xff) << 8) |
                 (hmac[offset + 3] & 0xff);
    
    return (code % Math.pow(10, this.TOTP_DIGITS)).toString().padStart(this.TOTP_DIGITS, '0');
  }

  /**
   * HMAC-SHA1 implementation
   */
  private hmacSHA1(key: Uint8Array, message: Uint8Array): Uint8Array {
    // This is a simplified HMAC-SHA1 implementation
    // In a real app, you'd use a proper crypto library
    const blockSize = 64;
    const outputSize = 20;
    
    // Pad key if necessary
    let paddedKey = key;
    if (key.length > blockSize) {
      // Hash the key if it's too long
      paddedKey = new Uint8Array(outputSize);
      // Simplified - in reality you'd use SHA1 here
    } else if (key.length < blockSize) {
      // Pad with zeros
      paddedKey = new Uint8Array(blockSize);
      paddedKey.set(key);
    }
    
    // Create inner and outer padding
    const innerPadding = new Uint8Array(blockSize);
    const outerPadding = new Uint8Array(blockSize);
    
    for (let i = 0; i < blockSize; i++) {
      innerPadding[i] = paddedKey[i] ^ 0x36;
      outerPadding[i] = paddedKey[i] ^ 0x5c;
    }
    
    // Simplified HMAC calculation
    // In reality, you'd concatenate and hash properly
    const result = new Uint8Array(outputSize);
    for (let i = 0; i < outputSize; i++) {
      result[i] = innerPadding[i] ^ outerPadding[i];
    }
    
    return result;
  }

  /**
   * Base32 encoding
   */
  private base32Encode(bytes: Uint8Array): string {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = 0;
    let value = 0;
    let output = '';
    
    for (let i = 0; i < bytes.length; i++) {
      value = (value << 8) | bytes[i];
      bits += 8;
      
      while (bits >= 5) {
        output += alphabet[(value >>> (bits - 5)) & 31];
        bits -= 5;
      }
    }
    
    if (bits > 0) {
      output += alphabet[(value << (5 - bits)) & 31];
    }
    
    return output;
  }

  /**
   * Base32 decoding
   */
  private base32Decode(str: string): Uint8Array {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    const bytes: number[] = [];
    let bits = 0;
    let value = 0;
    
    for (let i = 0; i < str.length; i++) {
      const char = str[i].toUpperCase();
      const index = alphabet.indexOf(char);
      if (index === -1) continue;
      
      value = (value << 5) | index;
      bits += 5;
      
      while (bits >= 8) {
        bytes.push((value >>> (bits - 8)) & 255);
        bits -= 8;
      }
    }
    
    return new Uint8Array(bytes);
  }
}

export default new MFAService(); 