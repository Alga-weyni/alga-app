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
import { Loader2, TrendingUp, Clock, Banknote, QrCode, CheckCircle } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import Header from "@/components/header";

const agentRegistrationSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phoneNumber: z.string().min(10, "Valid phone number is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  paymentAccount: z.string().min(10, "Payment account is required"),
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
  const [isScanning, setIsScanning] = useState(false);
  const [scannedId, setScannedId] = useState<string | null>(null);

  const form = useForm<AgentRegistrationForm>({
    resolver: zodResolver(agentRegistrationSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      paymentMethod: "",
      paymentAccount: "",
      idNumber: "",
      businessName: "",
      city: "",
      subCity: "",
    },
  });

  const onSubmit = async (data: AgentRegistrationForm) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/agent/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Registration failed");
      }

      // Navigate immediately - no delay
      setLocation("/agent-dashboard");
      
      toast({
        title: "🎉 Application Submitted!",
        description: "Redirecting to your dashboard...",
      });
    } catch (error: any) {
      toast({
        title: "❌ Registration Failed",
        description: error.message || "Failed to submit application. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  const scanFaydaId = async () => {
    setIsScanning(true);
    try {
      const html5QrCode = new Html5Qrcode("qr-reader");
      
      const qrConfig = { fps: 10, qrbox: { width: 250, height: 250 } };
      
      await html5QrCode.start(
        { facingMode: "environment" },
        qrConfig,
        (decodedText) => {
          // Extract ID from Fayda QR code
          setScannedId(decodedText);
          form.setValue("idNumber", decodedText);
          
          toast({
            title: "✅ Fayda ID Scanned",
            description: "Your ID has been verified successfully!",
          });
          
          html5QrCode.stop();
          setIsScanning(false);
        },
        (errorMessage) => {
          // Scanning error - ignore
        }
      );
    } catch (error: any) {
      toast({
        title: "❌ Camera Error",
        description: "Unable to access camera. Please enter ID manually.",
        variant: "destructive",
      });
      setIsScanning(false);
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
    <>
      <Header />
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

          <Card className="border-medium-brown/20 dark:border-cream/20" data-testid="card-benefit-payouts">
            <CardHeader className="pb-3">
              <Banknote className="h-8 w-8 text-medium-brown dark:text-cream mb-2" />
              <CardTitle className="text-lg">Flexible Payouts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-medium-brown dark:text-cream/80">
                Get paid via TeleBirr, CBE Birr, M-Pesa, or HelloCash
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
                  <Label htmlFor="paymentMethod">Payment Method *</Label>
                  <Select
                    onValueChange={(value) => form.setValue("paymentMethod", value)}
                  >
                    <SelectTrigger data-testid="select-paymentMethod">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="telebirr">TeleBirr</SelectItem>
                      <SelectItem value="cbebirr">CBE Birr</SelectItem>
                      <SelectItem value="mpesa">M-Pesa</SelectItem>
                      <SelectItem value="awash">Awash Birr</SelectItem>
                      <SelectItem value="helloCash">HelloCash</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.paymentMethod && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.paymentMethod.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="paymentAccount">Payment Account *</Label>
                  <Input
                    id="paymentAccount"
                    data-testid="input-paymentAccount"
                    {...form.register("paymentAccount")}
                    placeholder="+251911234567"
                  />
                  {form.formState.errors.paymentAccount && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.paymentAccount.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="idNumber">Fayda ID Number (Optional)</Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      id="idNumber"
                      data-testid="input-idNumber"
                      {...form.register("idNumber")}
                      placeholder="ID or Passport Number"
                      value={scannedId || form.watch("idNumber") || ""}
                      onChange={(e) => form.setValue("idNumber", e.target.value)}
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={scanFaydaId}
                    disabled={isScanning}
                    variant="outline"
                    className="border-medium-brown text-medium-brown hover:bg-medium-brown/10"
                    data-testid="button-scan-fayda"
                  >
                    {isScanning ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : scannedId ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <QrCode className="h-4 w-4" />
                    )}
                    <span className="ml-2">
                      {isScanning ? "Scanning..." : scannedId ? "Verified" : "Scan Fayda"}
                    </span>
                  </Button>
                </div>
                {isScanning && (
                  <div id="qr-reader" className="mt-2 max-w-sm mx-auto"></div>
                )}
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
                  <li>2. Verify your identity with Fayda ID (optional)</li>
                  <li>3. List properties you know about or own</li>
                  <li>4. Earn 5% from every booking for 36 months from first rental</li>
                  <li>5. Get paid automatically to your chosen mobile money account</li>
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
    </>
  );
}
