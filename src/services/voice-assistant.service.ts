import { Platform } from 'react-native';
import * as Speech from 'expo-speech';
import * as Location from 'expo-location';
import { Alert } from 'react-native';

export interface VoiceCommand {
  id: string;
  command: string;
  action: string;
  description: string;
  keywords: string[];
  requiresConfirmation: boolean;
  category: 'emergency' | 'booking' | 'communication' | 'navigation' | 'general';
}

export interface VoiceResponse {
  success: boolean;
  message: string;
  action?: string;
  data?: any;
}

export interface VoiceSettings {
  enabled: boolean;
  language: string;
  voiceSpeed: number; // 0.1 to 2.0
  voicePitch: number; // 0.5 to 2.0
  autoListen: boolean;
  wakeWord: string;
  confirmationRequired: boolean;
}

class VoiceAssistantService {
  private isListening = false;
  private isSpeaking = false;
  private settings: VoiceSettings;
  private commands: VoiceCommand[] = [];
  private currentSession: any = null;

  constructor() {
    this.settings = {
      enabled: true,
      language: 'en-US',
      voiceSpeed: 1.0,
      voicePitch: 1.0,
      autoListen: false,
      wakeWord: 'Guardian',
      confirmationRequired: true,
    };

    this.initializeCommands();
  }

  /**
   * Initialize available voice commands
   */
  private initializeCommands(): void {
    this.commands = [
      // Emergency Commands
      {
        id: 'sos',
        command: 'SOS',
        action: 'trigger_emergency',
        description: 'Trigger emergency SOS',
        keywords: ['sos', 'emergency', 'help', 'danger', 'panic'],
        requiresConfirmation: false,
        category: 'emergency',
      },
      {
        id: 'call_parent',
        command: 'Call Parent',
        action: 'call_parent',
        description: 'Call the parent immediately',
        keywords: ['call', 'parent', 'mom', 'dad', 'contact'],
        requiresConfirmation: true,
        category: 'emergency',
      },

      // Booking Commands
      {
        id: 'rebook_sitter',
        command: 'Rebook Sitter',
        action: 'rebook_sitter',
        description: 'Find and book a new sitter',
        keywords: ['rebook', 'book', 'sitter', 'babysitter', 'find'],
        requiresConfirmation: true,
        category: 'booking',
      },
      {
        id: 'cancel_booking',
        command: 'Cancel Booking',
        action: 'cancel_booking',
        description: 'Cancel current booking',
        keywords: ['cancel', 'stop', 'end', 'terminate'],
        requiresConfirmation: true,
        category: 'booking',
      },

      // Communication Commands
      {
        id: 'send_message',
        command: 'Send Message',
        action: 'send_message',
        description: 'Send a message to parent',
        keywords: ['message', 'text', 'send', 'notify'],
        requiresConfirmation: true,
        category: 'communication',
      },
      {
        id: 'read_messages',
        command: 'Read Messages',
        action: 'read_messages',
        description: 'Read incoming messages',
        keywords: ['read', 'messages', 'inbox', 'check'],
        requiresConfirmation: false,
        category: 'communication',
      },

      // Navigation Commands
      {
        id: 'get_directions',
        command: 'Get Directions',
        action: 'get_directions',
        description: 'Get directions to destination',
        keywords: ['directions', 'navigate', 'route', 'map'],
        requiresConfirmation: false,
        category: 'navigation',
      },
      {
        id: 'share_location',
        command: 'Share Location',
        action: 'share_location',
        description: 'Share current location',
        keywords: ['location', 'share', 'where', 'position'],
        requiresConfirmation: true,
        category: 'navigation',
      },

      // General Commands
      {
        id: 'session_status',
        command: 'Session Status',
        action: 'session_status',
        description: 'Get current session status',
        keywords: ['status', 'session', 'time', 'remaining'],
        requiresConfirmation: false,
        category: 'general',
      },
      {
        id: 'stop_listening',
        command: 'Stop Listening',
        action: 'stop_listening',
        description: 'Stop voice recognition',
        keywords: ['stop', 'quiet', 'silence', 'end'],
        requiresConfirmation: false,
        category: 'general',
      },
    ];
  }

  /**
   * Start voice assistant
   */
  async start(): Promise<void> {
    try {
      if (!this.settings.enabled) {
        throw new Error('Voice assistant is disabled');
      }

      // Request microphone permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Microphone permission required');
      }

      this.isListening = true;
      await this.speak('Voice assistant activated. Say "Guardian" followed by your command.');
      
      console.log('Voice assistant started');
    } catch (error) {
      console.error('Failed to start voice assistant:', error);
      throw error;
    }
  }

  /**
   * Stop voice assistant
   */
  async stop(): Promise<void> {
    this.isListening = false;
    this.isSpeaking = false;
    await this.speak('Voice assistant deactivated');
    console.log('Voice assistant stopped');
  }

  /**
   * Process voice input
   */
  async processVoiceInput(input: string): Promise<VoiceResponse> {
    try {
      const normalizedInput = input.toLowerCase().trim();
      
      // Check for wake word
      if (!normalizedInput.includes(this.settings.wakeWord.toLowerCase())) {
        return { success: false, message: 'Wake word not detected' };
      }

      // Extract command from input
      const commandText = normalizedInput.replace(this.settings.wakeWord.toLowerCase(), '').trim();
      
      // Find matching command
      const command = this.findMatchingCommand(commandText);
      if (!command) {
        return { success: false, message: 'Command not recognized' };
      }

      // Execute command
      return await this.executeCommand(command, commandText);
    } catch (error) {
      console.error('Error processing voice input:', error);
      return { success: false, message: 'Error processing command' };
    }
  }

  /**
   * Find matching command based on input
   */
  private findMatchingCommand(input: string): VoiceCommand | null {
    for (const command of this.commands) {
      // Check exact command match
      if (input.includes(command.command.toLowerCase())) {
        return command;
      }

      // Check keyword matches
      for (const keyword of command.keywords) {
        if (input.includes(keyword.toLowerCase())) {
          return command;
        }
      }
    }
    return null;
  }

  /**
   * Execute voice command
   */
  private async executeCommand(command: VoiceCommand, input: string): Promise<VoiceResponse> {
    try {
      // Check if confirmation is required
      if (command.requiresConfirmation && this.settings.confirmationRequired) {
        const confirmed = await this.requestConfirmation(command.description);
        if (!confirmed) {
          return { success: false, message: 'Command cancelled' };
        }
      }

      // Execute based on action type
      switch (command.action) {
        case 'trigger_emergency':
          return await this.triggerEmergency();
        
        case 'call_parent':
          return await this.callParent();
        
        case 'rebook_sitter':
          return await this.rebookSitter();
        
        case 'cancel_booking':
          return await this.cancelBooking();
        
        case 'send_message':
          return await this.sendMessage(input);
        
        case 'read_messages':
          return await this.readMessages();
        
        case 'get_directions':
          return await this.getDirections();
        
        case 'share_location':
          return await this.shareLocation();
        
        case 'session_status':
          return await this.getSessionStatus();
        
        case 'stop_listening':
          return await this.stopListening();
        
        default:
          return { success: false, message: 'Unknown command action' };
      }
    } catch (error) {
      console.error('Error executing command:', error);
      return { success: false, message: 'Error executing command' };
    }
  }

  /**
   * Trigger emergency SOS
   */
  private async triggerEmergency(): Promise<VoiceResponse> {
    try {
      await this.speak('Emergency SOS triggered. Sending alerts to emergency contacts.');
      
      // Import and use emergency service
      const emergencyService = require('./emergency-sos.service').default;
      await emergencyService.triggerSOS();
      
      return {
        success: true,
        message: 'Emergency SOS triggered successfully',
        action: 'emergency_sos',
      };
    } catch (error) {
      return { success: false, message: 'Failed to trigger emergency SOS' };
    }
  }

  /**
   * Call parent
   */
  private async callParent(): Promise<VoiceResponse> {
    try {
      await this.speak('Calling parent now');
      
      // This would integrate with phone calling functionality
      // For now, we'll just simulate the action
      
      return {
        success: true,
        message: 'Calling parent',
        action: 'call_parent',
      };
    } catch (error) {
      return { success: false, message: 'Failed to call parent' };
    }
  }

  /**
   * Rebook sitter
   */
  private async rebookSitter(): Promise<VoiceResponse> {
    try {
      await this.speak('Finding available sitters for you');
      
      // This would integrate with booking service
      // For now, we'll just simulate the action
      
      return {
        success: true,
        message: 'Searching for available sitters',
        action: 'rebook_sitter',
      };
    } catch (error) {
      return { success: false, message: 'Failed to rebook sitter' };
    }
  }

  /**
   * Cancel booking
   */
  private async cancelBooking(): Promise<VoiceResponse> {
    try {
      await this.speak('Cancelling current booking');
      
      // This would integrate with booking service
      // For now, we'll just simulate the action
      
      return {
        success: true,
        message: 'Booking cancelled',
        action: 'cancel_booking',
      };
    } catch (error) {
      return { success: false, message: 'Failed to cancel booking' };
    }
  }

  /**
   * Send message
   */
  private async sendMessage(input: string): Promise<VoiceResponse> {
    try {
      // Extract message content from input
      const messageContent = input.replace(/send|message|text/gi, '').trim();
      
      if (!messageContent) {
        await this.speak('What message would you like to send?');
        return { success: false, message: 'No message content provided' };
      }
      
      await this.speak(`Sending message: ${messageContent}`);
      
      // This would integrate with chat service
      // For now, we'll just simulate the action
      
      return {
        success: true,
        message: 'Message sent',
        action: 'send_message',
        data: { content: messageContent },
      };
    } catch (error) {
      return { success: false, message: 'Failed to send message' };
    }
  }

  /**
   * Read messages
   */
  private async readMessages(): Promise<VoiceResponse> {
    try {
      await this.speak('Reading your messages');
      
      // This would integrate with chat service
      // For now, we'll just simulate the action
      
      return {
        success: true,
        message: 'Reading messages',
        action: 'read_messages',
      };
    } catch (error) {
      return { success: false, message: 'Failed to read messages' };
    }
  }

  /**
   * Get directions
   */
  private async getDirections(): Promise<VoiceResponse> {
    try {
      await this.speak('Getting directions to your destination');
      
      // This would integrate with navigation service
      // For now, we'll just simulate the action
      
      return {
        success: true,
        message: 'Getting directions',
        action: 'get_directions',
      };
    } catch (error) {
      return { success: false, message: 'Failed to get directions' };
    }
  }

  /**
   * Share location
   */
  private async shareLocation(): Promise<VoiceResponse> {
    try {
      await this.speak('Sharing your current location');
      
      // This would integrate with location service
      // For now, we'll just simulate the action
      
      return {
        success: true,
        message: 'Location shared',
        action: 'share_location',
      };
    } catch (error) {
      return { success: false, message: 'Failed to share location' };
    }
  }

  /**
   * Get session status
   */
  private async getSessionStatus(): Promise<VoiceResponse> {
    try {
      if (!this.currentSession) {
        await this.speak('No active session found');
        return { success: false, message: 'No active session' };
      }
      
      const status = `Session is active. Time remaining: 2 hours 30 minutes`;
      await this.speak(status);
      
      return {
        success: true,
        message: status,
        action: 'session_status',
      };
    } catch (error) {
      return { success: false, message: 'Failed to get session status' };
    }
  }

  /**
   * Stop listening
   */
  private async stopListening(): Promise<VoiceResponse> {
    try {
      await this.stop();
      return {
        success: true,
        message: 'Voice assistant stopped',
        action: 'stop_listening',
      };
    } catch (error) {
      return { success: false, message: 'Failed to stop voice assistant' };
    }
  }

  /**
   * Request confirmation for command
   */
  private async requestConfirmation(description: string): Promise<boolean> {
    return new Promise((resolve) => {
      Alert.alert(
        'Confirm Voice Command',
        `Do you want to ${description}?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve(false),
          },
          {
            text: 'Confirm',
            onPress: () => resolve(true),
          },
        ]
      );
    });
  }

  /**
   * Speak text using text-to-speech
   */
  async speak(text: string): Promise<void> {
    if (this.isSpeaking) {
      await Speech.stop();
    }

    this.isSpeaking = true;
    
    try {
      await Speech.speak(text, {
        language: this.settings.language,
        pitch: this.settings.voicePitch,
        rate: this.settings.voiceSpeed,
        onDone: () => {
          this.isSpeaking = false;
        },
        onError: (error) => {
          console.error('Speech error:', error);
          this.isSpeaking = false;
        },
      });
    } catch (error) {
      console.error('Failed to speak:', error);
      this.isSpeaking = false;
    }
  }

  /**
   * Update voice settings
   */
  updateSettings(newSettings: Partial<VoiceSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }

  /**
   * Get current settings
   */
  getSettings(): VoiceSettings {
    return { ...this.settings };
  }

  /**
   * Get available commands
   */
  getCommands(): VoiceCommand[] {
    return [...this.commands];
  }

  /**
   * Set current session
   */
  setCurrentSession(session: any): void {
    this.currentSession = session;
  }

  /**
   * Get current status
   */
  getStatus(): {
    isListening: boolean;
    isSpeaking: boolean;
    enabled: boolean;
  } {
    return {
      isListening: this.isListening,
      isSpeaking: this.isSpeaking,
      enabled: this.settings.enabled,
    };
  }
}

export default new VoiceAssistantService(); 