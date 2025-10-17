import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { CheckCircle, Home } from "lucide-react";

const hostRegisterSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phoneNumber: z.string().min(10, "Valid phone number is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type HostRegisterFormData = z.infer<typeof hostRegisterSchema>;

export default function StartHosting() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const form = useForm<HostRegisterFormData>({
    resolver: zodResolver(hostRegisterSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: HostRegisterFormData) => {
      const { confirmPassword, ...registerData } = data;
      return await apiRequest("POST", "/api/register", registerData);
    },
    onSuccess: (user: any) => {
      console.log("Host registration success - user data:", user);
      
      toast({
        title: "Welcome to Ethiopia Stays!",
        description: `Your account has been created successfully, ${user.firstName}! An admin will review your account to enable hosting privileges.`,
      });
      
      // Redirect based on role (new registrations are "guest" by default)
      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else if (user.role === "operator") {
        navigate("/operator/dashboard");
      } else if (user.role === "host") {
        navigate("/host/dashboard");
      } else {
        // Guest/Tenant goes to home page
        navigate("/");
      }
      
      // Update auth state
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message || "Unable to create account",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: HostRegisterFormData) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex flex-col bg-eth-warm-tan">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-eth-brown mb-4">
              Start Hosting with Ethiopia Stays
            </h1>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Share your property with travelers and earn income while showcasing Ethiopian hospitality
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Benefits Section */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-2xl text-eth-brown">Why Host with Us?</CardTitle>
                <CardDescription>Join thousands of successful guesthouse owners across Ethiopia</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-eth-green mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-eth-brown">Earn Extra Income</h3>
                    <p className="text-gray-600">List your property and start earning from day one</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-eth-yellow mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-eth-brown">Full Control</h3>
                    <p className="text-gray-600">Set your own prices, availability, and house rules</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-eth-red mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-eth-brown">Verified Guests</h3>
                    <p className="text-gray-600">All guests are ID-verified for your safety and peace of mind</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-eth-green mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-eth-brown">24/7 Support</h3>
                    <p className="text-gray-600">Get help anytime in Amharic or English</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-eth-yellow mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-eth-brown">Easy Payment</h3>
                    <p className="text-gray-600">Receive payments via Telebirr, CBE Birr, or bank transfer</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Registration Form */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-2xl text-eth-brown">Create Your Host Account</CardTitle>
                <CardDescription>Fill in your details to get started</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter your first name" 
                                {...field}
                                data-testid="input-firstname-host"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter your last name" 
                                {...field}
                                data-testid="input-lastname-host"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <Input 
                            type="email" 
                            placeholder="your@email.com"
                            autoComplete="off"
                            value={field.value || ""}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                            data-testid="input-email-host"
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input 
                              type="tel" 
                              placeholder="+251 9XX XXX XXX" 
                              {...field}
                              data-testid="input-phone-host"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Minimum 8 characters" 
                              {...field}
                              data-testid="input-password-host"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Re-enter your password" 
                              {...field}
                              data-testid="input-confirmpassword-host"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full bg-eth-orange hover:opacity-90 text-white"
                      disabled={registerMutation.isPending}
                      data-testid="button-create-host-account"
                    >
                      {registerMutation.isPending ? "Creating Account..." : "Create Host Account"}
                    </Button>

                    <p className="text-sm text-gray-600 text-center">
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="text-eth-orange hover:underline font-medium"
                      >
                        Sign in here
                      </button>
                    </p>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Additional Info Section */}
          <div className="mt-12 bg-white rounded-lg p-8">
            <h2 className="text-2xl font-bold text-eth-brown mb-6 text-center">
              How It Works
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-eth-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-eth-green">1</span>
                </div>
                <h3 className="font-semibold text-eth-brown mb-2">Create Your Account</h3>
                <p className="text-gray-600">Sign up and verify your identity</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-eth-yellow/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-eth-yellow">2</span>
                </div>
                <h3 className="font-semibold text-eth-brown mb-2">List Your Property</h3>
                <p className="text-gray-600">Add photos, set prices, and describe your space</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-eth-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-eth-red">3</span>
                </div>
                <h3 className="font-semibold text-eth-brown mb-2">Welcome Guests</h3>
                <p className="text-gray-600">Start earning and hosting travelers</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
