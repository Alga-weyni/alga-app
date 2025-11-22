import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Brain, 
  Mic, 
  MicOff, 
  Send, 
  Download,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Users,
  Home,
  DollarSign,
  Calendar,
  Sparkles,
  ArrowLeft,
  Clock,
  BarChart3,
  Lock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { voiceCommands, type VoiceLanguage } from "@/lib/voiceCommands";
import { weeklyReportGenerator } from "@/lib/weeklyReportGenerator";
import { lemlemAnalytics } from "@/lib/lemlemUsageAnalytics";
import { useAuth } from "@/hooks/useAuth";
import jsPDF from 'jspdf';
import HardwareVerificationPanel from "@/components/admin/HardwareVerificationPanel";

interface OpsMessage {
  id: string;
  query: string;
  response: string;
  timestamp: number;
  type: 'text' | 'voice';
  insights?: string[];
}

interface WeeklySummary {
  agentPerformance: {
    totalActive: number;
    newThisWeek: number;
    topPerformers: Array<{ agentId: string; bookings: number; commission: number }>;
  };
  bookingGrowth: {
    thisWeek: number;
    lastWeek: number;
    percentChange: number;
  };
  commissionRevenue: {
    total: number;
    pending: number;
    paid: number;
  };
  complianceAlerts: Array<{ type: string; count: number; severity: string }>;
  propertiesByZone: Array<{ zone: string; count: number; verified: number }>;
  generatedAt: string;
}

export default function LemlemOps() {
  const [messages, setMessages] = useState<OpsMessage[]>([]);
  const [inputQuery, setInputQuery] = useState("");
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [voiceLanguage, setVoiceLanguage] = useState<VoiceLanguage>('en-US');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Initialize analytics on mount
  useEffect(() => {
    lemlemAnalytics.init().catch(console.error);
  }, []);

  // Fetch weekly summary
  const { data: weeklySummary, refetch: refetchSummary } = useQuery<WeeklySummary>({
    queryKey: ["/api/admin/lemlem-ops/weekly-summary"],
    refetchInterval: 60000, // Refresh every minute
  });

  // Auto-refresh every Sunday at 6am
  useEffect(() => {
    const checkForSundayRefresh = () => {
      const now = new Date();
      const dayOfWeek = now.getDay(); // 0 = Sunday
      const hour = now.getHours();

      if (dayOfWeek === 0 && hour === 6) {
        refetchSummary();
        toast({
          title: "📊 Weekly Summary Updated",
          description: "Sunday 6am automatic refresh complete",
          variant: "default",
        });
      }
    };

    // Check every hour
    const interval = setInterval(checkForSundayRefresh, 3600000);
    return () => clearInterval(interval);
  }, [refetchSummary, toast]);

  // Process operations query (memoized to prevent re-creation)
  const handleSubmitQuery = useCallback(async (query?: string) => {
    const queryText = query || inputQuery;
    if (!queryText.trim()) return;

    setIsProcessing(true);
    const startTime = Date.now();
    
    try {
      const response = await fetch('/api/admin/lemlem-ops/query', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryText }),
      });

      const data = await response.json();
      const responseTime = Date.now() - startTime;

      const newMessage: OpsMessage = {
        id: `msg-${Date.now()}`,
        query: queryText,
        response: data.response,
        timestamp: Date.now(),
        type: query ? 'voice' : 'text',
        insights: data.insights,
      };

      setMessages(prev => [...prev, newMessage]);
      setInputQuery("");

      // Track analytics
      if (query) {
        // Voice command
        await lemlemAnalytics.trackVoiceCommand(queryText, user?.id);
      } else {
        // Text query
        await lemlemAnalytics.trackQuery(queryText, user?.id, responseTime);
      }
    } catch (error) {
      console.error('Query failed:', error);
      toast({
        title: "Query Failed",
        description: "Could not process operations query",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [inputQuery, toast, user?.id]);

  // Setup voice command callbacks
  useEffect(() => {
    voiceCommands.setLanguage(voiceLanguage);
    
    voiceCommands.onCommand((command) => {
      setInputQuery(command.command);
      setIsVoiceListening(false);
      // Auto-submit voice query
      handleSubmitQuery(command.command);
    });

    voiceCommands.onError((error: string) => {
      console.error('Voice error:', error);
      setIsVoiceListening(false);
      toast({
        title: "Voice Recognition Error",
        description: error,
        variant: "destructive",
      });
    });
  }, [voiceLanguage, toast, handleSubmitQuery]);

  // Voice command handler
  const handleVoiceCommand = () => {
    if (!isVoiceListening) {
      setIsVoiceListening(true);
      voiceCommands.startListening();
    } else {
      voiceCommands.stopListening();
      setIsVoiceListening(false);
    }
  };

  // Export to PDF
  const exportToPDF = async () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Lemlem Operations Summary', 20, 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 30);
    
    let yPos = 45;
    
    messages.forEach((msg, idx) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(12);
      doc.text(`Q${idx + 1}: ${msg.query}`, 20, yPos);
      yPos += 10;
      
      doc.setFontSize(10);
      const responseLines = doc.splitTextToSize(msg.response, 170);
      doc.text(responseLines, 20, yPos);
      yPos += (responseLines.length * 5) + 10;
    });

    doc.save(`lemlem-ops-${Date.now()}.pdf`);
    
    // Track PDF export
    await lemlemAnalytics.trackPdfExport(user?.id);
    
    toast({
      title: "✅ PDF Exported",
      description: "Operations summary downloaded",
      variant: "default",
    });
  };

  return (
    <div className="min-h-screen bg-[#FFF8DC]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#5B4032] to-[#CD7F32] text-white py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
              className="text-white hover:bg-white/20"
              data-testid="button-back"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
          <div className="flex items-center justify-between mt-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Brain className="h-8 w-8" />
                Ask Lemlem (Operations)
              </h1>
              <p className="text-white/80 mt-2">
                AI-powered management assistant • Zero-cost analytics • Offline-first
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = '/admin/lemlem-validation'}
                className="bg-white/10 text-white border-white/30 hover:bg-white/20"
                data-testid="button-validation-metrics"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Metrics
              </Button>
              {messages.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportToPDF}
                  className="bg-white/10 text-white border-white/30 hover:bg-white/20"
                  data-testid="button-export-pdf"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Query Interface */}
          <div className="lg:col-span-2 space-y-6">
            {/* Weekly Summary Card */}
            {weeklySummary && (
              <WeeklySummaryCard summary={weeklySummary} />
            )}

            {/* AI Insights Card */}
            <AIInsightsCard summary={weeklySummary} />

            {/* Chat Interface */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#CD7F32]" />
                  Operations Query
                </CardTitle>
                <CardDescription>
                  Type your question in plain English or Amharic
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4 mb-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Brain className="h-16 w-16 mx-auto mb-4 opacity-30" />
                      <p className="text-lg font-medium">Ask Lemlem anything</p>
                      <p className="text-sm mt-2">Try: "Show today's top agents" or "List overdue verifications"</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg) => (
                        <div key={msg.id} className="space-y-2">
                          <div className="flex items-start gap-2">
                            <Badge variant="outline" className="text-xs">
                              {msg.type === 'voice' ? '🎤' : '✍️'}
                            </Badge>
                            <div className="flex-1 bg-blue-50 p-3 rounded-lg">
                              <p className="font-medium text-sm">{msg.query}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2 ml-8">
                            <Brain className="h-5 w-5 text-[#CD7F32] mt-1" />
                            <div className="flex-1 bg-white p-3 rounded-lg border">
                              <p className="text-sm whitespace-pre-wrap">{msg.response}</p>
                              {msg.insights && msg.insights.length > 0 && (
                                <div className="mt-3 pt-3 border-t space-y-1">
                                  {msg.insights.map((insight, idx) => (
                                    <div key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                                      <Sparkles className="h-3 w-3 text-yellow-500 mt-0.5" />
                                      <span>{insight}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>

                <div className="space-y-4">
                  {/* Primary Input Method: Text */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ask about operations, agents, bookings, compliance..."
                      value={inputQuery}
                      onChange={(e) => setInputQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSubmitQuery()}
                      disabled={isProcessing || isVoiceListening}
                      data-testid="input-query"
                      className="flex-1"
                    />
                    <Button
                      onClick={() => handleSubmitQuery()}
                      disabled={isProcessing || !inputQuery.trim()}
                      data-testid="button-submit-query"
                      className="bg-[#CD7F32] hover:bg-[#B87025] text-white"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Ask
                    </Button>
                  </div>

                  {/* Optional: Voice Input */}
                  <div className="pt-2 border-t">
                    <div className="text-xs text-muted-foreground mb-2">
                      Optional: Voice input (manual activation)
                    </div>
                    
                    {/* Voice Status Indicator */}
                    {isVoiceListening && (
                      <Alert className="bg-red-50 border-red-200 mb-3">
                        <AlertTitle className="text-sm font-medium text-red-700 flex items-center gap-2">
                          <Mic className="h-4 w-4 animate-pulse" />
                          Listening... Speak now
                        </AlertTitle>
                        <AlertDescription className="text-xs text-red-600">
                          Voice recognition active. Click mic to stop.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="flex gap-2 items-center">
                      <div className="relative group">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleVoiceCommand}
                          className={isVoiceListening ? 'bg-red-100 border-red-300' : 'hover:bg-gray-100'}
                          data-testid="button-voice"
                        >
                          {isVoiceListening ? (
                            <>
                              <MicOff className="h-4 w-4 mr-2 text-red-600" />
                              Stop Listening
                            </>
                          ) : (
                            <>
                              <Mic className="h-4 w-4 mr-2 text-gray-600" />
                              Start Voice Input
                            </>
                          )}
                        </Button>
                        {/* Tooltip */}
                        {!isVoiceListening && (
                          <div className="absolute bottom-full mb-2 left-0 px-3 py-1.5 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                            Click to start voice input
                            <div className="absolute top-full left-4 border-4 border-transparent border-t-gray-900"></div>
                          </div>
                        )}
                      </div>
                      <select 
                        value={voiceLanguage}
                        onChange={(e) => setVoiceLanguage(e.target.value as VoiceLanguage)}
                        className="text-xs border rounded px-2 py-1.5 bg-white"
                        data-testid="select-voice-language"
                      >
                        <option value="en-US">🇬🇧 English</option>
                        <option value="am-ET">🇪🇹 አማርኛ</option>
                      </select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Query Shortcuts */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Quick Queries</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  "Show today's top agents",
                  "List overdue verifications",
                  "Generate weekly occupancy",
                  "Missing TeleBirr reconciliations",
                  "Agent status in CMC",
                  "Payment mismatches",
                  "Warranty expiring this month",
                  "New bookings this week",
                ].map((query) => (
                  <Button
                    key={query}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-left text-xs"
                    onClick={() => {
                      setInputQuery(query);
                      handleSubmitQuery(query);
                    }}
                    data-testid={`button-quick-${query.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  >
                    {query}
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Auto-Refresh
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                <p>Weekly summary updates every Sunday at 6:00 AM automatically.</p>
                <p className="mt-2">Next refresh: {getNextSundayTime()}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Hardware Deployment Verification Section */}
        <div className="mt-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Lock className="h-6 w-6 text-[#CD7F32]" />
              Hardware Deployment
            </h2>
            <p className="text-muted-foreground mt-1">
              Verify lockbox and security camera installations for property approval
            </p>
          </div>
          <HardwareVerificationPanel />
        </div>
      </div>
    </div>
  );
}

function WeeklySummaryCard({ summary }: { summary: WeeklySummary }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-[#CD7F32]" />
          Weekly Executive Summary
        </CardTitle>
        <CardDescription>
          Automated report • Updated {new Date(summary.generatedAt).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <Users className="h-6 w-6 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">{summary.agentPerformance.totalActive}</div>
            <div className="text-xs text-muted-foreground">Active Agents</div>
            {summary.agentPerformance.newThisWeek > 0 && (
              <div className="text-xs text-green-600 mt-1">
                +{summary.agentPerformance.newThisWeek} new
              </div>
            )}
          </div>

          <div className="text-center p-3 bg-green-50 rounded-lg">
            <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">
              {summary.bookingGrowth.percentChange > 0 ? '+' : ''}
              {summary.bookingGrowth.percentChange}%
            </div>
            <div className="text-xs text-muted-foreground">Booking Growth</div>
            <div className="text-xs mt-1">
              {summary.bookingGrowth.thisWeek} this week
            </div>
          </div>

          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <DollarSign className="h-6 w-6 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold">
              {(summary.commissionRevenue.total / 1000).toFixed(1)}k
            </div>
            <div className="text-xs text-muted-foreground">Commission ETB</div>
            <div className="text-xs mt-1 text-orange-600">
              {summary.commissionRevenue.pending} pending
            </div>
          </div>

          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-orange-600" />
            <div className="text-2xl font-bold">{summary.complianceAlerts.length}</div>
            <div className="text-xs text-muted-foreground">Alerts</div>
          </div>
        </div>

        {summary.agentPerformance.topPerformers.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="text-sm font-medium mb-2">Top Performers This Week</div>
            <div className="space-y-2">
              {summary.agentPerformance.topPerformers.slice(0, 3).map((agent, idx) => (
                <div key={agent.agentId} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">#{idx + 1}</Badge>
                    <span className="font-medium">{agent.agentId}</span>
                  </div>
                  <div className="text-right">
                    <div>{agent.bookings} bookings</div>
                    <div className="text-muted-foreground">{agent.commission} ETB</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AIInsightsCard({ summary }: { summary?: WeeklySummary }) {
  if (!summary) return null;

  const insights: string[] = [];

  // Agent retention insight
  if (summary.agentPerformance.newThisWeek > 0) {
    const retentionRate = ((summary.agentPerformance.totalActive - summary.agentPerformance.newThisWeek) / summary.agentPerformance.totalActive * 100);
    insights.push(`Agent retention at ${retentionRate.toFixed(0)}% - ${retentionRate > 80 ? 'Strong stability' : 'Consider engagement programs'}`);
  }

  // Booking trend
  if (summary.bookingGrowth.percentChange !== 0) {
    const projected = summary.bookingGrowth.thisWeek * (1 + summary.bookingGrowth.percentChange / 100) * 4;
    insights.push(`Projected ${summary.bookingGrowth.percentChange > 0 ? 'increase' : 'decrease'} of ${Math.abs(summary.bookingGrowth.percentChange * 3).toFixed(0)}% next quarter if trend holds`);
  }

  // Commission insight
  if (summary.commissionRevenue.pending > summary.commissionRevenue.paid * 0.2) {
    insights.push(`High pending commissions (${summary.commissionRevenue.pending} ETB) - prioritize reconciliation`);
  }

  // Compliance insight
  if (summary.complianceAlerts.length > 5) {
    insights.push(`${summary.complianceAlerts.length} compliance alerts require attention - allocate resources`);
  }

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          AI Predictive Insights
        </CardTitle>
        <CardDescription>Forward-looking analytics from current trends</CardDescription>
      </CardHeader>
      <CardContent>
        {insights.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground text-sm">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
            All metrics within normal range
          </div>
        ) : (
          <div className="space-y-3">
            {insights.map((insight, idx) => (
              <Alert key={idx} className="bg-white/50">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                <AlertDescription className="text-sm">{insight}</AlertDescription>
              </Alert>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getNextSundayTime(): string {
  const now = new Date();
  const nextSunday = new Date(now);
  nextSunday.setDate(now.getDate() + ((7 - now.getDay()) % 7 || 7));
  nextSunday.setHours(6, 0, 0, 0);
  return nextSunday.toLocaleString();
}
