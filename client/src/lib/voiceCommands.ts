/**
 * Voice Command System for Lemlem
 * Browser-native Web Speech API (100% FREE)
 * Supports Amharic (አማርኛ) and English
 */

export type VoiceLanguage = 'am-ET' | 'en-US';

export interface VoiceCommand {
  command: string;
  language: VoiceLanguage;
  confidence: number;
  timestamp: Date;
}

class VoiceCommandSystem {
  private recognition: any = null;
  private isListening: boolean = false;
  private currentLanguage: VoiceLanguage = 'am-ET'; // Default to Amharic
  private onCommandCallbacks: Array<(command: VoiceCommand) => void> = [];
  private onErrorCallbacks: Array<(error: string) => void> = [];

  constructor() {
    this.initializeRecognition();
  }

  private initializeRecognition(): void {
    // Check for browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('⚠️ Speech recognition not supported in this browser');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 3;

    this.recognition.onresult = (event: any) => {
      const result = event.results[0][0];
      const command: VoiceCommand = {
        command: result.transcript,
        language: this.currentLanguage,
        confidence: result.confidence * 100,
        timestamp: new Date()
      };

      console.log(`🎤 Voice command detected: "${command.command}" (${command.confidence.toFixed(0)}% confidence)`);
      this.onCommandCallbacks.forEach(callback => callback(command));
    };

    this.recognition.onerror = (event: any) => {
      console.error('🎤 Speech recognition error:', event.error);
      this.onErrorCallbacks.forEach(callback => callback(event.error));
      this.isListening = false;
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };
  }

  isSupported(): boolean {
    return this.recognition !== null;
  }

  setLanguage(language: VoiceLanguage): void {
    this.currentLanguage = language;
    if (this.recognition) {
      this.recognition.lang = language;
    }
  }

  startListening(): void {
    if (!this.recognition) {
      this.onErrorCallbacks.forEach(callback => callback('Speech recognition not supported'));
      return;
    }

    if (this.isListening) {
      console.warn('⚠️ Already listening');
      return;
    }

    try {
      this.recognition.lang = this.currentLanguage;
      this.recognition.start();
      this.isListening = true;
      console.log(`🎤 Listening for ${this.currentLanguage === 'am-ET' ? 'Amharic' : 'English'} commands...`);
    } catch (error) {
      console.error('🎤 Failed to start recognition:', error);
      this.onErrorCallbacks.forEach(callback => callback('Failed to start listening'));
    }
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
      console.log('🎤 Stopped listening');
    }
  }

  getIsListening(): boolean {
    return this.isListening;
  }

  onCommand(callback: (command: VoiceCommand) => void): void {
    this.onCommandCallbacks.push(callback);
  }

  onError(callback: (error: string) => void): void {
    this.onErrorCallbacks.push(callback);
  }

  // Parse command into action (supports both languages)
  parseCommand(commandText: string): {
    action: string;
    confidence: number;
  } | null {
    const text = commandText.toLowerCase();

    // English commands
    const englishCommands: Record<string, string> = {
      'show top agents': 'top_agents',
      'list unverified properties': 'unverified_properties',
      'active alerts': 'active_alerts',
      'payment summary': 'payment_summary',
      'weekly report': 'weekly_report',
      'help': 'help'
    };

    // Amharic commands (phonetic translations)
    const amharicCommands: Record<string, string> = {
      'የላይኛውን ወኪሎች አሳይ': 'top_agents', // "Show top agents"
      'ያልተረጋገጡ ንብረቶችን አስቀምጥ': 'unverified_properties', // "List unverified properties"
      'ንቁ ማስጠንቀቂያዎች': 'active_alerts', // "Active alerts"
      'የክፍያ ማጠቃለያ': 'payment_summary', // "Payment summary"
      'ሳምንታዊ ሪፖርት': 'weekly_report', // "Weekly report"
      'እገዛ': 'help' // "Help"
    };

    // Check English
    for (const [phrase, action] of Object.entries(englishCommands)) {
      if (text.includes(phrase)) {
        return { action, confidence: 90 };
      }
    }

    // Check Amharic
    for (const [phrase, action] of Object.entries(amharicCommands)) {
      if (text.includes(phrase)) {
        return { action, confidence: 85 };
      }
    }

    // Fuzzy matching for common variations
    if (text.match(/agents?|ወኪል/)) return { action: 'top_agents', confidence: 70 };
    if (text.match(/propert(y|ies)|ንብረት/)) return { action: 'unverified_properties', confidence: 70 };
    if (text.match(/alert|ማስጠንቀቂያ/)) return { action: 'active_alerts', confidence: 70 };
    if (text.match(/payment|ክፍያ/)) return { action: 'payment_summary', confidence: 70 };
    if (text.match(/report|ሪፖርት/)) return { action: 'weekly_report', confidence: 70 };

    return null;
  }
}

export const voiceCommands = new VoiceCommandSystem();
