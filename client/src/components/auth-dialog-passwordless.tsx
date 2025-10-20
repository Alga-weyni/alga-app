import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Phone, Mail } from "lucide-react";

// Passwordless schemas - OTP only
const requestPhoneOtpSchema = z.object({
  phoneNumber: z.string().regex(/^\+251[0-9]{9}$/, "Phone must be in format +251XXXXXXXXX"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

const requestEmailOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

const verifyOtpSchema = z.object({
  phoneNumber: z.string().optional(),
  email: z.string().optional(),
  otp: z.string().length(4, "OTP must be 4 digits"),
});

type RequestPhoneOtpData = z.infer<typeof requestPhoneOtpSchema>;
type RequestEmailOtpData = z.infer<typeof requestEmailOtpSchema>;
type VerifyOtpData = z.infer<typeof verifyOtpSchema>;

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: "login" | "register";
  redirectAfterAuth?: string;
}

export default function AuthDialog({ open, onOpenChange, defaultMode = "login", redirectAfterAuth }: AuthDialogProps) {
  const [mode, setMode] = useState<"login" | "register">(defaultMode);
  const [authMethod, setAuthMethod] = useState<"phone" | "email">("phone");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [pendingContact, setPendingContact] = useState(""); // phone or email
  const [devOtp, setDevOtp] = useState<string | undefined>();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Passwordless forms
  const phoneForm = useForm<RequestPhoneOtpData>({
    resolver: zodResolver(requestPhoneOtpSchema),
    defaultValues: { phoneNumber: "", firstName: "", lastName: "" },
  });

  const emailForm = useForm<RequestEmailOtpData>({
    resolver: zodResolver(requestEmailOtpSchema),
    defaultValues: { email: "", firstName: "", lastName: "" },
  });

  const otpForm = useForm<VerifyOtpData>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { phoneNumber: "", email: "", otp: "" },
  });

  useEffect(() => {
    if (open) {
      phoneForm.reset();
      emailForm.reset();
      otpForm.reset();
      setShowOtpInput(false);
      setPendingContact("");
      setDevOtp(undefined);
    }
  }, [open]);

  const switchMode = (newMode: "login" | "register") => {
    setMode(newMode);
    setShowOtpInput(false);
    setPendingContact("");
    setDevOtp(undefined);
    phoneForm.reset();
    emailForm.reset();
    otpForm.reset();
  };

  const handleAuthSuccess = (data: any) => {
    const user = data.user || data;
    
    // Use custom redirect if provided, otherwise use role-based redirect
    let redirectPath;
    if (redirectAfterAuth) {
      redirectPath = redirectAfterAuth;
    } else {
      // Role-based redirect
      if (user.role === "admin") {
        redirectPath = "/admin/dashboard";
      } else if (user.role === "operator") {
        redirectPath = "/operator/dashboard";
      } else if (user.role === "host") {
        redirectPath = "/host/dashboard";
      } else {
        redirectPath = "/properties";
      }
    }
    
    toast({
      title: mode === "login" ? "Welcome back!" : "Account created!",
      description: mode === "login" ? `Logged in as ${user.firstName} ${user.lastName}` : `Welcome to Alga, ${user.firstName}!`,
    });

    navigate(redirectPath);
    queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    onOpenChange(false);
  };

  // Request OTP for phone (login or register)
  const requestPhoneOtpMutation = useMutation({
    mutationFn: async (data: RequestPhoneOtpData) => {
      const endpoint = mode === "register" ? "/api/auth/request-otp/phone/register" : "/api/auth/request-otp/phone/login";
      return await apiRequest("POST", endpoint, data);
    },
    onSuccess: (data: any) => {
      setPendingContact(data.phoneNumber || data.contact);
      setShowOtpInput(true);
      setDevOtp(data.devOtp);
      otpForm.setValue("phoneNumber", data.phoneNumber || data.contact);
      toast({
        title: "OTP Sent",
        description: data.devOtp ? `Development OTP: ${data.devOtp}` : "Check your phone for the 4-digit code",
      });
    },
    onError: (error: any) => {
      toast({
        title: mode === "register" ? "Registration failed" : "Login failed",
        description: error.message || "Failed to send OTP",
        variant: "destructive",
      });
    },
  });

  // Request OTP for email (login or register)
  const requestEmailOtpMutation = useMutation({
    mutationFn: async (data: RequestEmailOtpData) => {
      const endpoint = mode === "register" ? "/api/auth/request-otp/email/register" : "/api/auth/request-otp/email/login";
      return await apiRequest("POST", endpoint, data);
    },
    onSuccess: (data: any) => {
      setPendingContact(data.email || data.contact);
      setShowOtpInput(true);
      setDevOtp(data.devOtp);
      otpForm.setValue("email", data.email || data.contact);
      toast({
        title: "OTP Sent",
        description: data.devOtp ? `Development OTP: ${data.devOtp}` : "Check your email for the 4-digit code",
      });
    },
    onError: (error: any) => {
      toast({
        title: mode === "register" ? "Registration failed" : "Login failed",
        description: error.message || "Failed to send OTP",
        variant: "destructive",
      });
    },
  });

  // OTP verification mutation
  const verifyOtpMutation = useMutation({
    mutationFn: async (data: VerifyOtpData) => {
      return await apiRequest("POST", "/api/auth/verify-otp", data);
    },
    onSuccess: handleAuthSuccess,
    onError: (error: any) => {
      toast({
        title: "Verification failed",
        description: error.message || "Invalid or expired OTP",
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-eth-warm-tan border-eth-brown/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-eth-brown">
            {showOtpInput ? "Verify OTP" : mode === "login" ? "Sign In" : "Create Account"}
          </DialogTitle>
          <DialogDescription className="text-eth-brown/70">
            {showOtpInput 
              ? `Enter the 4-digit code sent to ${pendingContact}` 
              : mode === "login" ? "Welcome back to Alga" : "Join Ethiopia's best rental platform"}
          </DialogDescription>
        </DialogHeader>

        {showOtpInput ? (
          <Form {...otpForm}>
            <form onSubmit={otpForm.handleSubmit((data) => verifyOtpMutation.mutate(data))} className="space-y-4">
              <FormField
                control={otpForm.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-eth-brown">4-Digit OTP</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="1234"
                        maxLength={4}
                        className="bg-white border-eth-brown/20 text-eth-brown text-center text-2xl tracking-widest"
                        data-testid="input-otp"
                        autoFocus
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {devOtp && (
                <div className="p-3 bg-yellow-100 border border-yellow-300 rounded-md">
                  <p className="text-sm text-yellow-800">Development Mode - OTP: <strong>{devOtp}</strong></p>
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowOtpInput(false);
                    setPendingContact("");
                    setDevOtp(undefined);
                  }}
                  className="flex-1 border-eth-brown text-eth-brown hover:bg-eth-brown hover:text-white"
                  data-testid="button-back"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={verifyOtpMutation.isPending}
                  className="flex-1 bg-eth-brown hover:bg-eth-brown/90 text-white"
                  data-testid="button-verify-otp"
                >
                  {verifyOtpMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <Tabs value={authMethod} onValueChange={(v) => setAuthMethod(v as "phone" | "email")} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-transparent gap-3 p-0">
              <TabsTrigger 
                value="phone" 
                className="
                  relative px-6 py-3 rounded-lg font-medium
                  transition-all duration-200 ease-in-out
                  border-2
                  data-[state=inactive]:bg-gradient-to-br data-[state=inactive]:from-eth-light-tan/30 data-[state=inactive]:to-eth-warm-tan/30
                  data-[state=inactive]:border-eth-brown/20
                  data-[state=inactive]:text-eth-brown/70
                  data-[state=inactive]:hover:border-eth-brown/30
                  data-[state=inactive]:hover:text-eth-brown
                  data-[state=inactive]:hover:shadow-sm
                  data-[state=inactive]:hover:scale-[1.02]
                  data-[state=active]:bg-eth-brown
                  data-[state=active]:border-transparent
                  data-[state=active]:text-white
                  data-[state=active]:shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]
                  data-[state=active]:shadow-eth-brown/40
                  focus:outline-none focus:ring-2 focus:ring-eth-brown/50 focus:ring-offset-2
                " 
                data-testid="tab-phone"
              >
                <Phone className="h-4 w-4 mr-2" />
                Phone
              </TabsTrigger>
              <TabsTrigger 
                value="email" 
                className="
                  relative px-6 py-3 rounded-lg font-medium
                  transition-all duration-200 ease-in-out
                  border-2
                  data-[state=inactive]:bg-gradient-to-br data-[state=inactive]:from-eth-light-tan/30 data-[state=inactive]:to-eth-warm-tan/30
                  data-[state=inactive]:border-eth-brown/20
                  data-[state=inactive]:text-eth-brown/70
                  data-[state=inactive]:hover:border-eth-brown/30
                  data-[state=inactive]:hover:text-eth-brown
                  data-[state=inactive]:hover:shadow-sm
                  data-[state=inactive]:hover:scale-[1.02]
                  data-[state=active]:bg-eth-brown
                  data-[state=active]:border-transparent
                  data-[state=active]:text-white
                  data-[state=active]:shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]
                  data-[state=active]:shadow-eth-brown/40
                  focus:outline-none focus:ring-2 focus:ring-eth-brown/50 focus:ring-offset-2
                " 
                data-testid="tab-email"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email
              </TabsTrigger>
            </TabsList>

            {/* Phone OTP Form */}
            <TabsContent value="phone" className="mt-6">
              <Form {...phoneForm}>
                <form onSubmit={phoneForm.handleSubmit((data) => requestPhoneOtpMutation.mutate(data))} className="space-y-4">
                  {mode === "register" && (
                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={phoneForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-eth-brown">First Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Abebe" className="bg-white border-eth-brown/20 text-eth-brown" data-testid="input-first-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={phoneForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-eth-brown">Last Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Kebede" className="bg-white border-eth-brown/20 text-eth-brown" data-testid="input-last-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                  
                  <FormField
                    control={phoneForm.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-eth-brown">Phone Number</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="+251912345678" 
                            className="bg-white border-eth-brown/20 text-eth-brown" 
                            data-testid="input-phone"
                            onChange={(e) => {
                              let value = e.target.value;
                              if (value && !value.startsWith('+')) {
                                value = '+' + value;
                              }
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <p className="text-xs text-eth-brown/60 mt-1">Format: +251XXXXXXXXX (9 digits after 251)</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={requestPhoneOtpMutation.isPending}
                    className="w-full bg-eth-brown hover:bg-eth-brown/90 text-white"
                    data-testid="button-send-otp"
                  >
                    {requestPhoneOtpMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {mode === "login" ? "Send OTP" : "Create Account & Send OTP"}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            {/* Email OTP Form */}
            <TabsContent value="email" className="mt-6">
              <Form {...emailForm}>
                <form onSubmit={emailForm.handleSubmit((data) => requestEmailOtpMutation.mutate(data))} className="space-y-4">
                  {mode === "register" && (
                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={emailForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-eth-brown">First Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Abebe" className="bg-white border-eth-brown/20 text-eth-brown" data-testid="input-first-name-email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={emailForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-eth-brown">Last Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Kebede" className="bg-white border-eth-brown/20 text-eth-brown" data-testid="input-last-name-email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                  
                  <FormField
                    control={emailForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-eth-brown">Email</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="email"
                            placeholder="abebe@example.com" 
                            className="bg-white border-eth-brown/20 text-eth-brown" 
                            data-testid="input-email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={requestEmailOtpMutation.isPending}
                    className="w-full bg-eth-brown hover:bg-eth-brown/90 text-white"
                    data-testid="button-send-otp-email"
                  >
                    {requestEmailOtpMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {mode === "login" ? "Send OTP" : "Create Account & Send OTP"}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        )}

        {/* Toggle Login/Register */}
        {!showOtpInput && (
          <div className="text-center text-sm mt-4">
            <span className="text-eth-brown/70">
              {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            </span>
            <button
              type="button"
              onClick={() => switchMode(mode === "login" ? "register" : "login")}
              className="text-eth-brown font-medium hover:underline"
              data-testid="button-toggle-mode"
            >
              {mode === "login" ? "Create Account" : "Sign In"}
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
