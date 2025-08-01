import { Platform } from 'react-native';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

export interface EncryptionKey {
  id: string;
  key: string;
  algorithm: 'AES-256-GCM';
  createdAt: Date;
  expiresAt?: Date;
  isActive: boolean;
}

export interface EncryptedData {
  id: string;
  encryptedContent: string;
  iv: string;
  authTag: string;
  keyId: string;
  algorithm: string;
  createdAt: Date;
  metadata?: any;
}

export interface EncryptionSettings {
  algorithm: 'AES-256-GCM';
  keyRotationDays: number;
  autoEncrypt: boolean;
  encryptChat: boolean;
  encryptPhotos: boolean;
  encryptDocuments: boolean;
  encryptLocation: boolean;
  encryptPersonalInfo: boolean;
}

class EncryptionService {
  private keys: EncryptionKey[] = [];
  private settings: EncryptionSettings;
  private masterKey: string | null = null;

  constructor() {
    this.settings = {
      algorithm: 'AES-256-GCM',
      keyRotationDays: 30,
      autoEncrypt: true,
      encryptChat: true,
      encryptPhotos: true,
      encryptDocuments: true,
      encryptLocation: true,
      encryptPersonalInfo: true,
    };

    this.initialize();
  }

  /**
   * Initialize encryption service
   */
  private async initialize(): Promise<void> {
    try {
      // Load or generate master key
      await this.loadMasterKey();
      
      // Load encryption keys
      await this.loadEncryptionKeys();
      
      // Generate new key if none exist
      if (this.keys.length === 0) {
        await this.generateNewKey();
      }

      console.log('Encryption service initialized');
    } catch (error) {
      console.error('Failed to initialize encryption service:', error);
      throw error;
    }
  }

  /**
   * Load or generate master key
   */
  private async loadMasterKey(): Promise<void> {
    try {
      let masterKey = await SecureStore.getItemAsync('encryption_master_key');
      
      if (!masterKey) {
        // Generate new master key
        masterKey = await this.generateMasterKey();
        await SecureStore.setItemAsync('encryption_master_key', masterKey);
      }
      
      this.masterKey = masterKey;
    } catch (error) {
      console.error('Error loading master key:', error);
      throw error;
    }
  }

  /**
   * Generate master key
   */
  private async generateMasterKey(): Promise<string> {
    try {
      const randomBytes = await Crypto.getRandomBytesAsync(32);
      return Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      console.error('Error generating master key:', error);
      throw error;
    }
  }

  /**
   * Load encryption keys from secure storage
   */
  private async loadEncryptionKeys(): Promise<void> {
    try {
      const keysData = await SecureStore.getItemAsync('encryption_keys');
      if (keysData) {
        this.keys = JSON.parse(keysData);
      }
    } catch (error) {
      console.error('Error loading encryption keys:', error);
      this.keys = [];
    }
  }

  /**
   * Save encryption keys to secure storage
   */
  private async saveEncryptionKeys(): Promise<void> {
    try {
      await SecureStore.setItemAsync('encryption_keys', JSON.stringify(this.keys));
    } catch (error) {
      console.error('Error saving encryption keys:', error);
      throw error;
    }
  }

  /**
   * Generate new encryption key
   */
  async generateNewKey(): Promise<EncryptionKey> {
    try {
      const keyId = `key_${Date.now()}`;
      const keyBytes = await Crypto.getRandomBytesAsync(32);
      const key = Array.from(keyBytes, byte => byte.toString(16).padStart(2, '0')).join('');
      
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + this.settings.keyRotationDays);

      const newKey: EncryptionKey = {
        id: keyId,
        key,
        algorithm: 'AES-256-GCM',
        createdAt: new Date(),
        expiresAt,
        isActive: true,
      };

      // Deactivate old keys
      this.keys.forEach(k => k.isActive = false);
      
      this.keys.push(newKey);
      await this.saveEncryptionKeys();

      console.log('New encryption key generated:', keyId);
      return newKey;
    } catch (error) {
      console.error('Error generating new key:', error);
      throw error;
    }
  }

  /**
   * Get active encryption key
   */
  private getActiveKey(): EncryptionKey {
    const activeKey = this.keys.find(k => k.isActive);
    if (!activeKey) {
      throw new Error('No active encryption key found');
    }
    return activeKey;
  }

  /**
   * Encrypt data
   */
  async encrypt(data: string, metadata?: any): Promise<EncryptedData> {
    try {
      const activeKey = this.getActiveKey();
      
      // Generate initialization vector
      const ivBytes = await Crypto.getRandomBytesAsync(12);
      const iv = Array.from(ivBytes, byte => byte.toString(16).padStart(2, '0')).join('');

      // Convert key and IV to Uint8Array
      const keyArray = new Uint8Array(activeKey.key.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
      const ivArray = new Uint8Array(iv.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));

      // Encrypt data using Web Crypto API
      const encryptedContent = await this.encryptWithWebCrypto(data, keyArray, ivArray);

      const encryptedData: EncryptedData = {
        id: `enc_${Date.now()}`,
        encryptedContent,
        iv,
        authTag: '', // GCM mode doesn't use separate auth tag
        keyId: activeKey.id,
        algorithm: activeKey.algorithm,
        createdAt: new Date(),
        metadata,
      };

      return encryptedData;
    } catch (error) {
      console.error('Encryption error:', error);
      throw error;
    }
  }

  /**
   * Encrypt using Web Crypto API
   */
  private async encryptWithWebCrypto(data: string, key: Uint8Array, iv: Uint8Array): Promise<string> {
    try {
      // Import key
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        key,
        { name: 'AES-GCM' },
        false,
        ['encrypt']
      );

      // Encrypt data
      const dataBuffer = new TextEncoder().encode(data);
      const encryptedBuffer = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv,
        },
        cryptoKey,
        dataBuffer
      );

      // Convert to hex string
      return Array.from(new Uint8Array(encryptedBuffer), byte => byte.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      console.error('Web Crypto encryption error:', error);
      throw error;
    }
  }

  /**
   * Decrypt data
   */
  async decrypt(encryptedData: EncryptedData): Promise<string> {
    try {
      // Find the key used for encryption
      const key = this.keys.find(k => k.id === encryptedData.keyId);
      if (!key) {
        throw new Error('Encryption key not found');
      }

      // Convert key and IV to Uint8Array
      const keyArray = new Uint8Array(key.key.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
      const ivArray = new Uint8Array(encryptedData.iv.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));

      // Decrypt data using Web Crypto API
      const decryptedData = await this.decryptWithWebCrypto(encryptedData.encryptedContent, keyArray, ivArray);

      return decryptedData;
    } catch (error) {
      console.error('Decryption error:', error);
      throw error;
    }
  }

  /**
   * Decrypt using Web Crypto API
   */
  private async decryptWithWebCrypto(encryptedContent: string, key: Uint8Array, iv: Uint8Array): Promise<string> {
    try {
      // Import key
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        key,
        { name: 'AES-GCM' },
        false,
        ['decrypt']
      );

      // Convert encrypted content to ArrayBuffer
      const encryptedBuffer = new Uint8Array(encryptedContent.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));

      // Decrypt data
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv,
        },
        cryptoKey,
        encryptedBuffer
      );

      // Convert to string
      return new TextDecoder().decode(decryptedBuffer);
    } catch (error) {
      console.error('Web Crypto decryption error:', error);
      throw error;
    }
  }

  /**
   * Encrypt chat message
   */
  async encryptChatMessage(message: string, chatId: string): Promise<EncryptedData> {
    if (!this.settings.encryptChat) {
      throw new Error('Chat encryption is disabled');
    }

    return await this.encrypt(message, {
      type: 'chat_message',
      chatId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Encrypt photo data
   */
  async encryptPhoto(photoData: string, photoId: string): Promise<EncryptedData> {
    if (!this.settings.encryptPhotos) {
      throw new Error('Photo encryption is disabled');
    }

    return await this.encrypt(photoData, {
      type: 'photo',
      photoId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Encrypt document
   */
  async encryptDocument(documentData: string, documentId: string): Promise<EncryptedData> {
    if (!this.settings.encryptDocuments) {
      throw new Error('Document encryption is disabled');
    }

    return await this.encrypt(documentData, {
      type: 'document',
      documentId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Encrypt location data
   */
  async encryptLocation(locationData: string, userId: string): Promise<EncryptedData> {
    if (!this.settings.encryptLocation) {
      throw new Error('Location encryption is disabled');
    }

    return await this.encrypt(locationData, {
      type: 'location',
      userId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Encrypt personal information
   */
  async encryptPersonalInfo(personalData: string, userId: string): Promise<EncryptedData> {
    if (!this.settings.encryptPersonalInfo) {
      throw new Error('Personal info encryption is disabled');
    }

    return await this.encrypt(personalData, {
      type: 'personal_info',
      userId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Batch encrypt multiple items
   */
  async batchEncrypt(items: Array<{ data: string; type: string; id: string }>): Promise<EncryptedData[]> {
    try {
      const results: EncryptedData[] = [];
      
      for (const item of items) {
        let encryptedData: EncryptedData;
        
        switch (item.type) {
          case 'chat':
            encryptedData = await this.encryptChatMessage(item.data, item.id);
            break;
          case 'photo':
            encryptedData = await this.encryptPhoto(item.data, item.id);
            break;
          case 'document':
            encryptedData = await this.encryptDocument(item.data, item.id);
            break;
          case 'location':
            encryptedData = await this.encryptLocation(item.data, item.id);
            break;
          case 'personal_info':
            encryptedData = await this.encryptPersonalInfo(item.data, item.id);
            break;
          default:
            encryptedData = await this.encrypt(item.data, { type: item.type, id: item.id });
        }
        
        results.push(encryptedData);
      }
      
      return results;
    } catch (error) {
      console.error('Batch encryption error:', error);
      throw error;
    }
  }

  /**
   * Batch decrypt multiple items
   */
  async batchDecrypt(encryptedItems: EncryptedData[]): Promise<string[]> {
    try {
      const results: string[] = [];
      
      for (const item of encryptedItems) {
        const decryptedData = await this.decrypt(item);
        results.push(decryptedData);
      }
      
      return results;
    } catch (error) {
      console.error('Batch decryption error:', error);
      throw error;
    }
  }

  /**
   * Rotate encryption keys
   */
  async rotateKeys(): Promise<void> {
    try {
      // Generate new key
      await this.generateNewKey();
      
      // Clean up expired keys
      await this.cleanupExpiredKeys();
      
      console.log('Encryption keys rotated successfully');
    } catch (error) {
      console.error('Error rotating keys:', error);
      throw error;
    }
  }

  /**
   * Clean up expired keys
   */
  private async cleanupExpiredKeys(): Promise<void> {
    const now = new Date();
    this.keys = this.keys.filter(key => {
      if (key.expiresAt && key.expiresAt < now && !key.isActive) {
        return false; // Remove expired inactive keys
      }
      return true;
    });
    
    await this.saveEncryptionKeys();
  }

  /**
   * Update encryption settings
   */
  updateSettings(newSettings: Partial<EncryptionSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }

  /**
   * Get encryption settings
   */
  getSettings(): EncryptionSettings {
    return { ...this.settings };
  }

  /**
   * Get encryption keys (for admin purposes)
   */
  getKeys(): EncryptionKey[] {
    return this.keys.map(key => ({
      ...key,
      key: key.key.substring(0, 8) + '...', // Only show first 8 characters for security
    }));
  }

  /**
   * Get encryption statistics
   */
  getEncryptionStats(): {
    totalKeys: number;
    activeKeys: number;
    expiredKeys: number;
    algorithm: string;
    autoEncrypt: boolean;
  } {
    const now = new Date();
    const expiredKeys = this.keys.filter(key => key.expiresAt && key.expiresAt < now).length;
    
    return {
      totalKeys: this.keys.length,
      activeKeys: this.keys.filter(k => k.isActive).length,
      expiredKeys,
      algorithm: this.settings.algorithm,
      autoEncrypt: this.settings.autoEncrypt,
    };
  }

  /**
   * Verify encryption integrity
   */
  async verifyIntegrity(): Promise<boolean> {
    try {
      const testData = 'test_encryption_integrity';
      const encrypted = await this.encrypt(testData);
      const decrypted = await this.decrypt(encrypted);
      
      return decrypted === testData;
    } catch (error) {
      console.error('Encryption integrity check failed:', error);
      return false;
    }
  }
}

export default new EncryptionService(); 