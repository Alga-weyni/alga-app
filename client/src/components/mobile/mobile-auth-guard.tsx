import { ReactNode, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AuthDialog from "@/components/auth-dialog-passwordless";
import { Home } from "lucide-react";

interface MobileAuthGuardProps {
  children: ReactNode;
}

export default function MobileAuthGuard({ children }: MobileAuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  // Show sign-in screen if not authenticated
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8F1E7] to-[#f9e9d8] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-eth-brown rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4 animate-pulse">
            <Home className="text-white text-2xl" />
          </div>
          <p className="text-eth-brown text-lg font-medium">Loading Alga...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8F1E7] to-[#f9e9d8] flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-2 border-[#CD7F32]/20 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <div className="w-20 h-20 bg-eth-brown rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4">
              <Home className="text-white text-3xl" />
            </div>
            <CardTitle className="text-3xl font-bold text-eth-brown mb-2">
              Welcome to Alga
            </CardTitle>
            <CardDescription className="text-base text-[#5a4a42]">
              Ethiopia's trusted platform for stays and services
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-[#f9e9d8] rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏠</span>
                <p className="text-sm text-[#2d1405]">
                  Discover unique stays across Ethiopia
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">🧰</span>
                <p className="text-sm text-[#2d1405]">
                  Book trusted local services
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">💚</span>
                <p className="text-sm text-[#2d1405]">
                  Safe, secure, and verified
                </p>
              </div>
            </div>

            <Button
              size="lg"
              onClick={() => setAuthDialogOpen(true)}
              className="w-full h-14 text-lg bg-eth-brown hover:bg-eth-brown/90 shadow-lg"
              data-testid="button-mobile-signin"
            >
              Sign In to Continue
            </Button>

            <p className="text-center text-xs text-[#5a4a42] mt-4">
              By continuing, you agree to Alga's Terms of Service and Privacy Policy
            </p>
          </CardContent>
        </Card>

        <AuthDialog
          open={authDialogOpen}
          onOpenChange={setAuthDialogOpen}
          defaultMode="login"
        />
      </div>
    );
  }

  return <>{children}</>;
}
