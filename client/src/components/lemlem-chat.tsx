import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, Volume2, VolumeX } from "lucide-react";
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

// Language options for switcher
const LANGUAGE_OPTIONS = [
  { code: 'en', flag: '🇬🇧', label: 'English' },
  { code: 'am', flag: '🇪🇹', label: 'አማርኛ' },
  { code: 'ti', flag: '🇪🇷', label: 'ትግርኛ' },
  { code: 'om', flag: '🌾', label: 'Afaan Oromoo' },
  { code: 'zh', flag: '🇨🇳', label: '中文' },
];

export function LemlemChat({ propertyId, bookingId }: LemlemChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "Hello, dear! I'm Lemlem, your AI assistant. I can help you with lockbox codes, WiFi passwords, check-in/check-out times, emergency contacts, and local recommendations. What can I help you with? ☕️",
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
  const [selectedLanguage, setSelectedLanguage] = useState('en');
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
    if (profile?.preferences?.language && !selectedLanguage) {
      setSelectedLanguage(profile.preferences.language);
    }
  }, [profile, selectedLanguage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Clean text for speech - remove emojis and symbols, keep only letters and numbers
  const cleanTextForSpeech = (text: string): string => {
    return text
      // Remove common emojis by replacing them with empty string
      .replace(/[\u2600-\u27BF]/g, '')
      .replace(/[\uE000-\uF8FF]/g, '')
      .replace(/[\uD83C-\uDBFF\uDC00-\uDFFF]/g, '')
      // Remove markdown formatting
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/##/g, '')
      .replace(/#/g, '')
      // Clean up multiple spaces
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Text-to-Speech function - Warm Grandmother Voice
  const speak = (text: string) => {
    if (!voiceEnabled || !window.speechSynthesis) return;

    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    // Clean text - remove emojis and symbols, keep only words and numbers
    const cleanText = cleanTextForSpeech(text);
    if (!cleanText) return; // Don't speak if nothing left after cleaning

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const langCode = LANGUAGE_VOICES[userLanguage] || 'en-US';
    utterance.lang = langCode;
    
    // Soft, loving grandmother voice settings (like speaking to a beloved grandchild)
    utterance.rate = 0.84; // Warm, patient pace with gentle energy
    utterance.pitch = 1.2; // Soft, sweet, and gentle tone
    utterance.volume = 0.95; // Gentle presence, not overwhelming
    
    // Try to select a female voice for grandmother feel
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.lang.startsWith(langCode.split('-')[0]) && 
      (voice.name.toLowerCase().includes('female') || 
       voice.name.toLowerCase().includes('woman'))
    ) || voices.find(voice => 
      voice.lang.startsWith(langCode.split('-')[0])
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    // Natural pause before speaking to sound calm and thoughtful (like a grandmother taking a breath)
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 250);
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
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg bg-gradient-to-r from-[#CD7F32] to-[#FF8C00] hover:from-[#B87333] hover:to-[#FF7F00] text-white z-50"
        data-testid="button-open-lemlem"
      >
        <MessageCircle className="h-7 w-7" />
      </Button>
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
      <div className="px-3 py-2 border-b bg-[#f9e9d8]/50 flex items-center justify-center gap-2">
        <span className="text-xs text-[#2d1405] font-medium">Language:</span>
        <div className="flex gap-1">
          {LANGUAGE_OPTIONS.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setSelectedLanguage(lang.code)}
              className={`px-2 py-1 text-xs rounded transition-all ${
                selectedLanguage === lang.code
                  ? 'bg-[#CD7F32] text-white shadow-sm'
                  : 'bg-white text-[#2d1405] hover:bg-[#CD7F32]/10'
              }`}
              data-testid={`button-lang-${lang.code}`}
              title={lang.label}
            >
              {lang.flag}
            </button>
          ))}
        </div>
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
