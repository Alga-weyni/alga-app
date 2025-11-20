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
import { apiRequest } from "@/lib/api-config";
import { queryClient } from "@/lib/queryClient";
import { Loader2, Phone, Mail } from "lucide-react";

// ---- SCHEMAS ----
const requestPhoneOtpSchema = z.object({
  phoneNumber: z.string().length(10, "Phone must be 10 digits").regex(/^09[0-9]{8}$/, "Must start with 09"),
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

export default function AuthDialog({ open, onOpenChange, defaultMode = "login", redirectAfterAuth }) {
  const [mode, setMode] = useState<"login" | "register">(defaultMode);
  const [authMethod, setAuthMethod] = useState<"phone" | "email">("phone");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [pendingContact, setPendingContact] = useState("");
  const [devOtp, setDevOtp] = useState<string | undefined>();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // ---- FORMS ----
  const phoneForm = useForm<RequestPhoneOtpData>({ resolver: zodResolver(requestPhoneOtpSchema) });
  const emailForm = useForm<RequestEmailOtpData>({ resolver: zodResolver(requestEmailOtpSchema) });
  const otpForm = useForm<VerifyOtpData>({ resolver: zodResolver(verifyOtpSchema) });

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

  // ---- SUCCESS HANDLER ----
  const handleAuthSuccess = (data: any) => {
    const user = data.user || data;
    toast({
      title: mode === "login" ? "Welcome back!" : "Account created!",
      description: `Logged in as ${user.firstName || ""} ${user.lastName || ""}`,
    });

    navigate("/welcome");
    queryClient.invalidateQueries({ queryKey: ["auth-user"] });
    onOpenChange(false);
  };

  // ---- MUTATIONS ----

  // PHONE OTP
  const requestPhoneOtpMutation = useMutation({
    mutationFn: async (data: RequestPhoneOtpData) => {
      const endpoint = mode === "register"
        ? "/auth/request-otp/phone/register"
        : "/auth/request-otp/phone/login";

      return await apiRequest("POST", endpoint, data);
    },
    onSuccess: (data) => {
      setPendingContact(data.phoneNumber || data.contact);
      setShowOtpInput(true);
      setDevOtp(data.devOtp);
      otpForm.setValue("phoneNumber", data.phoneNumber || data.contact);
    }
  });

  // EMAIL OTP
  const requestEmailOtpMutation = useMutation({
    mutationFn: async (data: RequestEmailOtpData) => {
      const endpoint = mode === "register"
        ? "/auth/request-otp/email/register"
        : "/auth/request-otp/email/login";

      return await apiRequest("POST", endpoint, data);
    },
    onSuccess: (data) => {
      setPendingContact(data.email || data.contact);
      setShowOtpInput(true);
      setDevOtp(data.devOtp);
      otpForm.setValue("email", data.email || data.contact);
    }
  });

  // OTP VERIFY
  const verifyOtpMutation = useMutation({
    mutationFn: async (data: VerifyOtpData) => {
      return await apiRequest("POST", "/auth/verify-otp", data);
    },
    onSuccess: handleAuthSuccess,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{showOtpInput ? "Verify OTP" : "Sign In"}</DialogTitle>
        </DialogHeader>

        {showOtpInput ? (
          // ---- VERIFY OTP UI ----
          <Form {...otpForm}>
            <form onSubmit={otpForm.handleSubmit((data) => verifyOtpMutation.mutate(data))}>
              <Input placeholder="4-digit OTP" maxLength={4} {...otpForm.register("otp")} />
              <Button type="submit">Verify</Button>
            </form>
          </Form>
        ) : (
          // ---- SEND OTP UI ----
          <Tabs value={authMethod} onValueChange={(val) => setAuthMethod(val as "phone" | "email")}>
            <TabsList>
              <TabsTrigger value="phone">Phone</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
            </TabsList>

            <TabsContent value="phone">
              <Form {...phoneForm}>
                <form onSubmit={phoneForm.handleSubmit((data) => requestPhoneOtpMutation.mutate(data))}>
                  <Input placeholder="0912345678" {...phoneForm.register("phoneNumber")} />
                  <Button type="submit">Send OTP</Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="email">
              <Form {...emailForm}>
                <form onSubmit={emailForm.handleSubmit((data) => requestEmailOtpMutation.mutate(data))}>
                  <Input placeholder="email@example.com" {...emailForm.register("email")} />
                  <Button type="submit">Send OTP</Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
