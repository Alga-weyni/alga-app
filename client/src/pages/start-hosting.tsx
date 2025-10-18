import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/header";
import Footer from "@/components/footer";
import AuthDialog from "@/components/auth-dialog";
import { useAuth } from "@/hooks/useAuth";
import { BackButton } from "@/components/back-button";
import { CheckCircle, Home, Users, Shield, TrendingUp } from "lucide-react";

export default function StartHosting() {
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  // If already authenticated as a host, redirect to host dashboard
  if (isAuthenticated && user?.role === "host") {
    navigate("/host/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-eth-warm-tan">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <BackButton />
          </div>
          
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-eth-brown mb-4">
              Start Hosting with Alga
            </h1>
            <p className="text-xl text-eth-brown/80 max-w-2xl mx-auto">
              Share your property with travelers and earn income while showcasing Ethiopian hospitality
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Benefits Section */}
            <Card className="bg-gradient-to-br from-[#f9e9d8] to-[#f6d8c2] border-2 border-eth-orange/20">
              <CardHeader>
                <CardTitle className="text-2xl text-eth-brown">Why Host with Us?</CardTitle>
                <CardDescription className="text-eth-brown/70">Join thousands of successful guesthouse owners across Ethiopia</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-eth-orange mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-eth-brown">Earn Extra Income</h3>
                    <p className="text-eth-brown/70">List your property and start earning from day one</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-eth-orange mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-eth-brown">Verified Guests</h3>
                    <p className="text-eth-brown/70">All guests are verified with Ethiopian ID or passport</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-eth-orange mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-eth-brown">Secure Payments</h3>
                    <p className="text-eth-brown/70">Get paid safely through Ethiopian banks and mobile money</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-eth-orange mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-eth-brown">24/7 Support</h3>
                    <p className="text-eth-brown/70">Our team is always ready to help you succeed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CTA Section */}
            <Card className="bg-gradient-to-br from-eth-brown to-[#654321] text-white">
              <CardHeader>
                <CardTitle className="text-2xl">Ready to Get Started?</CardTitle>
                <CardDescription className="text-white/80">
                  {isAuthenticated 
                    ? "Apply to become a host and start listing your properties" 
                    : "Create your host account in just a few steps"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isAuthenticated ? (
                  <>
                    <p className="text-white/90">
                      You're currently logged in as a guest. To start hosting, an admin will need to upgrade your account to a host account.
                    </p>
                    <div className="bg-white/10 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Next Steps:</h4>
                      <ol className="list-decimal list-inside space-y-1 text-sm">
                        <li>Contact our support team</li>
                        <li>Provide property verification documents</li>
                        <li>Wait for admin approval</li>
                        <li>Start listing your properties!</li>
                      </ol>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Users className="h-5 w-5" />
                        <span>Quick registration process</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Shield className="h-5 w-5" />
                        <span>Secure account verification</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-5 w-5" />
                        <span>Start earning immediately</span>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => setAuthDialogOpen(true)}
                      className="w-full bg-eth-orange hover:bg-eth-orange/90 text-white font-semibold py-6 text-lg"
                      data-testid="button-become-host"
                    >
                      <Home className="h-5 w-5 mr-2" />
                      Become a Host
                    </Button>
                    
                    <p className="text-sm text-white/70 text-center">
                      Already have an account?{" "}
                      <button
                        onClick={() => setAuthDialogOpen(true)}
                        className="underline hover:text-white"
                        data-testid="link-sign-in"
                      >
                        Sign in here
                      </button>
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* How It Works Section */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-eth-brown text-center mb-8">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-[#f9e9d8] to-[#f6d8c2] border-2 border-eth-orange/20">
                <CardHeader>
                  <div className="w-12 h-12 bg-eth-orange/20 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold text-eth-orange">1</span>
                  </div>
                  <CardTitle className="text-eth-brown">Create Your Account</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-eth-brown/70">
                    Sign up with your phone number or email. Verify your identity with Ethiopian ID or passport.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-[#f9e9d8] to-[#f6d8c2] border-2 border-eth-orange/20">
                <CardHeader>
                  <div className="w-12 h-12 bg-eth-orange/20 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold text-eth-orange">2</span>
                  </div>
                  <CardTitle className="text-eth-brown">List Your Property</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-eth-brown/70">
                    Add photos, descriptions, and pricing. Our team will verify your listing within 24 hours.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-[#f9e9d8] to-[#f6d8c2] border-2 border-eth-orange/20">
                <CardHeader>
                  <div className="w-12 h-12 bg-eth-orange/20 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold text-eth-orange">3</span>
                  </div>
                  <CardTitle className="text-eth-brown">Start Earning</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-eth-brown/70">
                    Welcome guests and receive payments directly to your bank account or mobile money.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />

      <AuthDialog 
        open={authDialogOpen} 
        onOpenChange={setAuthDialogOpen}
        defaultMode="register"
        redirectAfterAuth="/"
      />
    </div>
  );
}
