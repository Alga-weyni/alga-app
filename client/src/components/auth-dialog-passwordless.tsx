import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Phone, Mail, Eye, EyeOff, Lock, ArrowLeft } from "lucide-react";

// Password validation for INSA compliance
const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Must contain at least one uppercase letter")
  .regex(/[a-z]/, "Must contain at least one lowercase letter")
  .regex(/[0-9]/, "Must contain at least one number")
  .regex(/[!@#$%^&*(),.?":{}|<>]/, "Must contain at least one special character");

// Phone login with password (INSA 2FA)
const phoneLoginSchema = z.object({
  phoneNumber: z.string().length(10, "Phone number must be exactly 10 digits").regex(/^09[0-9]{8}$/, "Phone must start with 09 and be 10 digits"),
  password: z.string().min(1, "Password is required"),
});

// Phone registration with password
const phoneRegisterSchema = z.object({
  phoneNumber: z.string().length(10, "Phone number must be exactly 10 digits").regex(/^09[0-9]{8}$/, "Phone must start with 09 and be 10 digits"),
  password: passwordSchema,
  confirmPassword: z.string(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Email login with password (INSA 2FA)
const emailLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Email registration with password
const emailRegisterSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: passwordSchema,
  confirmPassword: z.string(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// OTP verification
const verifyOtpSchema = z.object({
  phoneNumber: z.string().optional(),
  email: z.string().optional(),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

// Forgot password - request OTP
const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// Reset password - with OTP and new password
const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().length(6, "OTP must be 6 digits"),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PhoneLoginData = z.infer<typeof phoneLoginSchema>;
type PhoneRegisterData = z.infer<typeof phoneRegisterSchema>;
type EmailLoginData = z.infer<typeof emailLoginSchema>;
type EmailRegisterData = z.infer<typeof emailRegisterSchema>;
type VerifyOtpData = z.infer<typeof verifyOtpSchema>;
type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;
type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: "login" | "register";
  redirectAfterAuth?: string;
}

export default function AuthDialog({ open, onOpenChange, defaultMode = "login", redirectAfterAuth }: AuthDialogProps) {
  const [mode, setMode] = useState<"login" | "register" | "forgot-password" | "reset-password">(defaultMode);
  const [authMethod, setAuthMethod] = useState<"phone" | "email">("email");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [pendingContact, setPendingContact] = useState("");
  const [devOtp, setDevOtp] = useState<string | undefined>();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Login forms (with password)
  const phoneLoginForm = useForm<PhoneLoginData>({
    resolver: zodResolver(phoneLoginSchema),
    defaultValues: { phoneNumber: "", password: "" },
  });

  const emailLoginForm = useForm<EmailLoginData>({
    resolver: zodResolver(emailLoginSchema),
    defaultValues: { email: "", password: "" },
  });

  // Registration forms (with password)
  const phoneRegisterForm = useForm<PhoneRegisterData>({
    resolver: zodResolver(phoneRegisterSchema),
    defaultValues: { phoneNumber: "", password: "", confirmPassword: "", firstName: "", lastName: "" },
  });

  const emailRegisterForm = useForm<EmailRegisterData>({
    resolver: zodResolver(emailRegisterSchema),
    defaultValues: { email: "", password: "", confirmPassword: "", firstName: "", lastName: "" },
  });

  // OTP form
  const otpForm = useForm<VerifyOtpData>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { phoneNumber: "", email: "", otp: "" },
  });

  // Forgot password form
  const forgotPasswordForm = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  // Reset password form
  const resetPasswordForm = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: "", otp: "", newPassword: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (open) {
      phoneLoginForm.reset();
      emailLoginForm.reset();
      phoneRegisterForm.reset();
      emailRegisterForm.reset();
      otpForm.reset();
      forgotPasswordForm.reset();
      resetPasswordForm.reset();
      setShowOtpInput(false);
      setPendingContact("");
      setDevOtp(undefined);
      setShowPassword(false);
      setShowConfirmPassword(false);
      setShowNewPassword(false);
      setMode(defaultMode);
    }
  }, [open]);

  const switchMode = (newMode: "login" | "register" | "forgot-password" | "reset-password") => {
    setMode(newMode);
    setShowOtpInput(false);
    setPendingContact("");
    setDevOtp(undefined);
    phoneLoginForm.reset();
    emailLoginForm.reset();
    phoneRegisterForm.reset();
    emailRegisterForm.reset();
    otpForm.reset();
    forgotPasswordForm.reset();
    resetPasswordForm.reset();
  };

  const handleAuthSuccess = (data: any) => {
    const user = data.user || data;
    
    let redirectPath = data.redirect;
    
    if (!redirectPath && redirectAfterAuth) {
      redirectPath = redirectAfterAuth;
    }
    
    if (!redirectPath) {
      if (user.role === "admin") {
        redirectPath = "/admin/dashboard";
      } else if (user.role === "operator") {
        redirectPath = "/operator/dashboard";
      } else if (user.role === "host") {
        redirectPath = "/host/dashboard";
      } else if (user.role === "agent") {
        redirectPath = "/agent-dashboard";
      } else if (user.role === "service_provider") {
        redirectPath = "/provider/dashboard";
      } else {
        redirectPath = "/properties";
      }
    }
    
    toast({
      title: mode === "login" ? "Welcome back!" : "Account created!",
      description: mode === "login" ? `Logged in as ${user.firstName} ${user.lastName}` : `Welcome to Alga, ${user.firstName}!`,
    });

    onOpenChange(false);
    queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    
    setTimeout(() => {
      window.location.href = redirectPath;
    }, 300);
  };

  // Phone Login with Password (Step 1: verify password, get OTP)
  const phoneLoginMutation = useMutation({
    mutationFn: async (data: PhoneLoginData) => {
      return await apiRequest("POST", "/api/auth/login/phone", data);
    },
    onSuccess: (data: any) => {
      setPendingContact(data.phoneNumber || data.contact);
      setShowOtpInput(true);
      const otpCode = data.testOtp || data.devOtp;
      setDevOtp(otpCode);
      otpForm.setValue("phoneNumber", data.phoneNumber || data.contact);
      toast({
        title: "Password verified!",
        description: otpCode ? `Test OTP: ${otpCode}` : "Check your phone for the 6-digit code",
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

  // Email Login with Password (Step 1: verify password, get OTP)
  const emailLoginMutation = useMutation({
    mutationFn: async (data: EmailLoginData) => {
      return await apiRequest("POST", "/api/auth/login/email", data);
    },
    onSuccess: (data: any) => {
      setPendingContact(data.email || data.contact);
      setShowOtpInput(true);
      const otpCode = data.testOtp || data.devOtp;
      setDevOtp(otpCode);
      otpForm.setValue("email", data.email || data.contact);
      toast({
        title: "Password verified!",
        description: otpCode ? `Test OTP: ${otpCode}` : "Check your email for the 6-digit code",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    },
  });

  // Phone Registration with Password
  const phoneRegisterMutation = useMutation({
    mutationFn: async (data: PhoneRegisterData) => {
      const { confirmPassword, ...registerData } = data;
      return await apiRequest("POST", "/api/auth/register/phone", registerData);
    },
    onSuccess: (data: any) => {
      setPendingContact(data.phoneNumber || data.contact);
      setShowOtpInput(true);
      const otpCode = data.testOtp || data.devOtp;
      setDevOtp(otpCode);
      otpForm.setValue("phoneNumber", data.phoneNumber || data.contact);
      toast({
        title: "Account created!",
        description: otpCode ? `Test OTP: ${otpCode}` : "Check your phone for the 6-digit code",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    },
  });

  // Email Registration with Password
  const emailRegisterMutation = useMutation({
    mutationFn: async (data: EmailRegisterData) => {
      const { confirmPassword, ...registerData } = data;
      return await apiRequest("POST", "/api/auth/register/email", registerData);
    },
    onSuccess: (data: any) => {
      setPendingContact(data.email || data.contact);
      setShowOtpInput(true);
      const otpCode = data.testOtp || data.devOtp;
      setDevOtp(otpCode);
      otpForm.setValue("email", data.email || data.contact);
      toast({
        title: "Account created!",
        description: otpCode ? `Test OTP: ${otpCode}` : "Check your email for the 6-digit code",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    },
  });

  // OTP verification
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

  // Forgot Password - Request OTP
  const forgotPasswordMutation = useMutation({
    mutationFn: async (data: ForgotPasswordData) => {
      return await apiRequest("POST", "/api/auth/forgot-password", data);
    },
    onSuccess: (data: any) => {
      setPendingContact(data.email);
      const otpCode = data.testOtp;
      setDevOtp(otpCode);
      resetPasswordForm.setValue("email", data.email);
      setMode("reset-password");
      toast({
        title: "Reset code sent!",
        description: otpCode ? `Test OTP: ${otpCode}` : "Check your email for the 6-digit reset code",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Request failed",
        description: error.message || "Failed to send reset code",
        variant: "destructive",
      });
    },
  });

  // Reset Password - Verify OTP and set new password
  const resetPasswordMutation = useMutation({
    mutationFn: async (data: ResetPasswordData) => {
      const { confirmPassword, ...resetData } = data;
      return await apiRequest("POST", "/api/auth/reset-password", resetData);
    },
    onSuccess: (data: any) => {
      toast({
        title: "Password reset successful!",
        description: "You can now sign in with your new password",
      });
      switchMode("login");
    },
    onError: (error: any) => {
      toast({
        title: "Reset failed",
        description: error.message || "Invalid or expired reset code",
        variant: "destructive",
      });
    },
  });

  const PasswordInput = ({ field, placeholder, show, onToggle, testId }: any) => (
    <div className="relative">
      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-eth-brown/50" />
      <Input
        {...field}
        type={show ? "text" : "password"}
        placeholder={placeholder}
        className="bg-white border-eth-brown/20 text-eth-brown pl-10 pr-10"
        data-testid={testId}
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-eth-brown/50 hover:text-eth-brown"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );

  // Determine dialog title and description
  const getDialogHeader = () => {
    if (showOtpInput) {
      return {
        title: "Verify OTP",
        description: `Enter the 6-digit code sent to ${pendingContact}`
      };
    }
    switch (mode) {
      case "forgot-password":
        return {
          title: "Forgot Password",
          description: "Enter your email to receive a reset code"
        };
      case "reset-password":
        return {
          title: "Reset Password",
          description: `Enter the code sent to ${pendingContact} and your new password`
        };
      case "register":
        return {
          title: "Create Account",
          description: "Join Ethiopia's best rental platform"
        };
      default:
        return {
          title: "Sign In",
          description: "Welcome back to Alga - Enter your password"
        };
    }
  };

  const { title, description } = getDialogHeader();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-eth-warm-tan border-eth-brown/20 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-eth-brown">{title}</DialogTitle>
          <DialogDescription className="text-eth-brown/70">{description}</DialogDescription>
        </DialogHeader>

        {/* OTP Verification Screen */}
        {showOtpInput ? (
          <Form {...otpForm}>
            <form onSubmit={otpForm.handleSubmit((data) => verifyOtpMutation.mutate(data))} className="space-y-4">
              <FormField
                control={otpForm.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-eth-brown">6-Digit OTP</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="123456"
                        maxLength={6}
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
                  <p className="text-sm text-yellow-800">Test Mode - OTP: <strong>{devOtp}</strong></p>
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
        ) : mode === "forgot-password" ? (
          /* Forgot Password Screen */
          <Form {...forgotPasswordForm}>
            <form onSubmit={forgotPasswordForm.handleSubmit((data) => forgotPasswordMutation.mutate(data))} className="space-y-4">
              <FormField
                control={forgotPasswordForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-eth-brown">Email Address</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="email"
                        placeholder="Enter your email" 
                        className="bg-white border-eth-brown/20 text-eth-brown" 
                        data-testid="input-email-forgot"
                        autoFocus
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={forgotPasswordMutation.isPending}
                className="w-full bg-eth-brown hover:bg-eth-brown/90 text-white"
                data-testid="button-send-reset-code"
              >
                {forgotPasswordMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Send Reset Code
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => switchMode("login")}
                className="w-full text-eth-brown hover:bg-eth-brown/10"
                data-testid="button-back-to-login"
              >
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Sign In
              </Button>
            </form>
          </Form>
        ) : mode === "reset-password" ? (
          /* Reset Password Screen */
          <Form {...resetPasswordForm}>
            <form onSubmit={resetPasswordForm.handleSubmit((data) => resetPasswordMutation.mutate(data))} className="space-y-4">
              <FormField
                control={resetPasswordForm.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-eth-brown">6-Digit Reset Code</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="123456"
                        maxLength={6}
                        className="bg-white border-eth-brown/20 text-eth-brown text-center text-xl tracking-widest"
                        data-testid="input-reset-otp"
                        autoFocus
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {devOtp && (
                <div className="p-3 bg-yellow-100 border border-yellow-300 rounded-md">
                  <p className="text-sm text-yellow-800">Test Mode - OTP: <strong>{devOtp}</strong></p>
                </div>
              )}
              <FormField
                control={resetPasswordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-eth-brown">New Password</FormLabel>
                    <FormControl>
                      <PasswordInput 
                        field={field} 
                        placeholder="Create new password" 
                        show={showNewPassword} 
                        onToggle={() => setShowNewPassword(!showNewPassword)}
                        testId="input-new-password"
                      />
                    </FormControl>
                    <p className="text-xs text-eth-brown/60 mt-1">Min 8 chars with uppercase, lowercase, number & special character</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={resetPasswordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-eth-brown">Confirm New Password</FormLabel>
                    <FormControl>
                      <PasswordInput 
                        field={field} 
                        placeholder="Confirm new password" 
                        show={showConfirmPassword} 
                        onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                        testId="input-confirm-new-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={resetPasswordMutation.isPending}
                className="w-full bg-eth-brown hover:bg-eth-brown/90 text-white"
                data-testid="button-reset-password"
              >
                {resetPasswordMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Reset Password
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => switchMode("login")}
                className="w-full text-eth-brown hover:bg-eth-brown/10"
                data-testid="button-back-to-login-reset"
              >
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Sign In
              </Button>
            </form>
          </Form>
        ) : (
          /* Login / Register Screens */
          <Tabs value={authMethod} onValueChange={(v) => setAuthMethod(v as "phone" | "email")} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-transparent gap-3 p-0">
              <TabsTrigger 
                value="phone" 
                className="relative px-6 py-3 rounded-lg font-medium transition-all duration-200 ease-in-out border-2
                  data-[state=inactive]:bg-gradient-to-br data-[state=inactive]:from-eth-light-tan/30 data-[state=inactive]:to-eth-warm-tan/30
                  data-[state=inactive]:border-eth-brown/20 data-[state=inactive]:text-eth-brown/70
                  data-[state=active]:bg-eth-brown data-[state=active]:border-transparent data-[state=active]:text-white"
                data-testid="tab-phone"
              >
                <Phone className="h-4 w-4 mr-2" />
                Phone
              </TabsTrigger>
              <TabsTrigger 
                value="email" 
                className="relative px-6 py-3 rounded-lg font-medium transition-all duration-200 ease-in-out border-2
                  data-[state=inactive]:bg-gradient-to-br data-[state=inactive]:from-eth-light-tan/30 data-[state=inactive]:to-eth-warm-tan/30
                  data-[state=inactive]:border-eth-brown/20 data-[state=inactive]:text-eth-brown/70
                  data-[state=active]:bg-eth-brown data-[state=active]:border-transparent data-[state=active]:text-white"
                data-testid="tab-email"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email
              </TabsTrigger>
            </TabsList>

            {/* Phone Auth with Password */}
            <TabsContent value="phone" className="mt-6">
              {mode === "login" ? (
                <Form {...phoneLoginForm}>
                  <form onSubmit={phoneLoginForm.handleSubmit((data) => phoneLoginMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={phoneLoginForm.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-eth-brown">Phone Number</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="tel"
                              placeholder="0912345678" 
                              className="bg-white border-eth-brown/20 text-eth-brown" 
                              data-testid="input-phone"
                              maxLength={10}
                              onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                                field.onChange(value);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={phoneLoginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-eth-brown">Password</FormLabel>
                          <FormControl>
                            <PasswordInput 
                              field={field} 
                              placeholder="Enter your password" 
                              show={showPassword} 
                              onToggle={() => setShowPassword(!showPassword)}
                              testId="input-password"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      disabled={phoneLoginMutation.isPending}
                      className="w-full bg-eth-brown hover:bg-eth-brown/90 text-white"
                      data-testid="button-login"
                    >
                      {phoneLoginMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Sign In
                    </Button>
                  </form>
                </Form>
              ) : (
                <Form {...phoneRegisterForm}>
                  <form onSubmit={phoneRegisterForm.handleSubmit((data) => phoneRegisterMutation.mutate(data))} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={phoneRegisterForm.control}
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
                        control={phoneRegisterForm.control}
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
                    <FormField
                      control={phoneRegisterForm.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-eth-brown">Phone Number</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="tel"
                              placeholder="0912345678" 
                              className="bg-white border-eth-brown/20 text-eth-brown" 
                              data-testid="input-phone-register"
                              maxLength={10}
                              onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                                field.onChange(value);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={phoneRegisterForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-eth-brown">Password</FormLabel>
                          <FormControl>
                            <PasswordInput 
                              field={field} 
                              placeholder="Create a strong password" 
                              show={showPassword} 
                              onToggle={() => setShowPassword(!showPassword)}
                              testId="input-password-register"
                            />
                          </FormControl>
                          <p className="text-xs text-eth-brown/60 mt-1">Min 8 chars with uppercase, lowercase, number & special character</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={phoneRegisterForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-eth-brown">Confirm Password</FormLabel>
                          <FormControl>
                            <PasswordInput 
                              field={field} 
                              placeholder="Confirm your password" 
                              show={showConfirmPassword} 
                              onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                              testId="input-confirm-password"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      disabled={phoneRegisterMutation.isPending}
                      className="w-full bg-eth-brown hover:bg-eth-brown/90 text-white"
                      data-testid="button-register"
                    >
                      {phoneRegisterMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Create Account
                    </Button>
                  </form>
                </Form>
              )}
            </TabsContent>

            {/* Email Auth with Password */}
            <TabsContent value="email" className="mt-6">
              {mode === "login" ? (
                <Form {...emailLoginForm}>
                  <form onSubmit={emailLoginForm.handleSubmit((data) => emailLoginMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={emailLoginForm.control}
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
                    <FormField
                      control={emailLoginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-eth-brown">Password</FormLabel>
                          <FormControl>
                            <PasswordInput 
                              field={field} 
                              placeholder="Enter your password" 
                              show={showPassword} 
                              onToggle={() => setShowPassword(!showPassword)}
                              testId="input-password-email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      disabled={emailLoginMutation.isPending}
                      className="w-full bg-eth-brown hover:bg-eth-brown/90 text-white"
                      data-testid="button-login-email"
                    >
                      {emailLoginMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Sign In
                    </Button>
                    {/* Forgot Password Link */}
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => switchMode("forgot-password")}
                        className="text-sm text-eth-brown/70 hover:text-eth-brown hover:underline"
                        data-testid="button-forgot-password"
                      >
                        Forgot your password?
                      </button>
                    </div>
                  </form>
                </Form>
              ) : (
                <Form {...emailRegisterForm}>
                  <form onSubmit={emailRegisterForm.handleSubmit((data) => emailRegisterMutation.mutate(data))} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={emailRegisterForm.control}
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
                        control={emailRegisterForm.control}
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
                    <FormField
                      control={emailRegisterForm.control}
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
                              data-testid="input-email-register"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={emailRegisterForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-eth-brown">Password</FormLabel>
                          <FormControl>
                            <PasswordInput 
                              field={field} 
                              placeholder="Create a strong password" 
                              show={showPassword} 
                              onToggle={() => setShowPassword(!showPassword)}
                              testId="input-password-email-register"
                            />
                          </FormControl>
                          <p className="text-xs text-eth-brown/60 mt-1">Min 8 chars with uppercase, lowercase, number & special character</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={emailRegisterForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-eth-brown">Confirm Password</FormLabel>
                          <FormControl>
                            <PasswordInput 
                              field={field} 
                              placeholder="Confirm your password" 
                              show={showConfirmPassword} 
                              onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                              testId="input-confirm-password-email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      disabled={emailRegisterMutation.isPending}
                      className="w-full bg-eth-brown hover:bg-eth-brown/90 text-white"
                      data-testid="button-register-email"
                    >
                      {emailRegisterMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Create Account
                    </Button>
                  </form>
                </Form>
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Toggle Login/Register */}
        {!showOtpInput && (mode === "login" || mode === "register") && (
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
