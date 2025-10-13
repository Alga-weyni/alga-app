import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Phone, Shield, Clock } from "lucide-react";

interface PhoneVerificationProps {
  onVerified: (phone: string) => void;
  title?: string;
  description?: string;
}

export default function PhoneVerification({ 
  onVerified, 
  title = "Verify Your Phone Number",
  description = "We'll send a verification code to your Ethiopian phone number"
}: PhoneVerificationProps) {
  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const [countryCode, setCountryCode] = useState('+251');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [fullPhone, setFullPhone] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const { toast } = useToast();

  // Send verification code mutation
  const sendCodeMutation = useMutation({
    mutationFn: async (phone: string) => {
      const response = await fetch('/api/sms/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Verification Code Sent",
        description: "Please check your phone for the 6-digit code",
      });
      setStep('verify');
      startCountdown();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Send Code",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  // Verify code mutation
  const verifyCodeMutation = useMutation({
    mutationFn: async ({ phone, code }: { phone: string; code: string }) => {
      const response = await fetch('/api/sms/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code }),
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Phone Verified Successfully",
        description: "Your Ethiopian phone number has been verified",
      });
      onVerified(fullPhone);
    },
    onError: (error: any) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid code. Please try again.",
        variant: "destructive",
      });
    },
  });

  const startCountdown = () => {
    setTimeLeft(300); // 5 minutes
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendCode = () => {
    if (!phoneNumber || phoneNumber.length < 9) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid Ethiopian phone number",
        variant: "destructive",
      });
      return;
    }

    const phone = countryCode + phoneNumber.replace(/^0/, '');
    setFullPhone(phone);
    sendCodeMutation.mutate(phone);
  };

  const handleVerifyCode = () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter the 6-digit verification code",
        variant: "destructive",
      });
      return;
    }

    verifyCodeMutation.mutate({ phone: fullPhone, code: verificationCode });
  };

  const handleResendCode = () => {
    if (timeLeft > 0) return;
    sendCodeMutation.mutate(fullPhone);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
          <Phone className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {step === 'phone' ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select value={countryCode} onValueChange={setCountryCode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="+251">🇪🇹 Ethiopia (+251)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="flex space-x-2">
                <div className="flex items-center px-3 border rounded-md bg-muted text-muted-foreground">
                  {countryCode}
                </div>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="991234567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Enter your 9-digit Ethiopian phone number without the leading 0
              </p>
            </div>

            <Button 
              onClick={handleSendCode} 
              disabled={sendCodeMutation.isPending}
              className="w-full"
            >
              {sendCodeMutation.isPending ? "Sending..." : "Send Verification Code"}
            </Button>
          </>
        ) : (
          <>
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>Code sent to {fullPhone}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep('phone')}
                className="text-xs"
              >
                Change number
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="text-center text-lg tracking-widest"
                maxLength={6}
              />
              <p className="text-xs text-muted-foreground text-center">
                Enter the 6-digit code sent to your phone
              </p>
            </div>

            {timeLeft > 0 && (
              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Code expires in {formatTime(timeLeft)}</span>
              </div>
            )}

            <div className="space-y-2">
              <Button 
                onClick={handleVerifyCode} 
                disabled={verifyCodeMutation.isPending || verificationCode.length !== 6}
                className="w-full"
              >
                {verifyCodeMutation.isPending ? "Verifying..." : "Verify Code"}
              </Button>

              <Button
                variant="outline"
                onClick={handleResendCode}
                disabled={timeLeft > 0 || sendCodeMutation.isPending}
                className="w-full"
              >
                {timeLeft > 0 ? `Resend in ${formatTime(timeLeft)}` : "Resend Code"}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}