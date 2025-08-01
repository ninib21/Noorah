import { Platform } from 'react-native';

export interface TranslationRequest {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
  context?: string;
}

export interface TranslationResponse {
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  confidence: number;
  alternatives?: string[];
}

export interface LanguageSupport {
  code: string;
  name: string;
  nativeName: string;
  supported: boolean;
  autoDetect: boolean;
}

export interface TranslationSettings {
  autoTranslate: boolean;
  preferredLanguages: string[];
  fallbackLanguage: string;
  translateChat: boolean;
  translateNotifications: boolean;
  preserveOriginal: boolean;
}

class TranslationService {
  private settings: TranslationSettings;
  private supportedLanguages: LanguageSupport[] = [];
  private translationCache: Map<string, TranslationResponse> = new Map();

  constructor() {
    this.settings = {
      autoTranslate: true,
      preferredLanguages: ['en', 'es', 'fr'],
      fallbackLanguage: 'en',
      translateChat: true,
      translateNotifications: true,
      preserveOriginal: true,
    };

    this.initializeSupportedLanguages();
  }

  /**
   * Initialize supported languages
   */
  private initializeSupportedLanguages(): void {
    this.supportedLanguages = [
      { code: 'en', name: 'English', nativeName: 'English', supported: true, autoDetect: true },
      { code: 'es', name: 'Spanish', nativeName: 'Español', supported: true, autoDetect: true },
      { code: 'fr', name: 'French', nativeName: 'Français', supported: true, autoDetect: true },
      { code: 'de', name: 'German', nativeName: 'Deutsch', supported: true, autoDetect: true },
      { code: 'it', name: 'Italian', nativeName: 'Italiano', supported: true, autoDetect: true },
      { code: 'pt', name: 'Portuguese', nativeName: 'Português', supported: true, autoDetect: true },
      { code: 'ru', name: 'Russian', nativeName: 'Русский', supported: true, autoDetect: true },
      { code: 'zh', name: 'Chinese', nativeName: '中文', supported: true, autoDetect: true },
      { code: 'ja', name: 'Japanese', nativeName: '日本語', supported: true, autoDetect: true },
      { code: 'ko', name: 'Korean', nativeName: '한국어', supported: true, autoDetect: true },
      { code: 'ar', name: 'Arabic', nativeName: 'العربية', supported: true, autoDetect: true },
      { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', supported: true, autoDetect: true },
    ];
  }

  /**
   * Translate text
   */
  async translate(request: TranslationRequest): Promise<TranslationResponse> {
    try {
      // Check cache first
      const cacheKey = this.generateCacheKey(request);
      const cached = this.translationCache.get(cacheKey);
      if (cached) {
        return cached;
      }

      // Validate languages
      if (!this.isLanguageSupported(request.sourceLanguage)) {
        throw new Error(`Source language ${request.sourceLanguage} not supported`);
      }
      if (!this.isLanguageSupported(request.targetLanguage)) {
        throw new Error(`Target language ${request.targetLanguage} not supported`);
      }

      // Auto-detect language if needed
      let sourceLang = request.sourceLanguage;
      if (sourceLang === 'auto') {
        sourceLang = await this.detectLanguage(request.text);
      }

      // Perform translation
      const translation = await this.performTranslation(request.text, sourceLang, request.targetLanguage);
      
      // Cache the result
      this.translationCache.set(cacheKey, translation);
      
      return translation;
    } catch (error) {
      console.error('Translation error:', error);
      throw error;
    }
  }

  /**
   * Auto-detect language
   */
  async detectLanguage(text: string): Promise<string> {
    try {
      // In a real implementation, this would use a language detection API
      // For now, we'll use a simple heuristic approach
      
      const languagePatterns = {
        'es': /[áéíóúñ¿¡]/i,
        'fr': /[àâäéèêëïîôöùûüÿç]/i,
        'de': /[äöüß]/i,
        'it': /[àèéìíîòóù]/i,
        'pt': /[ãõâêîôûç]/i,
        'ru': /[а-яё]/i,
        'zh': /[\u4e00-\u9fff]/i,
        'ja': /[\u3040-\u309f\u30a0-\u30ff]/i,
        'ko': /[\uac00-\ud7af]/i,
        'ar': /[\u0600-\u06ff]/i,
        'hi': /[\u0900-\u097f]/i,
      };

      for (const [lang, pattern] of Object.entries(languagePatterns)) {
        if (pattern.test(text)) {
          return lang;
        }
      }

      // Default to English if no pattern matches
      return 'en';
    } catch (error) {
      console.error('Language detection error:', error);
      return 'en';
    }
  }

  /**
   * Perform actual translation
   */
  private async performTranslation(text: string, sourceLang: string, targetLang: string): Promise<TranslationResponse> {
    try {
      // In a real implementation, this would call a translation API like Google Translate
      // For now, we'll simulate translations with mock data
      
      const mockTranslations: { [key: string]: { [key: string]: string } } = {
        'en': {
          'es': 'Hola, ¿cómo estás?',
          'fr': 'Bonjour, comment allez-vous?',
          'de': 'Hallo, wie geht es dir?',
        },
        'es': {
          'en': 'Hello, how are you?',
          'fr': 'Bonjour, comment allez-vous?',
        },
        'fr': {
          'en': 'Hello, how are you?',
          'es': 'Hola, ¿cómo estás?',
        },
      };

      let translatedText = text;
      let confidence = 0.95;

      if (mockTranslations[sourceLang] && mockTranslations[sourceLang][targetLang]) {
        translatedText = mockTranslations[sourceLang][targetLang];
        confidence = 0.98;
      } else if (sourceLang !== targetLang) {
        // Fallback: add language indicator
        translatedText = `[${targetLang.toUpperCase()}] ${text}`;
        confidence = 0.5;
      }

      return {
        originalText: text,
        translatedText,
        sourceLanguage: sourceLang,
        targetLanguage: targetLang,
        confidence,
        alternatives: [translatedText],
      };
    } catch (error) {
      console.error('Translation API error:', error);
      throw new Error('Translation service unavailable');
    }
  }

  /**
   * Translate chat message
   */
  async translateChatMessage(message: string, userLanguage: string, targetLanguage: string): Promise<TranslationResponse> {
    try {
      const request: TranslationRequest = {
        text: message,
        sourceLanguage: 'auto',
        targetLanguage,
        context: 'chat',
      };

      return await this.translate(request);
    } catch (error) {
      console.error('Chat translation error:', error);
      throw error;
    }
  }

  /**
   * Translate notification
   */
  async translateNotification(notification: string, userLanguage: string): Promise<string> {
    try {
      if (!this.settings.translateNotifications) {
        return notification;
      }

      const request: TranslationRequest = {
        text: notification,
        sourceLanguage: 'en', // Notifications are typically in English
        targetLanguage: userLanguage,
        context: 'notification',
      };

      const response = await this.translate(request);
      return response.translatedText;
    } catch (error) {
      console.error('Notification translation error:', error);
      return notification; // Return original if translation fails
    }
  }

  /**
   * Auto-translate based on user preferences
   */
  async autoTranslate(text: string, userLanguage: string): Promise<TranslationResponse | null> {
    try {
      if (!this.settings.autoTranslate) {
        return null;
      }

      const detectedLang = await this.detectLanguage(text);
      if (detectedLang === userLanguage) {
        return null; // No translation needed
      }

      const request: TranslationRequest = {
        text,
        sourceLanguage: detectedLang,
        targetLanguage: userLanguage,
        context: 'auto',
      };

      return await this.translate(request);
    } catch (error) {
      console.error('Auto-translation error:', error);
      return null;
    }
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages(): LanguageSupport[] {
    return this.supportedLanguages.filter(lang => lang.supported);
  }

  /**
   * Check if language is supported
   */
  isLanguageSupported(languageCode: string): boolean {
    return this.supportedLanguages.some(lang => lang.code === languageCode && lang.supported);
  }

  /**
   * Get language name by code
   */
  getLanguageName(code: string): string {
    const language = this.supportedLanguages.find(lang => lang.code === code);
    return language ? language.name : code;
  }

  /**
   * Get native language name by code
   */
  getNativeLanguageName(code: string): string {
    const language = this.supportedLanguages.find(lang => lang.code === code);
    return language ? language.nativeName : code;
  }

  /**
   * Update translation settings
   */
  updateSettings(newSettings: Partial<TranslationSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }

  /**
   * Get current settings
   */
  getSettings(): TranslationSettings {
    return { ...this.settings };
  }

  /**
   * Clear translation cache
   */
  clearCache(): void {
    this.translationCache.clear();
  }

  /**
   * Generate cache key for translation request
   */
  private generateCacheKey(request: TranslationRequest): string {
    return `${request.text}_${request.sourceLanguage}_${request.targetLanguage}_${request.context || 'default'}`;
  }

  /**
   * Get translation statistics
   */
  getTranslationStats(): {
    cacheSize: number;
    supportedLanguages: number;
    autoTranslateEnabled: boolean;
  } {
    return {
      cacheSize: this.translationCache.size,
      supportedLanguages: this.supportedLanguages.filter(lang => lang.supported).length,
      autoTranslateEnabled: this.settings.autoTranslate,
    };
  }

  /**
   * Batch translate multiple texts
   */
  async batchTranslate(requests: TranslationRequest[]): Promise<TranslationResponse[]> {
    try {
      const results: TranslationResponse[] = [];
      
      for (const request of requests) {
        try {
          const result = await this.translate(request);
          results.push(result);
        } catch (error) {
          console.error(`Batch translation error for request:`, request, error);
          // Add fallback response
          results.push({
            originalText: request.text,
            translatedText: request.text,
            sourceLanguage: request.sourceLanguage,
            targetLanguage: request.targetLanguage,
            confidence: 0,
          });
        }
      }
      
      return results;
    } catch (error) {
      console.error('Batch translation error:', error);
      throw error;
    }
  }

  /**
   * Translate emergency messages with high priority
   */
  async translateEmergencyMessage(message: string, targetLanguage: string): Promise<string> {
    try {
      const request: TranslationRequest = {
        text: message,
        sourceLanguage: 'en',
        targetLanguage,
        context: 'emergency',
      };

      const response = await this.translate(request);
      return response.translatedText;
    } catch (error) {
      console.error('Emergency message translation error:', error);
      return message; // Return original message if translation fails
    }
  }
}

export default new TranslationService(); 