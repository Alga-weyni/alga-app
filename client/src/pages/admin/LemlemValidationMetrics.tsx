import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Mic, 
  FileDown,
  Clock,
  ThumbsUp,
  ThumbsDown,
  BarChart3,
  ArrowLeft,
  Download
} from "lucide-react";
import { lemlemAnalytics } from "@/lib/lemlemUsageAnalytics";

interface ValidationMetrics {
  totalQueries: number;
  uniqueUsers: number;
  avgResponseTime: number;
  voiceCommandUsage: number;
  pdfExports: number;
  topQueries: Array<{ query: string; count: number }>;
  queryCategoryBreakdown: Record<string, number>;
  userSatisfaction: number;
  dailyActiveUsers: number;
}

interface FeedbackItem {
  query: string;
  satisfied: boolean;
  feedback?: string;
  timestamp: number;
}

export default function LemlemValidationMetrics() {
  const [metrics, setMetrics] = useState<ValidationMetrics | null>(null);
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [daysRange, setDaysRange] = useState(7);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, [daysRange]);

  const loadMetrics = async () => {
    setIsLoading(true);
    try {
      await lemlemAnalytics.init();
      const data = await lemlemAnalytics.getMetrics(daysRange);
      const feedbackData = await lemlemAnalytics.getFeedbackSummary();
      setMetrics(data);
      setFeedback(feedbackData);
    } catch (error) {
      console.error('Failed to load metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportMetricsData = async () => {
    const data = await lemlemAnalytics.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lemlem-v3-metrics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFF8DC] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#CD7F32] mx-auto mb-4"></div>
          <p className="text-[#5B4032]">Loading validation metrics...</p>
        </div>
      </div>
    );
  }

  const v4ReadinessScore = metrics ? calculateV4Readiness(metrics) : 0;

  return (
    <div className="min-h-screen bg-[#FFF8DC]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#5B4032] to-[#CD7F32] text-white py-8">
        <div className="max-w-7xl mx-auto px-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
            className="text-white hover:bg-white/20 mb-4"
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <BarChart3 className="h-8 w-8" />
                Lemlem v3 Validation Metrics
              </h1>
              <p className="text-white/80 mt-2">
                Real-world usage data to determine v4 readiness
              </p>
            </div>
            <div className="flex gap-3">
              <select
                value={daysRange}
                onChange={(e) => setDaysRange(Number(e.target.value))}
                className="bg-white/20 text-white rounded-lg px-4 py-2 border border-white/30"
                data-testid="select-days-range"
              >
                <option value={7} className="text-gray-900">Last 7 days</option>
                <option value={14} className="text-gray-900">Last 14 days</option>
                <option value={30} className="text-gray-900">Last 30 days</option>
              </select>
              <Button
                onClick={exportMetricsData}
                className="bg-white text-[#5B4032] hover:bg-white/90"
                data-testid="button-export-metrics"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* V4 Readiness Score */}
        <Card className="mb-6 border-[#CD7F32] bg-gradient-to-br from-[#FFF8DC] to-white">
          <CardHeader>
            <CardTitle className="text-2xl text-[#2d1405]">
              v4 Recommendation Engine Readiness
            </CardTitle>
            <CardDescription>
              Based on {daysRange} days of real user data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-[#CD7F32]">
                  {v4ReadinessScore}%
                </span>
                <Badge className={
                  v4ReadinessScore >= 70 
                    ? "bg-green-500" 
                    : v4ReadinessScore >= 50 
                      ? "bg-yellow-500" 
                      : "bg-red-500"
                }>
                  {v4ReadinessScore >= 70 ? "✅ Build v4" : v4ReadinessScore >= 50 ? "⚠️ More Testing Needed" : "❌ Continue v3 Validation"}
                </Badge>
              </div>
              <Progress value={v4ReadinessScore} className="h-3" />
              <p className="text-sm text-gray-600">
                {v4ReadinessScore >= 70 
                  ? "Strong evidence that users need action recommendations. v4 should be built."
                  : v4ReadinessScore >= 50
                    ? "Some indicators suggest v4 value. Continue testing for 1-2 more weeks."
                    : "v3 validation still in progress. Need more usage data to determine v4 necessity."
                }
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Usage Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card className="border-[#CD7F32]" data-testid="card-total-queries">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#2d1405]">
                Total Queries
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-[#CD7F32]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2d1405]">{metrics?.totalQueries || 0}</div>
              <p className="text-xs text-gray-600 mt-1">
                {daysRange === 7 ? "Last 7 days" : daysRange === 14 ? "Last 14 days" : "Last 30 days"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#CD7F32]" data-testid="card-unique-users">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#2d1405]">
                Active Users
              </CardTitle>
              <Users className="h-4 w-4 text-[#CD7F32]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2d1405]">{metrics?.uniqueUsers || 0}</div>
              <p className="text-xs text-gray-600 mt-1">
                {metrics?.dailyActiveUsers || 0} today
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#CD7F32]" data-testid="card-avg-response">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#2d1405]">
                Avg Response Time
              </CardTitle>
              <Clock className="h-4 w-4 text-[#CD7F32]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2d1405]">{metrics?.avgResponseTime || 0}ms</div>
              <p className="text-xs text-gray-600 mt-1">
                Browser-native speed
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#CD7F32]" data-testid="card-satisfaction">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#2d1405]">
                User Satisfaction
              </CardTitle>
              <ThumbsUp className="h-4 w-4 text-[#CD7F32]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2d1405]">{metrics?.userSatisfaction || 0}%</div>
              <p className="text-xs text-gray-600 mt-1">
                Positive feedback rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Feature Adoption */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="border-[#CD7F32]">
            <CardHeader>
              <CardTitle className="text-[#2d1405]">Feature Adoption</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mic className="h-4 w-4 text-[#CD7F32]" />
                  <span className="text-sm">Voice Commands</span>
                </div>
                <Badge variant="outline">{metrics?.voiceCommandUsage || 0} uses</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileDown className="h-4 w-4 text-[#CD7F32]" />
                  <span className="text-sm">PDF Exports</span>
                </div>
                <Badge variant="outline">{metrics?.pdfExports || 0} exports</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#CD7F32]">
            <CardHeader>
              <CardTitle className="text-[#2d1405]">Query Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-32">
                <div className="space-y-2">
                  {metrics?.queryCategoryBreakdown && Object.entries(metrics.queryCategoryBreakdown).map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{category.replace(/_/g, ' ')}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Top Queries */}
        <Card className="border-[#CD7F32] mb-6">
          <CardHeader>
            <CardTitle className="text-[#2d1405]">Top 10 Most Asked Questions</CardTitle>
            <CardDescription>
              These indicate where users need the most operational intelligence
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {metrics?.topQueries.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-[#FFF8DC] rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-[#CD7F32] text-white">#{idx + 1}</Badge>
                      <span className="text-sm">{item.query}</span>
                    </div>
                    <Badge variant="outline">{item.count} times</Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* User Feedback */}
        <Card className="border-[#CD7F32]">
          <CardHeader>
            <CardTitle className="text-[#2d1405]">Recent Feedback</CardTitle>
            <CardDescription>
              Direct user feedback on query usefulness
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {feedback.map((item, idx) => (
                  <div key={idx} className="p-4 bg-[#FFF8DC] rounded-lg border border-[#CD7F32]/20">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {item.satisfied ? (
                          <ThumbsUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <ThumbsDown className="h-4 w-4 text-red-600" />
                        )}
                        <span className="text-sm font-medium">
                          {item.satisfied ? "Helpful" : "Not Helpful"}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Query:</strong> {item.query}
                    </p>
                    {item.feedback && (
                      <p className="text-sm text-gray-600 italic">
                        "{item.feedback}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Calculate v4 readiness score based on metrics
function calculateV4Readiness(metrics: ValidationMetrics): number {
  let score = 0;

  // Usage volume (30 points max)
  if (metrics.totalQueries >= 100) score += 30;
  else if (metrics.totalQueries >= 50) score += 20;
  else if (metrics.totalQueries >= 20) score += 10;

  // User satisfaction (20 points max)
  if (metrics.userSatisfaction >= 80) score += 20;
  else if (metrics.userSatisfaction >= 60) score += 15;
  else if (metrics.userSatisfaction >= 40) score += 10;

  // Active user adoption (20 points max)
  if (metrics.uniqueUsers >= 5) score += 20;
  else if (metrics.uniqueUsers >= 3) score += 15;
  else if (metrics.uniqueUsers >= 1) score += 10;

  // Feature adoption (15 points max)
  const featureUsage = metrics.voiceCommandUsage + metrics.pdfExports;
  if (featureUsage >= 20) score += 15;
  else if (featureUsage >= 10) score += 10;
  else if (featureUsage >= 5) score += 5;

  // Query category diversity (15 points max)
  const categoryCount = Object.keys(metrics.queryCategoryBreakdown).length;
  if (categoryCount >= 5) score += 15;
  else if (categoryCount >= 3) score += 10;
  else if (categoryCount >= 2) score += 5;

  return Math.min(100, score);
}
