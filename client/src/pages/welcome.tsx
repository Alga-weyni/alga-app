// Welcome Page - Post-Login Orientation for All Ages
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Wrench, Calendar } from "lucide-react";

export default function Welcome() {
  const { user } = useAuth();
  const firstName = user?.firstName || "Friend";

  const actions = [
    {
      emoji: "🏠",
      title: "Stay Somewhere",
      description: "Find a cozy place for your trip",
      link: "/properties",
      color: "from-blue-50 to-blue-100",
      icon: Home,
      testId: "stay-somewhere",
    },
    {
      emoji: "🔧",
      title: "Fix Something",
      description: "Get help from local service providers",
      link: "/services",
      color: "from-orange-50 to-orange-100",
      icon: Wrench,
      testId: "fix-something",
    },
    {
      emoji: "📅",
      title: "Check My Trips",
      description: "See your bookings and activities",
      link: "/my-alga",
      color: "from-green-50 to-green-100",
      icon: Calendar,
      testId: "check-trips",
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#f6f2ec" }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Warm Greeting */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <span className="text-7xl" aria-hidden="true">👋</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4" style={{ color: "#2d1405" }}>
            Hi {firstName}!
          </h1>
          <p className="text-2xl sm:text-3xl" style={{ color: "#5a4a42" }}>
            What would you like to do today?
          </p>
        </div>

        {/* Action Cards - Extra Large & Touch-Friendly */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {actions.map((action) => (
            <Link key={action.link} href={action.link}>
              <Card
                className={`h-full transition-all duration-200 hover:shadow-2xl hover:-translate-y-2 cursor-pointer border-0 bg-gradient-to-br ${action.color}`}
                data-testid={`card-${action.testId}`}
              >
                <CardContent className="p-8 sm:p-10 text-center">
                  {/* Large Emoji */}
                  <div className="mb-6">
                    <span className="text-6xl" aria-hidden="true">{action.emoji}</span>
                  </div>

                  {/* Title */}
                  <h2 className="text-2xl font-bold mb-3" style={{ color: "#2d1405" }}>
                    {action.title}
                  </h2>

                  {/* Description */}
                  <p className="text-lg mb-6" style={{ color: "#5a4a42" }}>
                    {action.description}
                  </p>

                  {/* Large Touch Button */}
                  <Button
                    size="lg"
                    className="w-full h-14 text-lg rounded-xl shadow-md"
                    style={{ background: "#8a6e4b" }}
                    aria-label={action.title}
                    role="button"
                  >
                    Let's Go →
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Skip Option */}
        <div className="text-center">
          <Link href="/properties">
            <Button
              variant="ghost"
              size="lg"
              className="text-lg"
              aria-label="Skip to browse properties"
              role="button"
            >
              Skip for now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
