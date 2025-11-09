/**
 * Ask Lemlem - Admin Command Interface
 * Text-based chatbot for quick operational commands
 * 100% FREE - browser-native, no API costs
 */

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Send, 
  X,
  Sparkles,
  TrendingUp,
  Users,
  Home,
  DollarSign
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface ChatMessage {
  id: string;
  role: "user" | "lemlem";
  content: string;
  timestamp: Date;
  data?: unknown;
}

export default function AskLemlemAdminChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "lemlem",
      content: "ሰላም! I'm Lemlem, your operations assistant. Ask me anything:\n\n📊 \"Show top agents\"\n🏠 \"List unverified properties\"\n💰 \"Payment summary\"\n🚨 \"Active alerts\"\n📈 \"Weekly report\"",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: agents } = useQuery({ queryKey: ["/api/admin/operations/agents"] });
  const { data: properties } = useQuery({ queryKey: ["/api/properties"] });
  const { data: alerts } = useQuery({ queryKey: ["/api/admin/operations/alerts"] });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const processCommand = (command: string): ChatMessage => {
    const cmd = command.toLowerCase().trim();
    
    // Top agents command
    if (cmd.includes("top agents") || cmd.includes("best agents") || cmd.includes("agent leaderboard")) {
      const sortedAgents = [...(agents || [])].sort((a, b) => 
        parseFloat(b.totalEarnings) - parseFloat(a.totalEarnings)
      ).slice(0, 5);
      
      return {
        id: Date.now().toString(),
        role: "lemlem",
        content: sortedAgents.length > 0
          ? `🏆 Top 5 Agents:\n\n${sortedAgents.map((a, i) => 
              `${i + 1}. ${a.fullName} - ETB ${parseFloat(a.totalEarnings).toLocaleString()}\n   ${a.activeProperties} active properties in ${a.city}`
            ).join('\n\n')}`
          : "No agent data available yet.",
        timestamp: new Date(),
        data: sortedAgents
      };
    }
    
    // Unverified properties command
    if (cmd.includes("unverified") || cmd.includes("pending properties") || cmd.includes("verify")) {
      const unverified = properties?.filter(p => !p.operatorVerified && p.status === "active") || [];
      
      return {
        id: Date.now().toString(),
        role: "lemlem",
        content: unverified.length > 0
          ? `🏠 ${unverified.length} Properties Pending Verification:\n\n${unverified.slice(0, 5).map(p => 
              `• ${p.title}\n  ${p.city} - ETB ${p.pricePerNight}/night`
            ).join('\n\n')}${unverified.length > 5 ? `\n\n...and ${unverified.length - 5} more` : ''}`
          : "✅ All active properties are verified!",
        timestamp: new Date(),
        data: unverified
      };
    }
    
    // Active alerts command
    if (cmd.includes("alerts") || cmd.includes("warnings") || cmd.includes("red flags")) {
      const activeAlerts = alerts || [];
      
      return {
        id: Date.now().toString(),
        role: "lemlem",
        content: activeAlerts.length > 0
          ? `🚨 ${activeAlerts.length} Active Alerts:\n\n${activeAlerts.map(a => 
              `${a.severity === "critical" ? "🔴" : a.severity === "high" ? "🟠" : "🟡"} ${a.title}\n${a.description}`
            ).join('\n\n')}`
          : "✅ No active alerts. All systems operational!",
        timestamp: new Date(),
        data: activeAlerts
      };
    }
    
    // Payment summary command
    if (cmd.includes("payment") || cmd.includes("revenue") || cmd.includes("earnings")) {
      const totalAgents = agents?.length || 0;
      const totalCommissions = agents?.reduce((sum, a) => sum + parseFloat(a.totalEarnings || "0"), 0) || 0;
      const totalProperties = properties?.length || 0;
      
      return {
        id: Date.now().toString(),
        role: "lemlem",
        content: `💰 Payment Summary:\n\n📊 Active Agents: ${totalAgents}\n💵 Total Commissions Paid: ETB ${totalCommissions.toLocaleString()}\n🏠 Properties Earning: ${totalProperties}\n📈 Avg Commission/Agent: ETB ${totalAgents > 0 ? (totalCommissions / totalAgents).toFixed(0) : 0}`,
        timestamp: new Date()
      };
    }
    
    // Weekly report command
    if (cmd.includes("weekly") || cmd.includes("report") || cmd.includes("summary")) {
      const totalAgents = agents?.length || 0;
      const activeAgents = agents?.filter(a => a.status === "approved").length || 0;
      const totalProperties = properties?.length || 0;
      const verifiedProperties = properties?.filter(p => p.operatorVerified).length || 0;
      const activeAlerts = alerts?.length || 0;
      
      return {
        id: Date.now().toString(),
        role: "lemlem",
        content: `📈 Weekly Operations Report:\n\n👥 Agents: ${activeAgents}/${totalAgents} active\n🏠 Properties: ${verifiedProperties}/${totalProperties} verified\n🚨 Active Alerts: ${activeAlerts}\n\n${activeAlerts > 0 ? "⚠️ Attention needed on active alerts!" : "✅ All systems operational"}`,
        timestamp: new Date()
      };
    }
    
    // Help command
    if (cmd.includes("help") || cmd.includes("commands") || cmd === "?") {
      return {
        id: Date.now().toString(),
        role: "lemlem",
        content: "📚 Available Commands:\n\n• \"Show top agents\" - View agent leaderboard\n• \"List unverified properties\" - Pending verifications\n• \"Payment summary\" - Financial overview\n• \"Active alerts\" - Current red flags\n• \"Weekly report\" - Operations summary\n• \"Help\" - Show this message",
        timestamp: new Date()
      };
    }
    
    // Default response
    return {
      id: Date.now().toString(),
      role: "lemlem",
      content: "🤔 I didn't understand that command. Try:\n\n• \"Show top agents\"\n• \"Active alerts\"\n• \"Help\" for more commands",
      timestamp: new Date()
    };
  };

  const handleSend = () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsProcessing(true);
    
    // Process command and add response
    setTimeout(() => {
      const response = processCommand(input);
      setMessages(prev => [...prev, response]);
      setIsProcessing(false);
    }, 500);
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
        className="fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-lg bg-[#5B4032] hover:bg-[#4a3429]"
        onClick={() => setIsOpen(true)}
        data-testid="button-open-lemlem-chat"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl flex flex-col z-50">
      <CardHeader className="pb-3 bg-gradient-to-r from-[#5B4032] to-[#CD7F32] text-white">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5" />
            Ask Lemlem
            <Badge variant="secondary" className="ml-2">Admin</Badge>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-white/20"
            data-testid="button-close-lemlem-chat"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-4 py-2 ${
                msg.role === "user"
                  ? "bg-[#5B4032] text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
              <div className={`text-xs mt-1 opacity-70`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </CardContent>
      
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask Lemlem anything..."
            className="flex-1"
            disabled={isProcessing}
            data-testid="input-lemlem-chat"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isProcessing}
            className="bg-[#5B4032] hover:bg-[#4a3429]"
            data-testid="button-send-lemlem"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-xs text-muted-foreground mt-2 text-center">
          Try: "show top agents" or "active alerts"
        </div>
      </div>
    </Card>
  );
}
