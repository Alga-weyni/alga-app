import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { 
  DollarSign, 
  ShieldCheck, 
  Zap,
  Sparkles,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import AuthDialog from "@/components/auth-dialog-passwordless";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ETHIOPIAN_CITIES } from "@/lib/constants";

const SERVICE_CATEGORIES = [
  { id: "cleaning", name: "Cleaning", icon: "🧹", description: "Professional home and property cleaning" },
  { id: "laundry", name: "Laundry", icon: "👕", description: "Laundry and garment care services" },
  { id: "transport", name: "Drivers & Transport", icon: "🚗", description: "Airport pickup, tours, and daily drivers" },
  { id: "electrical", name: "Electrical", icon: "⚡", description: "Electrical repairs and installations" },
  { id: "plumbing", name: "Plumbing", icon: "🔧", description: "Plumbing fixes and maintenance" },
  { id: "carpentry", name: "Carpentry", icon: "🪚", description: "Furniture and woodwork services" },
  { id: "meal_support", name: "Meal Support", icon: "🍽️", description: "Meal prep and catering services" },
  { id: "guest_support", name: "Guest Support", icon: "🤝", description: "Welcome packs and concierge services" },
];

export default function BecomeProvider() {
  const { user } = useAuth();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    businessName: "",
    serviceType: "",
    city: "",
    description: "",
    phoneNumber: user?.phoneNumber || "",
  });

  // Update phone when user changes
  useEffect(() => {
    if (user?.phoneNumber) {
      setFormData(prev => ({ ...prev, phoneNumber: user.phoneNumber || "" }));
    }
  }, [user]);

  // Auto-redirect after login if ID not verified
  useEffect(() => {
    if (user && !user.idVerified && !authDialogOpen && showApplicationForm) {
      toast({
        title: "ID Verification Required",
        description: "Please verify your identity to complete your application.",
      });
      setLocation("/scan-id");
    }
  }, [user, setLocation, toast, authDialogOpen, showApplicationForm]);

  const applicationMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest("POST", "/api/service-provider-applications", data);
    },
    onSuccess: () => {
      toast({
        title: "🎉 Application Received!",
        description: "Our team will review and get back within 24 hours.",
        duration: 5000,
      });
      setShowApplicationForm(false);
      setFormData({
        businessName: "",
        serviceType: "",
        city: "",
        description: "",
        phoneNumber: user?.phoneNumber || "",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleStartApplication = () => {
    if (!user) {
      setAuthDialogOpen(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (!user.idVerified) {
      toast({
        title: "ID Verification Required",
        description: "Please verify your identity first.",
      });
      setLocation("/scan-id");
    } else {
      setShowApplicationForm(true);
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 100);
    }
  };

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.businessName || !formData.serviceType || !formData.city || !formData.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    applicationMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#faf8f6] via-[#f5ece3] to-[#faf5f0]">
      <Header />
      
      <AuthDialog 
        open={authDialogOpen} 
        onOpenChange={setAuthDialogOpen}
      />
      
      <div className="pt-24 pb-20">
        {/* Hero Section - Simplified & Emotional */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block mb-6">
              <Sparkles className="h-12 w-12 text-eth-orange mx-auto mb-4" />
            </div>
            
            <h1 
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-eth-brown mb-6 leading-tight"
              style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
              data-testid="heading-become-provider"
            >
              Earn. Connect. Grow<br />with Alga Services.
            </h1>
            
            <p className="text-xl md:text-2xl text-eth-brown/70 mb-12 max-w-2xl mx-auto leading-relaxed">
              Join Ethiopia's trusted network of verified local professionals.
            </p>

            {/* Benefits Strip - Simplified */}
            <div className="flex flex-col sm:flex-row justify-center gap-8 mb-16 max-w-3xl mx-auto">
              <div className="flex items-center gap-3 justify-center">
                <div className="w-12 h-12 bg-gradient-to-br from-eth-orange to-eth-brown rounded-full flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-eth-brown">Earn More</p>
                  <p className="text-sm text-eth-brown/60">85% payout</p>
                </div>
              </div>

              <div className="flex items-center gap-3 justify-center">
                <div className="w-12 h-12 bg-gradient-to-br from-eth-orange to-eth-brown rounded-full flex items-center justify-center">
                  <ShieldCheck className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-eth-brown">Verified Badge</p>
                  <p className="text-sm text-eth-brown/60">Build trust</p>
                </div>
              </div>

              <div className="flex items-center gap-3 justify-center">
                <div className="w-12 h-12 bg-gradient-to-br from-eth-orange to-eth-brown rounded-full flex items-center justify-center">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-eth-brown">Fast Payments</p>
                  <p className="text-sm text-eth-brown/60">Within 24 hours</p>
                </div>
              </div>
            </div>

            {/* Single CTA */}
            {!showApplicationForm && (
              <Button
                onClick={handleStartApplication}
                size="lg"
                className="bg-eth-brown hover:bg-eth-brown/90 text-white rounded-full px-12 py-6 font-bold text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105"
                data-testid="button-start-application"
              >
                Start Application
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            )}
          </div>
        </section>

        {/* Service Categories - 8 Categories, Reduced Density */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-eth-brown text-center mb-12" style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}>
              Choose Your Service Category
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {SERVICE_CATEGORIES.map((service) => (
                <Card 
                  key={service.id} 
                  className="bg-white hover:shadow-lg transition-all duration-200 border-0 hover:scale-105 cursor-pointer"
                  data-testid={`card-service-${service.id}`}
                >
                  <CardContent className="p-8 text-center">
                    <div className="text-5xl mb-4">{service.icon}</div>
                    <h3 className="font-bold text-lg text-eth-brown mb-2">{service.name}</h3>
                    <p className="text-sm text-eth-brown/60">{service.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Inline Application Form - Reveals on CTA Click */}
        {showApplicationForm && (
          <section className="py-16 px-6 animate-in slide-in-from-bottom duration-500">
            <div className="max-w-2xl mx-auto">
              <Card className="bg-white shadow-2xl border-0">
                <CardContent className="p-10">
                  <div className="text-center mb-8">
                    <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold text-eth-brown mb-2" style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}>
                      Service Provider Application
                    </h2>
                    <p className="text-eth-brown/70">Tell us about your business</p>
                  </div>

                  <form onSubmit={handleSubmitApplication} className="space-y-6">
                    <div>
                      <Label htmlFor="businessName" className="text-eth-brown font-medium">
                        Business Name *
                      </Label>
                      <Input
                        id="businessName"
                        value={formData.businessName}
                        onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                        placeholder="e.g., Addis Professional Cleaning"
                        className="mt-2"
                        data-testid="input-business-name"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="serviceType" className="text-eth-brown font-medium">
                        Service Category *
                      </Label>
                      <Select 
                        value={formData.serviceType} 
                        onValueChange={(value) => setFormData({ ...formData, serviceType: value })}
                        required
                      >
                        <SelectTrigger className="mt-2" data-testid="select-service-type">
                          <SelectValue placeholder="Select a service category" />
                        </SelectTrigger>
                        <SelectContent>
                          {SERVICE_CATEGORIES.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.icon} {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="city" className="text-eth-brown font-medium">
                        Service City *
                      </Label>
                      <Select 
                        value={formData.city} 
                        onValueChange={(value) => setFormData({ ...formData, city: value })}
                        required
                      >
                        <SelectTrigger className="mt-2" data-testid="select-city">
                          <SelectValue placeholder="Select your city" />
                        </SelectTrigger>
                        <SelectContent>
                          {ETHIOPIAN_CITIES.map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="phoneNumber" className="text-eth-brown font-medium">
                        Phone Number *
                      </Label>
                      <Input
                        id="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        placeholder="+251 9XX XXX XXX"
                        className="mt-2"
                        data-testid="input-phone"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="description" className="text-eth-brown font-medium">
                        About Your Service *
                      </Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe your experience, specialties, and what makes your service unique..."
                        className="mt-2 min-h-32"
                        data-testid="textarea-description"
                        required
                      />
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowApplicationForm(false)}
                        className="flex-1"
                        data-testid="button-cancel"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={applicationMutation.isPending}
                        className="flex-1 bg-eth-brown hover:bg-eth-brown/90 text-white"
                        data-testid="button-submit-application"
                      >
                        {applicationMutation.isPending ? "Submitting..." : "Submit Application"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* How It Works - Simplified, More Breathing Space */}
        {!showApplicationForm && (
          <section className="py-20 px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-eth-brown text-center mb-16" style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}>
                How It Works
              </h2>

              <div className="space-y-8">
                {[
                  {
                    step: "1",
                    title: "Apply & Verify",
                    description: "Submit your application and verify your ID. We'll review within 24 hours."
                  },
                  {
                    step: "2",
                    title: "Set Your Prices",
                    description: "Create your profile with rates, availability, and service area."
                  },
                  {
                    step: "3",
                    title: "Get Bookings",
                    description: "Receive requests from guests staying at Alga properties."
                  },
                  {
                    step: "4",
                    title: "Deliver & Get Paid",
                    description: "Complete service, get reviewed, receive payment within 24 hours."
                  }
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-6 bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 bg-gradient-to-br from-eth-orange to-eth-brown rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-xl">{item.step}</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-eth-brown mb-2">{item.title}</h3>
                      <p className="text-eth-brown/70 text-lg">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>

      <Footer />
    </div>
  );
}
