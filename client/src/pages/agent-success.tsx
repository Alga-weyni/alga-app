import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/header";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  Home,
  User,
  Clock,
  TrendingUp,
  ArrowRight,
  FileText,
} from "lucide-react";

interface AgentStatus {
  agent: {
    id: number;
    fullName: string;
    status: string;
    city: string;
  };
}

export default function AgentSuccess() {
  const navigate = useNavigate();

  // Fetch agent status directly
  const { data: agentData, isLoading: agentLoading } = useQuery<AgentStatus>({
    queryKey: ["/api/agent/dashboard"],
    retry: false,
  });

  if (agentLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-cream to-cream/80 dark:from-gray-900 dark:to-gray-800 p-4">
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </>
    );
  }

  // Get agent status - default to 'pending' if not found
  const agentStatus = agentData?.agent?.status || 'pending';
  const isApproved = agentStatus === 'approved';

  // PENDING APPROVAL PAGE - Show this for non-approved agents
  if (!isApproved) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Pending Approval Header */}
            <Card className="border-amber-500 dark:border-amber-400 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
              <CardContent className="pt-8 pb-8">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4">
                    <Clock className="h-12 w-12 text-amber-600" />
                  </div>
                  <h1 className="text-4xl font-bold mb-3" data-testid="text-pending-title">
                    📋 Application Submitted!
                  </h1>
                  <p className="text-xl text-amber-50 mb-2">
                    Your agent application is pending review
                  </p>
                  <p className="text-amber-100">
                    An admin will verify your ID document and approve your account
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* What Happens Next */}
            <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800 dark:text-amber-200">
                    <p className="font-semibold mb-2">📝 What Happens Next</p>
                    <ul className="space-y-2 ml-4 list-disc">
                      <li>Our team will review your submitted ID document</li>
                      <li>Approval typically takes <strong>1-2 business days</strong></li>
                      <li>You'll receive a notification once approved</li>
                      <li>Then you can start listing properties and earning <strong>5% commission</strong></li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Badge */}
            <Card className="border-amber-200 dark:border-amber-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-medium-brown dark:text-cream">Application Status:</span>
                  <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                    ⏳ Pending Review
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={() => navigate("/")}
                size="lg"
                className="w-full bg-amber-600 hover:bg-amber-700 text-white text-lg py-6"
                data-testid="button-browse-properties"
              >
                <Home className="mr-2 h-5 w-5" />
                Browse Properties While You Wait
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button
                onClick={() => navigate("/my-alga")}
                variant="outline"
                size="lg"
                className="w-full text-lg py-6"
                data-testid="button-go-my-alga"
              >
                <User className="mr-2 h-5 w-5" />
                Go to My Alga
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // APPROVED AGENT PAGE - Only show for approved agents
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Success Header */}
          <Card className="border-green-500 dark:border-green-400 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
            <CardContent className="pt-8 pb-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
                <h1 className="text-4xl font-bold mb-3" data-testid="text-approved-title">
                  🎉 Congratulations!
                </h1>
                <p className="text-xl text-green-50 mb-2">
                  You're now an official Alga Dellala Agent!
                </p>
                <p className="text-green-100">
                  Start earning 5% commission on every booking for 36 months
                </p>
              </div>
            </CardContent>
          </Card>

          {/* How It Works */}
          <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-emerald-800 dark:text-emerald-200">
                  <p className="font-semibold mb-2">💡 How to Start Earning</p>
                  <ul className="space-y-2 ml-4 list-disc">
                    <li>List properties by connecting property owners to Alga</li>
                    <li>You earn <strong>5% commission</strong> on every booking</li>
                    <li>Commission continues for <strong>36 months</strong> from the first booking</li>
                    <li>Payments are sent automatically to your payment account</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Badge */}
          <Card className="border-green-200 dark:border-green-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-medium-brown dark:text-cream">Account Status:</span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  ✅ Approved
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => navigate("/dellala/list-property")}
              size="lg"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-lg py-6"
              data-testid="button-list-property"
            >
              <Home className="mr-2 h-5 w-5" />
              List Your First Property
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button
              onClick={() => navigate("/dellala/dashboard")}
              variant="outline"
              size="lg"
              className="w-full text-lg py-6"
              data-testid="button-go-dashboard"
            >
              Go to Agent Dashboard
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
