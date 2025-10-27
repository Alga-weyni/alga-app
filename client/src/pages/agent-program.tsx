import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  TrendingUp,
  Clock,
  Banknote,
  Users,
  Shield,
  Zap,
  CheckCircle,
  Home,
  Calculator,
} from "lucide-react";

export default function AgentProgram() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-cream/30 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-medium-brown to-dark-brown dark:from-gray-800 dark:to-gray-900 text-cream py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            💼 Become a Delala Agent
          </h1>
          <p className="text-xl md:text-2xl mb-4 text-cream/90">
            List Once, Earn for <span className="font-bold text-yellow-300">3 Years</span>
          </p>
          <p className="text-lg mb-8 text-cream/80">
            Join Ethiopia's property revolution. Earn 5% commission from every booking for 36 months.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button
              size="lg"
              onClick={() => setLocation("/become-agent")}
              className="bg-yellow-500 hover:bg-yellow-600 text-dark-brown font-bold text-lg px-8 py-6"
              data-testid="button-register-hero"
            >
              🚀 Register Now - FREE
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="border-cream text-cream hover:bg-cream/10"
              data-testid="button-learn-more"
            >
              📚 Learn More
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-12 px-4 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">5%</div>
              <div className="text-medium-brown dark:text-cream/80">Commission Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">36</div>
              <div className="text-medium-brown dark:text-cream/80">Months of Earnings</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">∞</div>
              <div className="text-medium-brown dark:text-cream/80">Properties You Can List</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-600 dark:text-orange-400 mb-2">FREE</div>
              <div className="text-medium-brown dark:text-cream/80">No Setup Costs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Grid */}
      <div className="py-16 px-4 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-dark-brown dark:text-cream mb-12">
          🎯 Why Join the Delala Agent Program?
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-medium-brown/20 dark:border-cream/20" data-testid="card-passive-income">
            <CardHeader>
              <TrendingUp className="h-12 w-12 text-green-600 dark:text-green-400 mb-4" />
              <CardTitle>Passive Income Stream</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-medium-brown dark:text-cream/80">
                List a property once and earn commissions every time it's booked - for 3 full years. No ongoing work required!
              </p>
            </CardContent>
          </Card>

          <Card className="border-medium-brown/20 dark:border-cream/20" data-testid="card-no-limit">
            <CardHeader>
              <Home className="h-12 w-12 text-blue-600 dark:text-blue-400 mb-4" />
              <CardTitle>No Property Limit</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-medium-brown dark:text-cream/80">
                List as many properties as you know about. More properties = more earning opportunities. Scale your income!
              </p>
            </CardContent>
          </Card>

          <Card className="border-medium-brown/20 dark:border-cream/20" data-testid="card-instant-payout">
            <CardHeader>
              <Banknote className="h-12 w-12 text-yellow-600 dark:text-yellow-400 mb-4" />
              <CardTitle>TeleBirr Instant Payouts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-medium-brown dark:text-cream/80">
                Get your commissions paid directly to your TeleBirr account. Fast, secure, and convenient mobile money.
              </p>
            </CardContent>
          </Card>

          <Card className="border-medium-brown/20 dark:border-cream/20" data-testid="card-verified">
            <CardHeader>
              <Shield className="h-12 w-12 text-purple-600 dark:text-purple-400 mb-4" />
              <CardTitle>Verified Agent Status</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-medium-brown dark:text-cream/80">
                Get official verification badge. Build trust with property owners and increase your listing success rate.
              </p>
            </CardContent>
          </Card>

          <Card className="border-medium-brown/20 dark:border-cream/20" data-testid="card-fast-setup">
            <CardHeader>
              <Zap className="h-12 w-12 text-orange-600 dark:text-orange-400 mb-4" />
              <CardTitle>5-Minute Setup</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-medium-brown dark:text-cream/80">
                Simple registration form. Get verified within 24 hours and start listing properties immediately.
              </p>
            </CardContent>
          </Card>

          <Card className="border-medium-brown/20 dark:border-cream/20" data-testid="card-dashboard">
            <CardHeader>
              <Users className="h-12 w-12 text-red-600 dark:text-red-400 mb-4" />
              <CardTitle>Real-Time Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-medium-brown dark:text-cream/80">
                Track all your earnings, properties, and commission history in one beautiful dashboard.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* How It Works */}
      <div id="how-it-works" className="py-16 px-4 bg-cream/50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-dark-brown dark:text-cream mb-12">
            📋 How It Works
          </h2>
          <div className="space-y-6">
            {[
              {
                step: "1️⃣",
                title: "Register as Agent",
                description: "Fill out the simple registration form with your TeleBirr account. Takes less than 5 minutes.",
                icon: Users,
              },
              {
                step: "2️⃣",
                title: "Get Verified",
                description: "Our admin team reviews your application (usually within 24 hours). Verified agents get a badge.",
                icon: Shield,
              },
              {
                step: "3️⃣",
                title: "List Properties",
                description: "Add properties you own or know about. Include photos, details, and pricing. Link them to your agent account.",
                icon: Home,
              },
              {
                step: "4️⃣",
                title: "Earn Automatically",
                description: "When guests book your listed properties, you automatically earn 5% commission. Tracked in real-time!",
                icon: Calculator,
              },
              {
                step: "5️⃣",
                title: "Get Paid to TeleBirr",
                description: "Commissions are paid directly to your TeleBirr account. Instant, secure, mobile money.",
                icon: Banknote,
              },
              {
                step: "6️⃣",
                title: "Earn for 3 Years",
                description: "Keep earning 5% from every booking for 36 months from the first rental. Passive income!",
                icon: Clock,
              },
            ].map((item) => (
              <Card key={item.step} className="border-medium-brown/20 dark:border-cream/20">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-medium-brown/10 dark:bg-cream/10 p-3 rounded-lg">
                      <item.icon className="h-8 w-8 text-medium-brown dark:text-cream" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{item.step}</span>
                        <h3 className="text-xl font-bold text-dark-brown dark:text-cream">
                          {item.title}
                        </h3>
                      </div>
                      <p className="text-medium-brown dark:text-cream/80">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Commission Calculator */}
      <div className="py-16 px-4 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-dark-brown dark:text-cream mb-8">
          💰 Earnings Calculator
        </h2>
        <Card className="border-medium-brown/20 dark:border-cream/20">
          <CardHeader>
            <CardTitle>Example: 3-Year Earnings from One Property</CardTitle>
            <CardDescription>
              See how much you could earn from a single property listing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-cream/50 dark:bg-gray-800 p-6 rounded-lg space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-medium-brown dark:text-cream/60 mb-1">Property Rent</p>
                  <p className="text-2xl font-bold text-dark-brown dark:text-cream">5,000 Birr/night</p>
                </div>
                <div>
                  <p className="text-sm text-medium-brown dark:text-cream/60 mb-1">Your Commission</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">250 Birr/booking</p>
                </div>
              </div>
              
              <div className="border-t border-medium-brown/20 dark:border-cream/20 pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>10 bookings/month × 36 months:</span>
                  <span className="font-bold">360 bookings</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Total 3-Year Earnings:</span>
                  <span className="font-bold text-green-600 dark:text-green-400">90,000 Birr</span>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                <p className="text-sm text-dark-brown dark:text-cream">
                  <CheckCircle className="inline h-4 w-4 mr-1 text-green-600" />
                  And you can list unlimited properties! Imagine earning from 5, 10, or even 50 properties!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FAQ */}
      <div className="py-16 px-4 bg-white dark:bg-gray-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-dark-brown dark:text-cream mb-12">
            ❓ Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "Do I need to own the property to list it?",
                a: "No! You can list any property you have permission to market. Many agents work with property owners who don't have time to manage listings.",
              },
              {
                q: "How long does verification take?",
                a: "Usually within 24 hours. We review your application and verify your TeleBirr account details.",
              },
              {
                q: "When do I get paid?",
                a: "Commissions are calculated when bookings are completed and paid directly to your TeleBirr account.",
              },
              {
                q: "What happens after 36 months?",
                a: "Commission expires for that specific property after 3 years from the first booking. But you can keep listing new properties!",
              },
              {
                q: "Is there any cost to join?",
                a: "Absolutely FREE! No setup fees, no monthly fees, no hidden costs. You only earn when properties get booked.",
              },
              {
                q: "Can I track my earnings?",
                a: "Yes! Your agent dashboard shows real-time earnings, pending commissions, payment history, and all your properties.",
              },
            ].map((faq, i) => (
              <Card key={i} className="border-medium-brown/20 dark:border-cream/20">
                <CardHeader>
                  <CardTitle className="text-lg">{faq.q}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-medium-brown dark:text-cream/80">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-4 bg-gradient-to-br from-dark-brown to-medium-brown dark:from-gray-900 dark:to-gray-800 text-cream">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            🚀 Ready to Start Earning?
          </h2>
          <p className="text-xl mb-8 text-cream/90">
            Join thousands of Delala agents earning passive income from property listings.
          </p>
          <Button
            size="lg"
            onClick={() => setLocation("/become-agent")}
            className="bg-yellow-500 hover:bg-yellow-600 text-dark-brown font-bold text-lg px-12 py-6"
            data-testid="button-register-cta"
          >
            💼 Register Now - It's FREE!
          </Button>
          <p className="mt-4 text-sm text-cream/70">
            No credit card required • Setup in 5 minutes • Start earning immediately
          </p>
        </div>
      </div>
    </div>
  );
}
