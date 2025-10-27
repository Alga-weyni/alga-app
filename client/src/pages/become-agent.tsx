import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, TrendingUp, Clock, Banknote } from "lucide-react";

const agentRegistrationSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phoneNumber: z.string().min(10, "Valid phone number is required"),
  telebirrAccount: z.string().min(10, "TeleBirr account is required"),
  idNumber: z.string().optional(),
  businessName: z.string().optional(),
  city: z.string().min(1, "City is required"),
  subCity: z.string().optional(),
});

type AgentRegistrationForm = z.infer<typeof agentRegistrationSchema>;

export default function BecomeAgent() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AgentRegistrationForm>({
    resolver: zodResolver(agentRegistrationSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      telebirrAccount: "",
      idNumber: "",
      businessName: "",
      city: "",
      subCity: "",
    },
  });

  const onSubmit = async (data: AgentRegistrationForm) => {
    setIsSubmitting(true);
    try {
      await apiRequest({
        method: "POST",
        url: "/api/agent/register",
        data,
      });

      toast({
        title: "🎉 Application Submitted!",
        description: "Your agent application is under review. We'll notify you once verified.",
      });

      setTimeout(() => {
        setLocation("/agent-dashboard");
      }, 2000);
    } catch (error: any) {
      toast({
        title: "❌ Registration Failed",
        description: error.message || "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const ethiopianCities = [
    "Addis Ababa",
    "Dire Dawa",
    "Mekelle",
    "Gondar",
    "Bahir Dar",
    "Hawassa",
    "Jimma",
    "Adama",
    "Harar",
    "Dessie",
    "Arba Minch",
    "Axum",
    "Lalibela",
  ];

  return (
    <div className="min-h-screen bg-cream/30 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-dark-brown dark:text-cream mb-4">
            💼 Become a Delala Agent
          </h1>
          <p className="text-lg text-medium-brown dark:text-cream/80 mb-6">
            List properties once, earn commissions for 3 years. Join Ethiopia's property revolution!
          </p>
        </div>

        {/* Benefits Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="border-medium-brown/20 dark:border-cream/20" data-testid="card-benefit-recurring">
            <CardHeader className="pb-3">
              <TrendingUp className="h-8 w-8 text-medium-brown dark:text-cream mb-2" />
              <CardTitle className="text-lg">Recurring Income</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-medium-brown dark:text-cream/80">
                Earn 5% from every booking for 36 months from first rental
              </p>
            </CardContent>
          </Card>

          <Card className="border-medium-brown/20 dark:border-cream/20" data-testid="card-benefit-passive">
            <CardHeader className="pb-3">
              <Clock className="h-8 w-8 text-medium-brown dark:text-cream mb-2" />
              <CardTitle className="text-lg">Passive Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-medium-brown dark:text-cream/80">
                List once, earn many times. No ongoing work required!
              </p>
            </CardContent>
          </Card>

          <Card className="border-medium-brown/20 dark:border-cream/20" data-testid="card-benefit-telebirr">
            <CardHeader className="pb-3">
              <Banknote className="h-8 w-8 text-medium-brown dark:text-cream mb-2" />
              <CardTitle className="text-lg">TeleBirr Payouts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-medium-brown dark:text-cream/80">
                Instant commission payments directly to your TeleBirr account
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Registration Form */}
        <Card className="border-medium-brown/20 dark:border-cream/20">
          <CardHeader>
            <CardTitle className="text-2xl">Agent Registration</CardTitle>
            <CardDescription>
              Complete this form to start earning commissions from property listings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    data-testid="input-fullName"
                    {...form.register("fullName")}
                    placeholder="Abebe Kebede"
                  />
                  {form.formState.errors.fullName && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.fullName.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    data-testid="input-phoneNumber"
                    {...form.register("phoneNumber")}
                    placeholder="+251911234567"
                  />
                  {form.formState.errors.phoneNumber && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.phoneNumber.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="telebirrAccount">TeleBirr Account *</Label>
                  <Input
                    id="telebirrAccount"
                    data-testid="input-telebirrAccount"
                    {...form.register("telebirrAccount")}
                    placeholder="+251911234567"
                  />
                  {form.formState.errors.telebirrAccount && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.telebirrAccount.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="idNumber">ID Number (Optional)</Label>
                  <Input
                    id="idNumber"
                    data-testid="input-idNumber"
                    {...form.register("idNumber")}
                    placeholder="ID or Passport Number"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Select
                    onValueChange={(value) => form.setValue("city", value)}
                  >
                    <SelectTrigger data-testid="select-city">
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {ethiopianCities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.city && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.city.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="subCity">Sub-City (Optional)</Label>
                  <Input
                    id="subCity"
                    data-testid="input-subCity"
                    {...form.register("subCity")}
                    placeholder="e.g., Bole, Kirkos"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="businessName">Business Name (Optional)</Label>
                <Input
                  id="businessName"
                  data-testid="input-businessName"
                  {...form.register("businessName")}
                  placeholder="Your real estate business name"
                />
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-semibold text-dark-brown dark:text-cream mb-2">
                  📋 How It Works
                </h4>
                <ol className="space-y-1 text-sm text-medium-brown dark:text-cream/80">
                  <li>1. Submit this application (instant approval for verified users)</li>
                  <li>2. List properties you know about or own</li>
                  <li>3. Earn 5% from every booking for 36 months from first rental</li>
                  <li>4. Get paid automatically to your TeleBirr account</li>
                </ol>
              </div>

              <Button
                type="submit"
                className="w-full bg-medium-brown hover:bg-dark-brown dark:bg-cream dark:hover:bg-cream/90 dark:text-dark-brown"
                disabled={isSubmitting}
                data-testid="button-submit"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "🚀 Submit Application"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
