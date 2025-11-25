import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { BackButton } from "@/components/back-button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Settings,
  DollarSign,
  Sparkles,
  Power,
  Bell,
  Save,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

const settingsSchema = z.object({
  aiEnabled: z.boolean(),
  monthlyBudgetUSD: z.string().min(1, "Monthly budget is required"),
  alertsEnabled: z.boolean(),
  alertThreshold: z.number().min(1).max(100),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function AdminAIControl() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  // Redirect if not admin
  if (user && user.role !== "admin") {
    navigate("/");
    return null;
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  // Fetch current settings
  const { data: settings, isLoading } = useQuery<{
    id: number;
    aiEnabled: boolean;
    monthlyBudgetUSD: string;
    currentMonthSpend: string;
    alertsEnabled: boolean;
    alertThreshold: number;
  }>({
    queryKey: ["/api/admin/platform-settings"],
  });

  // Fetch insights for current spending
  const { data: insights } = useQuery<{
    thisMonthCost: number;
  }>({
    queryKey: ["/api/admin/lemlem-insights"],
  });

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    values: settings
      ? {
          aiEnabled: settings.aiEnabled,
          monthlyBudgetUSD: settings.monthlyBudgetUSD,
          alertsEnabled: settings.alertsEnabled,
          alertThreshold: settings.alertThreshold,
        }
      : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: async (values: SettingsFormValues) => {
      return await apiRequest("POST", "/api/admin/platform-settings", values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/platform-settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/lemlem-insights"] });
      toast({
        title: "Settings updated",
        description: "AI control settings have been saved successfully.",
      });
      setIsEditing(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: SettingsFormValues) => {
    updateMutation.mutate(values);
  };

  if (isLoading || !settings) {
    return (
      <div className="min-h-screen bg-[#f9e9d8] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#CD7F32] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  const thisMonthCost = insights?.thisMonthCost || 0;
  const budgetUsed = (thisMonthCost / parseFloat(settings.monthlyBudgetUSD)) * 100;

  return (
    <div className="min-h-screen bg-[#f9e9d8]">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <BackButton />

        <div className="flex items-center gap-3 mb-8">
          <Settings className="h-8 w-8 text-[#CD7F32]" />
          <div>
            <h1 className="text-3xl font-bold text-[#2d1405]">AI Control Panel</h1>
            <p className="text-gray-600">Manage Lemlem AI settings and budget</p>
          </div>
        </div>

        {/* Current Status Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Current Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-[#f9e9d8] rounded-lg">
                {settings.aiEnabled ? (
                  <>
                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">AI Enabled</p>
                      <p className="text-sm text-green-700">Fallback active for complex questions</p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-10 w-10 text-yellow-600" />
                    <div>
                      <p className="font-medium text-yellow-900">AI Disabled</p>
                      <p className="text-sm text-yellow-700">Template-only responses</p>
                    </div>
                  </>
                )}
              </div>

              <div className="p-4 bg-[#f9e9d8] rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-[#CD7F32]" />
                  <p className="text-sm font-medium text-gray-600">This Month's Spend</p>
                </div>
                <p className="text-2xl font-bold text-[#2d1405]">${thisMonthCost.toFixed(2)}</p>
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>{budgetUsed.toFixed(1)}% of budget</span>
                    <span>${settings.monthlyBudgetUSD}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        budgetUsed > 90
                          ? "bg-red-500"
                          : budgetUsed > 80
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${Math.min(budgetUsed, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Form */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>AI Settings</CardTitle>
                <CardDescription>Configure Lemlem AI behavior and budget limits</CardDescription>
              </div>
              {!isEditing && (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  data-testid="button-edit-settings"
                >
                  Edit Settings
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* AI Enable/Disable */}
                <FormField
                  control={form.control}
                  name="aiEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="flex items-center gap-2 text-base">
                          <Sparkles className="h-5 w-5 text-[#CD7F32]" />
                          AI Fallback
                        </FormLabel>
                        <FormDescription>
                          Enable AI for complex questions that templates can't answer. Disabling saves
                          costs but reduces Lemlem's ability to help with unique requests.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={!isEditing}
                          data-testid="switch-ai-enabled"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Monthly Budget */}
                <FormField
                  control={form.control}
                  name="monthlyBudgetUSD"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-[#CD7F32]" />
                        Monthly AI Budget (USD)
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          min="0"
                          disabled={!isEditing}
                          data-testid="input-monthly-budget"
                        />
                      </FormControl>
                      <FormDescription>
                        Maximum amount to spend on AI responses per month. Lemlem will stop using AI
                        when this limit is reached.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Alerts Enabled */}
                <FormField
                  control={form.control}
                  name="alertsEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="flex items-center gap-2 text-base">
                          <Bell className="h-5 w-5 text-[#CD7F32]" />
                          Budget Alerts
                        </FormLabel>
                        <FormDescription>
                          Receive notifications when approaching your monthly budget limit
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={!isEditing}
                          data-testid="switch-alerts-enabled"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Alert Threshold */}
                <FormField
                  control={form.control}
                  name="alertThreshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-[#CD7F32]" />
                        Alert Threshold (%)
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="1"
                          max="100"
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          disabled={!isEditing}
                          data-testid="input-alert-threshold"
                        />
                      </FormControl>
                      <FormDescription>
                        Show budget warning when this percentage of your monthly budget is used
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {isEditing && (
                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      disabled={updateMutation.isPending}
                      data-testid="button-save-settings"
                    >
                      {updateMutation.isPending ? (
                        <>Saving...</>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        form.reset();
                        setIsEditing(false);
                      }}
                      disabled={updateMutation.isPending}
                      data-testid="button-cancel-edit"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Warning Card */}
        <Card className="mt-6 border-yellow-500 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-yellow-900 mb-1">Cost Saving Tip</p>
                <p className="text-sm text-yellow-700">
                  Encourage hosts to fill out Property Information Forms completely! The more info they
                  provide, the more questions Lemlem can answer with FREE templates instead of expensive
                  AI calls.
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
