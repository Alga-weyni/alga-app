import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Send, Volume2, VolumeX } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  usedTemplate?: boolean;
  cost?: number;
}

interface LemlemChatProps {
  propertyId?: number;
  bookingId?: number;
}

// Language code mapping for Text-to-Speech
const LANGUAGE_VOICES: Record<string, string> = {
  'en': 'en-US',
  'am': 'am-ET',
  'ti': 'ti-ER',
  'om': 'om-ET',
  'zh': 'zh-CN', // Mandarin Chinese
};

// Language options for dropdown
const LANGUAGE_OPTIONS = [
  { code: 'en', label: 'English' },
  { code: 'am', label: 'አማርኛ (Amharic)' },
  { code: 'ti', label: 'ትግርኛ (Tigrinya)' },
  { code: 'om', label: 'Afaan Oromoo (Oromo)' },
  { code: 'zh', label: '中文 (Chinese)' },
];

// Welcome messages in all languages
const WELCOME_MESSAGES: Record<string, string> = {
  'en': "Hello, dear! I'm Lemlem, your AI assistant. I can help you with lockbox codes, WiFi passwords, check-in/check-out times, emergency contacts, and local recommendations. What can I help you with? ☕️",
  'am': "ሰላም! እኔ ለምለም ነኝ፣ የእርስዎ AI ረዳት። የመቆለፊያ ሳጥን ኮዶች፣ የWiFi የይለፍ ቃላት፣ የመግቢያ/መውጫ ሰዓቶች፣ የአደጋ ጊዜ እውቂያዎች እና የአካባቢ ምክሮች ላገዝዎ እችላለሁ። ምን ልረዳዎ? ☕️",
  'ti': "ሰላም! ኣነ ለምለም እየ፣ AI ሓጋዚኽን። ናይ መቆልፊ ሳጹን ኮድ፣ WiFi ፓስዎርድ፣ ናይ መእተዊ/ምውጻእ ሰዓት፣ ህጹጽ ርክባት፣ ከምኡ'ውን ናይ ከባቢ ምኽርታት ክሕግዘኩም እኽእል። እንታይ ክሕግዘኩም? ☕️",
  'om': "Nagaa! Ani Lemlem jedhama, gargaaraa AI keessan. Koodii sanduqa cufsaa, jecha icciitii WiFi, sa'aatii seensaa/bahuu, quunnamtii ariifachiisaa, akkasumas gorsa naannoo isin gargaaruu nan danda'a. Maal isin gargaaruu danda'a? ☕️",
  'zh': "您好！我是 Lemlem，您的人工智能助手。我可以帮您提供密码箱密码、WiFi密码、入住/退房时间、紧急联系方式和当地推荐。我能帮您什么？☕️",
};

export function LemlemChat({ propertyId, bookingId }: LemlemChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: WELCOME_MESSAGES['en'],
      isUser: false,
      usedTemplate: true,
      cost: 0,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [totalCost, setTotalCost] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Load voices when component mounts (some browsers need this)
  useEffect(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      // Chrome needs this event to load voices
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  // Get user's language preference
  const { data: profile } = useQuery<any>({
    queryKey: ['/api/profile'],
    enabled: isOpen, // Only load when chat is open
  });

  // Use selected language or fall back to profile preference
  const userLanguage = selectedLanguage || (profile?.preferences?.language || 'en') as string;

  // Set initial language from profile when it loads
  useEffect(() => {
    if (profile?.preferences?.language && selectedLanguage === 'en') {
      setSelectedLanguage(profile.preferences.language);
    }
  }, [profile]);

  // Instantly update welcome message when language changes
  useEffect(() => {
    setMessages((prevMessages) => {
      const updatedMessages = [...prevMessages];
      const welcomeIndex = updatedMessages.findIndex((msg) => msg.id === 'welcome');
      if (welcomeIndex !== -1) {
        updatedMessages[welcomeIndex] = {
          ...updatedMessages[welcomeIndex],
          text: WELCOME_MESSAGES[selectedLanguage] || WELCOME_MESSAGES['en'],
        };
      }
      return updatedMessages;
    });
  }, [selectedLanguage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Clean text for speech - remove ALL emojis, symbols, and special characters
  const cleanTextForSpeech = (text: string): string => {
    return text
      // Remove emojis and special symbols
      .replace(/[\u2600-\u27BF]/g, '')         // Miscellaneous Symbols  
      .replace(/[\uE000-\uF8FF]/g, '')         // Private Use Area
      .replace(/[\u2700-\u27BF]/g, '')         // Dingbats
      .replace(/[\uD800-\uDFFF]/g, '')         // Surrogate pairs (emojis)
      // Remove common special symbols explicitly
      .replace(/[☕✨🔑📶⏰🚨🏠🎉📞🚗🌡📺🍳💰🙏🎯🌍🇪🇹🇪🇷🇨🇳🌾🇬🇧]/g, '')
      // Remove markdown formatting
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/##/g, '')
      .replace(/#/g, '')
      .replace(/`/g, '')
      // Remove extra punctuation that sounds awkward
      .replace(/[|]/g, '')
      // Clean up multiple spaces and newlines
      .replace(/\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Text-to-Speech function - Soft, Loving Grandmother Voice
  const speak = (text: string) => {
    if (!voiceEnabled || !window.speechSynthesis) return;

    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    // Clean text - remove ALL emojis and symbols
    const cleanText = cleanTextForSpeech(text);
    if (!cleanText) return; // Don't speak if nothing left after cleaning

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const langCode = LANGUAGE_VOICES[userLanguage] || 'en-US';
    utterance.lang = langCode;
    
    // Very soft, gentle grandmother voice - extra soft and loving
    utterance.rate = 0.75;   // Slower, more patient (was 0.84)
    utterance.pitch = 1.35;  // Higher, softer, more feminine (was 1.2)
    utterance.volume = 0.90; // Slightly quieter, gentler (was 0.95)
    
    // Select the BEST native voice for each language
    const voices = window.speechSynthesis.getVoices();
    
    // Language-specific voice selection for natural pronunciation
    let preferredVoice = null;
    
    if (userLanguage === 'zh') {
      // Chinese: Find Mandarin female voice
      preferredVoice = voices.find(voice => 
        (voice.lang.includes('zh-CN') || voice.lang.includes('zh')) &&
        (voice.name.includes('Female') || voice.name.includes('Ting-Ting') || voice.name.includes('Mei'))
      );
    } else if (userLanguage === 'am') {
      // Amharic: Find Ethiopian/Amharic voice or fallback to similar
      preferredVoice = voices.find(voice => 
        voice.lang.includes('am') || voice.lang.includes('AM')
      );
    } else if (userLanguage === 'ti') {
      // Tigrinya: Find Tigrinya voice or fallback
      preferredVoice = voices.find(voice => 
        voice.lang.includes('ti') || voice.lang.includes('TI')
      );
    } else if (userLanguage === 'om') {
      // Oromo: Find Oromo voice or fallback
      preferredVoice = voices.find(voice => 
        voice.lang.includes('om') || voice.lang.includes('OM')
      );
    } else {
      // English: Find female English voice
      preferredVoice = voices.find(voice => 
        voice.lang.startsWith('en') &&
        (voice.name.includes('Female') || voice.name.includes('Samantha') || voice.name.includes('Victoria'))
      );
    }
    
    // Fallback: Any voice matching the language
    if (!preferredVoice) {
      preferredVoice = voices.find(voice => 
        voice.lang.startsWith(langCode.split('-')[0])
      );
    }
    
    // Final fallback: Any female-sounding voice
    if (!preferredVoice) {
      preferredVoice = voices.find(voice => 
        voice.name.toLowerCase().includes('female') || 
        voice.name.toLowerCase().includes('woman')
      );
    }
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    // Natural pause before speaking (grandmother taking a gentle breath)
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 300);
  };

  // Auto-speak Lemlem's responses
  const speakLastMessage = (messageText: string) => {
    if (voiceEnabled) {
      // Small delay to ensure message is displayed first
      setTimeout(() => speak(messageText), 100);
    }
  };

  const quickQuestions = [
    "What's the lockbox code?",
    "What's the WiFi password?",
    "When is check-out?",
    "Emergency contacts",
    "Where can I eat nearby?",
  ];

  const handleSend = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await apiRequest("POST", "/api/lemlem/chat", {
        message: messageText,
        propertyId,
        bookingId,
        language: selectedLanguage, // Pass selected language to backend
      });

      const lemlemMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.message,
        isUser: false,
        usedTemplate: response.usedTemplate,
        cost: response.cost || 0,
      };

      setMessages((prev) => [...prev, lemlemMessage]);

      // Auto-speak Lemlem's response
      speakLastMessage(response.message);

      // Track costs
      if (response.cost && response.cost > 0) {
        setTotalCost((prev) => prev + response.cost);
        toast({
          title: "💰 AI Used",
          description: `Cost: $${response.cost.toFixed(6)} (using AI for complex question)`,
          variant: "default",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble right now, dear. Please try again in a moment or contact the host directly. 🙏",
        isUser: false,
        usedTemplate: true,
        cost: 0,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        title="Lemlem (ልምልም) AI Assistant"
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-2xl bg-gradient-to-br from-[#F49F0A] via-[#FF8C00] to-[#CD7F32] hover:from-[#FFB020] hover:via-[#FFA500] hover:to-[#DAA520] text-white z-50 flex flex-col items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-[0_8px_30px_rgba(244,159,10,0.5)] border-2 border-white/20"
        data-testid="button-open-lemlem"
        style={{
          fontFamily: "'Noto Sans Ethiopic', 'Noto Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}
      >
        <span className="text-[10px] font-semibold leading-tight tracking-wide" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
          Lemlem
        </span>
        <span className="text-base font-bold leading-tight mt-0.5" style={{ fontFamily: "'Noto Sans Ethiopic', serif" }}>
          ልምልም
        </span>
      </button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[600px] flex flex-col shadow-2xl z-50 border-2 border-[#CD7F32]" data-testid="card-lemlem-chat">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-[#CD7F32] to-[#FF8C00] text-white rounded-t-lg">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-2xl">
            👵🏾
          </div>
          <div>
            <h3 className="font-semibold" data-testid="text-lemlem-title">Lemlem</h3>
            <p className="text-xs opacity-90">
              Your AI Grandmother Assistant
              {isSpeaking && <span className="ml-2 animate-pulse">🔊</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              const newVoiceState = !voiceEnabled;
              setVoiceEnabled(newVoiceState);
              if (!newVoiceState) {
                // If turning OFF voice, cancel any ongoing speech
                window.speechSynthesis.cancel();
                setIsSpeaking(false);
              }
            }}
            className="text-white hover:bg-white/20"
            data-testid="button-toggle-voice"
            title={voiceEnabled ? "Turn Voice Off" : "Turn Voice On"}
          >
            {voiceEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-white/20"
            data-testid="button-close-lemlem"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Language Switcher */}
      <div className="px-4 py-3 border-b bg-[#f9e9d8]/50 flex items-center justify-center gap-3">
        <span className="text-sm text-[#2d1405] font-medium">Language:</span>
        <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
          <SelectTrigger 
            className="w-[200px] bg-white border-[#CD7F32]/30 text-[#2d1405] focus:ring-[#CD7F32]"
            data-testid="select-language"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGE_OPTIONS.map((lang) => (
              <SelectItem 
                key={lang.code} 
                value={lang.code}
                data-testid={`option-lang-${lang.code}`}
              >
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Cost Indicator */}
      {totalCost > 0 && (
        <div className="px-4 py-2 bg-yellow-50 border-b text-xs text-center text-yellow-800">
          💰 Total AI Cost: ${totalCost.toFixed(6)} (Most questions are FREE with templates!)
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f9e9d8]/30">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
            data-testid={`message-${message.isUser ? "user" : "lemlem"}-${message.id}`}
          >
            <div className="flex items-start gap-2">
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.isUser
                    ? "bg-[#CD7F32] text-white"
                    : "bg-white border border-[#CD7F32]/20"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                {!message.isUser && message.usedTemplate && (
                  <p className="text-xs text-green-600 mt-1">
                    ✅ Answered instantly (no AI cost)
                  </p>
                )}
                {!message.isUser && !message.usedTemplate && message.cost && message.cost > 0 && (
                  <p className="text-xs text-yellow-600 mt-1">
                    💰 AI used (${message.cost.toFixed(6)})
                  </p>
                )}
              </div>
              {!message.isUser && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => speak(message.text)}
                  className="h-8 w-8 text-[#CD7F32] hover:text-[#B87333] hover:bg-[#f9e9d8]"
                  data-testid={`button-speak-${message.id}`}
                  title="Listen to this message"
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-[#CD7F32]/20 rounded-lg p-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-[#CD7F32] rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-[#CD7F32] rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-[#CD7F32] rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      {messages.length === 1 && (
        <div className="px-4 py-2 border-t bg-white">
          <p className="text-xs text-gray-600 mb-2">Quick questions:</p>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className="text-xs px-2 py-1 rounded-full bg-[#f9e9d8] hover:bg-[#CD7F32] hover:text-white transition-colors border border-[#CD7F32]/20"
                data-testid={`button-quick-${q.toLowerCase().replace(/[^a-z]/g, "-")}`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t bg-white rounded-b-lg">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your question..."
            className="flex-1 border-[#CD7F32]/20 focus:border-[#CD7F32]"
            disabled={isLoading}
            data-testid="input-lemlem-message"
          />
          <Button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="bg-[#CD7F32] hover:bg-[#B87333] text-white"
            data-testid="button-send-lemlem"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Most questions answered FREE with templates! 🌟
        </p>
      </div>
    </Card>
  );
}
