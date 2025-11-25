import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Sparkles,
  MessageCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { BackButton } from "@/components/back-button";

export default function AdminLemlemInsights() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if not admin
  if (user && user.role !== "admin") {
    navigate("/");
    return null;
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  // Fetch Lemlem insights data
  const { data: insights, isLoading } = useQuery<{
    totalChats: number;
    templateChats: number;
    aiChats: number;
    totalCost: number;
    thisMonthCost: number;
    topQuestions: any[];
    costByDay: any[];
    mostActiveProperties: any[];
  }>({
    queryKey: ["/api/admin/lemlem-insights"],
  });

  const { data: settings } = useQuery<{
    monthlyBudgetUSD: string;
    alertThreshold: number;
  }>({
    queryKey: ["/api/admin/platform-settings"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f9e9d8] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#CD7F32] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading insights...</p>
        </div>
      </div>
    );
  }

  const totalChats = insights?.totalChats || 0;
  const templateChats = insights?.templateChats || 0;
  const aiChats = insights?.aiChats || 0;
  const totalCost = insights?.totalCost || 0;
  const thisMonthCost = insights?.thisMonthCost || 0;
  const topQuestions = insights?.topQuestions || [];
  const costByDay = insights?.costByDay || [];
  const mostActiveProperties = insights?.mostActiveProperties || [];
  const impact = (insights as any)?.impact || {};

  const templatePercentage = totalChats > 0 ? ((templateChats / totalChats) * 100).toFixed(1) : 0;
  const aiPercentage = totalChats > 0 ? ((aiChats / totalChats) * 100).toFixed(1) : 0;
  const avgCostPerAI = aiChats > 0 ? (totalCost / aiChats).toFixed(6) : 0;

  const budgetUsed = settings?.monthlyBudgetUSD
    ? (thisMonthCost / parseFloat(settings.monthlyBudgetUSD)) * 100
    : 0;

  return (
    <div className="min-h-screen bg-[#f9e9d8]">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <BackButton />

        <div className="flex items-center gap-3 mb-8">
          <Sparkles className="h-8 w-8 text-[#CD7F32]" />
          <div>
            <h1 className="text-3xl font-bold text-[#2d1405]">Lemlem AI Insights</h1>
            <p className="text-gray-600">Analytics, costs, and usage statistics</p>
          </div>
        </div>

        {/* Budget Alert */}
        {budgetUsed > (settings?.alertThreshold || 80) && (
          <Card className="mb-6 border-yellow-500 bg-yellow-50">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div className="flex-1">
                <p className="font-semibold text-yellow-900">
                  Budget Alert: {budgetUsed}% Used
                </p>
                <p className="text-sm text-yellow-700">
                  ${thisMonthCost.toFixed(2)} of ${settings?.monthlyBudgetUSD || "20.00"} monthly budget used
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Conversations</p>
                  <p className="text-3xl font-bold text-[#2d1405]">{totalChats.toLocaleString()}</p>
                </div>
                <MessageCircle className="h-10 w-10 text-[#CD7F32]" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Template Responses</p>
                  <p className="text-3xl font-bold text-green-600">{templateChats.toLocaleString()}</p>
                  <p className="text-xs text-green-600 mt-1">
                    {templatePercentage}% • FREE ✅
                  </p>
                </div>
                <CheckCircle2 className="h-10 w-10 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">AI Responses</p>
                  <p className="text-3xl font-bold text-yellow-600">{aiChats.toLocaleString()}</p>
                  <p className="text-xs text-yellow-600 mt-1">
                    {aiPercentage}% • ${avgCostPerAI} avg
                  </p>
                </div>
                <Sparkles className="h-10 w-10 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Month's Cost</p>
                  <p className="text-3xl font-bold text-[#CD7F32]">${thisMonthCost.toFixed(2)}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {budgetUsed}% of budget
                  </p>
                </div>
                <DollarSign className="h-10 w-10 text-[#CD7F32]" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="questions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="questions">Top Questions</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="impact">Impact</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          {/* Top Questions Tab */}
          <TabsContent value="questions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Most Asked Questions</CardTitle>
                <CardDescription>
                  Questions guests ask most frequently. Green = template, Yellow = AI.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {topQuestions.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No questions yet</p>
                ) : (
                  <div className="space-y-3">
                    {topQuestions.map((q: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-[#f9e9d8] rounded-lg"
                        data-testid={`question-${index}`}
                      >
                        <div className="flex-1">
                          <p className="font-medium text-[#2d1405]">{q.message}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            Asked {q.count} {q.count === 1 ? "time" : "times"}
                          </p>
                        </div>
                        <Badge
                          variant={q.usedTemplate ? "default" : "secondary"}
                          className={q.usedTemplate ? "bg-green-500" : "bg-yellow-500"}
                        >
                          {q.usedTemplate ? "Template" : "AI"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Properties Tab */}
          <TabsContent value="properties" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Most Active Properties</CardTitle>
                <CardDescription>
                  Properties with the most Lemlem conversations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {mostActiveProperties.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No property data yet</p>
                ) : (
                  <div className="space-y-3">
                    {mostActiveProperties.map((prop: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-[#f9e9d8] rounded-lg"
                        data-testid={`property-${index}`}
                      >
                        <div className="flex-1">
                          <p className="font-medium text-[#2d1405]">{prop.title}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {prop.chatCount} conversations • ${(prop.totalCost || 0).toFixed(4)} spent
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-green-600">
                            {prop.templateCount} free
                          </p>
                          <p className="text-sm text-yellow-600">
                            {prop.aiCount} AI
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Impact Tab */}
          <TabsContent value="impact" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Lemlem Impact Metrics</CardTitle>
                <CardDescription>
                  How Lemlem interactions drive bookings and engagement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-[#f9e9d8] p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Users with Lemlem Chats</p>
                    <p className="text-3xl font-bold text-[#2d1405]">
                      {impact.usersWithChats || 0}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Bookings After Chats</p>
                    <p className="text-3xl font-bold text-green-600">
                      {impact.bookingsAfterChats || 0}
                    </p>
                  </div>
                  <div className="bg-[#CD7F32]/10 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Conversion Rate</p>
                    <p className="text-3xl font-bold text-[#CD7F32]">
                      {impact.conversionRate || '0.0'}%
                    </p>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-[#2d1405] mb-3">
                  Top Properties by Engagement
                </h3>
                {!impact.topPropertiesByEngagement || impact.topPropertiesByEngagement.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No engagement data yet</p>
                ) : (
                  <div className="space-y-3">
                    {impact.topPropertiesByEngagement.map((prop: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-[#f9e9d8] rounded-lg"
                        data-testid={`engagement-${index}`}
                      >
                        <div className="flex-1">
                          <p className="font-medium text-[#2d1405]">{prop.title || `Property #${prop.propertyId}`}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {prop.totalChats} chats • {prop.uniqueUsers} unique visitors
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-green-600">
                            {prop.bookingsAfterChat || 0} bookings
                          </p>
                          <p className="text-sm text-[#CD7F32] font-bold">
                            {prop.conversionRate || '0.0'}% conversion
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cost Trends</CardTitle>
                <CardDescription>
                  Daily AI spending over the past 30 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                {costByDay.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No trend data yet</p>
                ) : (
                  <div className="space-y-2">
                    {costByDay.map((day: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-[#f9e9d8] rounded"
                        data-testid={`day-${index}`}
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">
                            {new Date(day.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-600">
                            {day.count} chats
                          </span>
                          <span className="text-sm font-bold text-[#CD7F32]">
                            ${(day.cost || 0).toFixed(4)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Summary Card */}
        <Card className="mt-8 border-[#CD7F32]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Cost Savings Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Without Template System (all AI):</p>
                <p className="text-2xl font-bold text-red-600">
                  ${(totalChats * 0.002).toFixed(2)} estimated
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">With Template System (actual):</p>
                <p className="text-2xl font-bold text-green-600">${totalCost.toFixed(2)}</p>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600">Total Savings:</p>
                <p className="text-3xl font-bold text-[#CD7F32]">
                  ${((totalChats * 0.002) - totalCost).toFixed(2)}
                </p>
                <p className="text-sm text-green-600 mt-1">
                  {templatePercentage}% of questions answered for FREE! 🎉
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
