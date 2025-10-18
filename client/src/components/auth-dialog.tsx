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

// Phone schemas
const loginPhoneSchema = z.object({
  phoneNumber: z.string().regex(/^\+251[0-9]{9}$/, "Phone must be in format +251XXXXXXXXX"),
  password: z.string().min(1, "Password is required"),
});

const registerPhoneSchema = z.object({
  phoneNumber: z.string().regex(/^\+251[0-9]{9}$/, "Phone must be in format +251XXXXXXXXX"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

const verifyOtpSchema = z.object({
  phoneNumber: z.string(),
  otp: z.string().length(4, "OTP must be 4 digits"),
});

// Email schemas
const loginEmailSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const registerEmailSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

type LoginPhoneData = z.infer<typeof loginPhoneSchema>;
type RegisterPhoneData = z.infer<typeof registerPhoneSchema>;
type VerifyOtpData = z.infer<typeof verifyOtpSchema>;
type LoginEmailData = z.infer<typeof loginEmailSchema>;
type RegisterEmailData = z.infer<typeof registerEmailSchema>;

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: "login" | "register";
  redirectAfterAuth?: string; // Optional redirect path after successful auth
}

export default function AuthDialog({ open, onOpenChange, defaultMode = "login", redirectAfterAuth }: AuthDialogProps) {
  const [mode, setMode] = useState<"login" | "register">(defaultMode);
  const [authMethod, setAuthMethod] = useState<"phone" | "email">("phone");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [pendingPhoneNumber, setPendingPhoneNumber] = useState("");
  const [devOtp, setDevOtp] = useState<string | undefined>();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Phone forms
  const loginPhoneForm = useForm<LoginPhoneData>({
    resolver: zodResolver(loginPhoneSchema),
    defaultValues: { phoneNumber: "", password: "" },
  });

  const registerPhoneForm = useForm<RegisterPhoneData>({
    resolver: zodResolver(registerPhoneSchema),
    defaultValues: { phoneNumber: "", password: "", firstName: "", lastName: "" },
  });

  const otpForm = useForm<VerifyOtpData>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { phoneNumber: "", otp: "" },
  });

  // Email forms
  const loginEmailForm = useForm<LoginEmailData>({
    resolver: zodResolver(loginEmailSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerEmailForm = useForm<RegisterEmailData>({
    resolver: zodResolver(registerEmailSchema),
    defaultValues: { email: "", password: "", firstName: "", lastName: "" },
  });

  useEffect(() => {
    if (open) {
      loginPhoneForm.reset();
      registerPhoneForm.reset();
      loginEmailForm.reset();
      registerEmailForm.reset();
      otpForm.reset();
      setShowOtpInput(false);
      setPendingPhoneNumber("");
      setDevOtp(undefined);
    }
  }, [open]);

  const switchMode = (newMode: "login" | "register") => {
    setMode(newMode);
    setShowOtpInput(false);
    setPendingPhoneNumber("");
    setDevOtp(undefined);
    loginPhoneForm.reset();
    registerPhoneForm.reset();
    loginEmailForm.reset();
    registerEmailForm.reset();
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
        redirectPath = "/";
      }
    }
    
    toast({
      title: mode === "login" ? "Welcome back!" : "Account created!",
      description: mode === "login" ? `Logged in as ${user.firstName} ${user.lastName}` : `Welcome to Ethiopia Stays, ${user.firstName}!`,
    });

    navigate(redirectPath);
    queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    onOpenChange(false);
  };

  // Phone registration mutation
  const registerPhoneMutation = useMutation({
    mutationFn: async (data: RegisterPhoneData) => {
      return await apiRequest("POST", "/api/auth/register/phone", data);
    },
    onSuccess: (data: any) => {
      setPendingPhoneNumber(data.phoneNumber);
      setShowOtpInput(true);
      setDevOtp(data.devOtp);
      otpForm.setValue("phoneNumber", data.phoneNumber);
      toast({
        title: "OTP Sent",
        description: data.devOtp ? `Development OTP: ${data.devOtp}` : "Check your phone for the verification code",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message || "Failed to register",
        variant: "destructive",
      });
    },
  });

  // Phone login mutation
  const loginPhoneMutation = useMutation({
    mutationFn: async (data: LoginPhoneData) => {
      return await apiRequest("POST", "/api/auth/login/phone", data);
    },
    onSuccess: (data: any) => {
      setPendingPhoneNumber(data.phoneNumber);
      setShowOtpInput(true);
      setDevOtp(data.devOtp);
      otpForm.setValue("phoneNumber", data.phoneNumber);
      toast({
        title: "OTP Sent",
        description: data.devOtp ? `Development OTP: ${data.devOtp}` : "Check your phone for the verification code",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid phone number or password",
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

  // Email registration mutation
  const registerEmailMutation = useMutation({
    mutationFn: async (data: RegisterEmailData) => {
      return await apiRequest("POST", "/api/auth/register/email", data);
    },
    onSuccess: handleAuthSuccess,
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message || "Failed to register",
        variant: "destructive",
      });
    },
  });

  // Email login mutation
  const loginEmailMutation = useMutation({
    mutationFn: async (data: LoginEmailData) => {
      return await apiRequest("POST", "/api/auth/login/email", data);
    },
    onSuccess: handleAuthSuccess,
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password",
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
            {showOtpInput ? "Enter the 4-digit code sent to your phone" : mode === "login" ? "Welcome back to Ethiopia Stays" : "Join our community"}
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
                        className="bg-white border-eth-brown/20 text-eth-brown"
                        data-testid="input-otp"
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
                    setPendingPhoneNumber("");
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
                  className="flex-1 bg-eth-orange hover:bg-eth-orange/90 text-white"
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
                  data-[state=active]:bg-eth-orange
                  data-[state=active]:border-transparent
                  data-[state=active]:text-white
                  data-[state=active]:shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]
                  data-[state=active]:shadow-eth-orange/40
                  focus:outline-none focus:ring-2 focus:ring-eth-orange/50 focus:ring-offset-2
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
                  data-[state=active]:bg-eth-orange
                  data-[state=active]:border-transparent
                  data-[state=active]:text-white
                  data-[state=active]:shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]
                  data-[state=active]:shadow-eth-orange/40
                  focus:outline-none focus:ring-2 focus:ring-eth-orange/50 focus:ring-offset-2
                " 
                data-testid="tab-email"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email
              </TabsTrigger>
            </TabsList>

            <TabsContent value="phone" className="mt-6">
              {mode === "login" ? (
                <Form {...loginPhoneForm}>
                  <form onSubmit={loginPhoneForm.handleSubmit((data) => loginPhoneMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={loginPhoneForm.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-eth-brown">Phone Number</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="+251912345678" 
                              className="bg-white border-eth-brown/20 text-eth-brown" 
                              data-testid="input-phone-login"
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
                    <FormField
                      control={loginPhoneForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-eth-brown">Password</FormLabel>
                          <FormControl>
                            <Input {...field} type="password" className="bg-white border-eth-brown/20 text-eth-brown" data-testid="input-password-login" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={loginPhoneMutation.isPending} className="w-full bg-eth-orange hover:bg-eth-orange/90 text-white" data-testid="button-phone-login">
                      {loginPhoneMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue"}
                    </Button>
                  </form>
                </Form>
              ) : (
                <Form {...registerPhoneForm}>
                  <form onSubmit={registerPhoneForm.handleSubmit((data) => registerPhoneMutation.mutate(data))} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={registerPhoneForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-eth-brown">First Name</FormLabel>
                            <FormControl>
                              <Input {...field} className="bg-white border-eth-brown/20 text-eth-brown" data-testid="input-firstname-register" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerPhoneForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-eth-brown">Last Name</FormLabel>
                            <FormControl>
                              <Input {...field} className="bg-white border-eth-brown/20 text-eth-brown" data-testid="input-lastname-register" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={registerPhoneForm.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-eth-brown">Phone Number</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="+251912345678" 
                              className="bg-white border-eth-brown/20 text-eth-brown" 
                              data-testid="input-phone-register"
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
                    <FormField
                      control={registerPhoneForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-eth-brown">Password</FormLabel>
                          <FormControl>
                            <Input {...field} type="password" className="bg-white border-eth-brown/20 text-eth-brown" data-testid="input-password-register" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={registerPhoneMutation.isPending} className="w-full bg-eth-orange hover:bg-eth-orange/90 text-white" data-testid="button-phone-register">
                      {registerPhoneMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account"}
                    </Button>
                  </form>
                </Form>
              )}
            </TabsContent>

            <TabsContent value="email" className="mt-6">
              {mode === "login" ? (
                <Form {...loginEmailForm}>
                  <form onSubmit={loginEmailForm.handleSubmit((data) => loginEmailMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={loginEmailForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-eth-brown">Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" className="bg-white border-eth-brown/20 text-eth-brown" data-testid="input-email-login" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginEmailForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-eth-brown">Password</FormLabel>
                          <FormControl>
                            <Input {...field} type="password" className="bg-white border-eth-brown/20 text-eth-brown" data-testid="input-password-email-login" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={loginEmailMutation.isPending} className="w-full bg-eth-orange hover:bg-eth-orange/90 text-white" data-testid="button-email-login">
                      {loginEmailMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
                    </Button>
                  </form>
                </Form>
              ) : (
                <Form {...registerEmailForm}>
                  <form onSubmit={registerEmailForm.handleSubmit((data) => registerEmailMutation.mutate(data))} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={registerEmailForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-eth-brown">First Name</FormLabel>
                            <FormControl>
                              <Input {...field} className="bg-white border-eth-brown/20 text-eth-brown" data-testid="input-firstname-email-register" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerEmailForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-eth-brown">Last Name</FormLabel>
                            <FormControl>
                              <Input {...field} className="bg-white border-eth-brown/20 text-eth-brown" data-testid="input-lastname-email-register" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={registerEmailForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-eth-brown">Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" className="bg-white border-eth-brown/20 text-eth-brown" data-testid="input-email-register" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerEmailForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-eth-brown">Password</FormLabel>
                          <FormControl>
                            <Input {...field} type="password" className="bg-white border-eth-brown/20 text-eth-brown" data-testid="input-password-email-register" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={registerEmailMutation.isPending} className="w-full bg-eth-orange hover:bg-eth-orange/90 text-white" data-testid="button-email-register">
                      {registerEmailMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account"}
                    </Button>
                  </form>
                </Form>
              )}
            </TabsContent>
          </Tabs>
        )}

        {!showOtpInput && (
          <div className="mt-4 text-center">
            <p className="text-sm text-eth-brown/70">
              {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={() => switchMode(mode === "login" ? "register" : "login")}
                className="text-eth-orange hover:underline font-medium"
                data-testid="button-switch-mode"
              >
                {mode === "login" ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
