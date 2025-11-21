import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

import { apiRequest } from "@/lib/api-config";
import { queryClient } from "@/lib/queryClient";

import { Loader2, Phone, Mail } from "lucide-react";

// ---------------- VALIDATION ----------------
const phoneSchema = z.object({
  phoneNumber: z.string().regex(/^09\d{8}$/, "Phone must be 10 digits, start with 09"),
  firstName: z.string().optional(),
  lastName: z.string().optional()
});

const emailSchema = z.object({
  email: z.string().email("Invalid email"),
  firstName: z.string().optional(),
  lastName: z.string().optional()
});

const verifySchema = z.object({
  phoneNumber: z.string().optional(),
  email: z.string().optional(),
  otp: z.string().length(4, "OTP must be 4 digits")
});

type PhoneData = z.infer<typeof phoneSchema>;
type EmailData = z.infer<typeof emailSchema>;
type VerifyData = z.infer<typeof verifySchema>;

// ---------------- COMPONENT ----------------
export default function AuthDialog({
  open,
  onOpenChange,
  defaultMode = "login",
  redirectAfterAuth
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultMode?: "login" | "register";
  redirectAfterAuth?: string;
}) {
  const [mode, setMode] = useState(defaultMode);
  const [authMethod, setAuthMethod] = useState<"phone" | "email">("phone");
  const [showOtp, setShowOtp] = useState(false);
  const [pendingContact, setPendingContact] = useState("");
  const [devOtp, setDevOtp] = useState<string | undefined>();

  const { toast } = useToast();
  const [, navigate] = useLocation();

  const phoneForm = useForm({ resolver: zodResolver(phoneSchema) });
  const emailForm = useForm({ resolver: zodResolver(emailSchema) });
  const otpForm = useForm({ resolver: zodResolver(verifySchema) });

  const resetAll = () => {
    setShowOtp(false);
    setPendingContact("");
    setDevOtp(undefined);
    phoneForm.reset();
    emailForm.reset();
    otpForm.reset();
  };

  useEffect(() => {
    if (open) resetAll();
  }, [open]);

  const handleSuccess = (data: any) => {
    const user = data.user || data;

    toast({
      title: `Welcome ${user.firstName || ""}!`,
      description: mode === "login" ? "Successfully signed in" : "Account created"
    });

    queryClient.invalidateQueries({ queryKey: ["auth-user"] });
    navigate(redirectAfterAuth || "/welcome");
    onOpenChange(false);
  };

  // -------------- MUTATIONS --------------
  const phoneOtp = useMutation({
    mutationFn: (data: PhoneData) =>
      apiRequest("POST", `/api/auth/request-otp/phone/${mode}`, data),
    onSuccess: (data: any) => {
      setShowOtp(true);
      setPendingContact(data.phoneNumber);
      setDevOtp(data.devOtp);
      otpForm.setValue("phoneNumber", data.phoneNumber);
    },
    onError: (err: any) =>
      toast({ title: "Error", description: err.message, variant: "destructive" })
  });

  const emailOtp = useMutation({
    mutationFn: (data: EmailData) =>
      apiRequest("POST", `/api/auth/request-otp/email/${mode}`, data),
    onSuccess: (data: any) => {
      setShowOtp(true);
      setPendingContact(data.email);
      setDevOtp(data.devOtp);
      otpForm.setValue("email", data.email);
    },
    onError: (err: any) =>
      toast({ title: "Error", description: err.message, variant: "destructive" })
  });

  const verifyOtp = useMutation({
    mutationFn: (data: VerifyData) =>
      apiRequest("POST", "/api/auth/verify-otp", data),
    onSuccess: handleSuccess,
    onError: (err: any) =>
      toast({ title: "Invalid OTP", description: err.message, variant: "destructive" })
  });

  // --------------- UI RENDERING ----------------
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{showOtp ? "Verify OTP" : mode === "login" ? "Sign In" : "Register"}</DialogTitle>
          <DialogDescription>
            {showOtp ? `Enter OTP sent to ${pendingContact}` : "Continue with phone or email"}
          </DialogDescription>
        </DialogHeader>

        {showOtp ? (
          <form onSubmit={otpForm.handleSubmit((data) => verifyOtp.mutate(data))}>
            <Input {...otpForm.register("otp")} placeholder="1234" maxLength={4} />
            <Button className="w-full mt-3" disabled={verifyOtp.isPending}>
              {verifyOtp.isPending ? <Loader2 className="animate-spin" /> : "Verify"}
            </Button>
          </form>
        ) : (
          <Tabs value={authMethod} onValueChange={(v) => setAuthMethod(v as any)}>
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="phone"><Phone size={14} /> Phone</TabsTrigger>
              <TabsTrigger value="email"><Mail size={14} /> Email</TabsTrigger>
            </TabsList>

            {/* PHONE */}
            <TabsContent value="phone">
              <form onSubmit={phoneForm.handleSubmit((d) => phoneOtp.mutate(d))}>
                <Input {...phoneForm.register("phoneNumber")} placeholder="09XXXXXXXX" maxLength={10} />
                <Button className="w-full mt-3" disabled={phoneOtp.isPending}>
                  {phoneOtp.isPending ? <Loader2 className="animate-spin" /> : "Send OTP"}
                </Button>
              </form>
            </TabsContent>

            {/* EMAIL */}
            <TabsContent value="email">
              <form onSubmit={emailForm.handleSubmit((d) => emailOtp.mutate(d))}>
                <Input {...emailForm.register("email")} placeholder="example@mail.com" />
                <Button className="w-full mt-3" disabled={emailOtp.isPending}>
                  {emailOtp.isPending ? <Loader2 className="animate-spin" /> : "Send OTP"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        )}

        {!showOtp && (
          <p className="text-center text-sm mt-3">
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}
            <button className="ml-1 underline"
              onClick={() => { setMode(mode === "login" ? "register" : "login"); resetAll(); }}>
              {mode === "login" ? "Register" : "Sign In"}
            </button>
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
