import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, Sparkles, Home, DollarSign, Shield, Users, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User } from "@shared/schema";

interface WelcomeOnboardingProps {
  user: User;
  onComplete: () => void;
}

const roleContent = {
  guest: {
    title: "Welcome Traveler",
    amharicGreeting: "እንኳን ደህና መጡ",
    emoji: "🏠",
    color: "from-amber-500 to-orange-600",
    icon: Home,
    proverb: "Coffee is our bread - hospitality is essential",
    description: "Discover unique Ethiopian accommodations and immersive cultural experiences",
    videoUrl: "/videos/guest_welcome.mp4",
    steps: [
      {
        title: "Search & Discover",
        description: "Browse 50+ verified properties across Ethiopia's beautiful cities",
        icon: "🔍"
      },
      {
        title: "Book Safely",
        description: "Secure payments with Chapa, Telebirr, and international cards",
        icon: "🔒"
      },
      {
        title: "Experience Ethiopia",
        description: "Smart lockbox access, verified hosts, and authentic local stays",
        icon: "🇪🇹"
      }
    ]
  },
  host: {
    title: "Welcome Property Owner",
    amharicGreeting: "እንኳን ደህና መጡ",
    emoji: "🏡",
    color: "from-brown-600 to-amber-700",
    icon: DollarSign,
    proverb: "A single stick may smoke, but it will not burn - together we thrive",
    description: "Share your unique space and earn income through Alga's trusted platform",
    videoUrl: "/videos/host_welcome.mp4",
    steps: [
      {
        title: "List Your Property",
        description: "Upload photos, set prices, and showcase what makes your space special",
        icon: "📸"
      },
      {
        title: "Earn 92.5%",
        description: "Keep 92.5% of bookings (5% Dellala, 2.5% platform fee)",
        icon: "💰"
      },
      {
        title: "Grow Your Business",
        description: "Access analytics, instant payouts, and marketing support",
        icon: "📈"
      }
    ]
  },
  dellala: {
    title: "Welcome Agent (ደላላ)",
    amharicGreeting: "እንኳን ደህና መጡ",
    emoji: "💎",
    color: "from-emerald-500 to-green-600",
    icon: Sparkles,
    proverb: "He who learns, teaches - share your knowledge and earn",
    description: "Earn 5% recurring commissions for 36 months by connecting properties with travelers",
    videoUrl: "/videos/dellala_welcome.mp4",
    steps: [
      {
        title: "Refer Properties",
        description: "Connect property owners to Alga and earn instant commissions",
        icon: "🤝"
      },
      {
        title: "Get Paid Instantly",
        description: "5% commission auto-split on every booking for 36 months",
        icon: "⚡"
      },
      {
        title: "Withdraw Anytime",
        description: "Cash out to Telebirr or Addispay with minimum 100 ETB",
        icon: "💸"
      }
    ]
  },
  operator: {
    title: "Welcome Verification Specialist",
    amharicGreeting: "እንኳን ደህና መጡ",
    emoji: "🛡️",
    color: "from-blue-600 to-indigo-700",
    icon: Shield,
    proverb: "Milk and honey have different colors, but share the same house peacefully",
    description: "Ensure platform quality by verifying properties, IDs, and hardware installations",
    steps: [
      {
        title: "Verify Documents",
        description: "Review ID documents, property deeds, and business licenses",
        icon: "📄"
      },
      {
        title: "Inspect Hardware",
        description: "Confirm smart lockboxes and security cameras are installed",
        icon: "🔐"
      },
      {
        title: "Maintain Quality",
        description: "Approve properties and agents to uphold Alga's standards",
        icon: "✅"
      }
    ]
  },
  admin: {
    title: "Welcome Platform Administrator",
    amharicGreeting: "እንኳን ደህና መጡ",
    emoji: "👑",
    color: "from-purple-600 to-pink-600",
    icon: Users,
    proverb: "Together we build - Alga is a women-run platform serving Ethiopia",
    videoUrl: "/videos/admin_welcome.mp4",
    description: "Manage all operations through the Lemlem Operations Dashboard",
    steps: [
      {
        title: "Oversee 5 Pillars",
        description: "Agent Governance, Supply, Hardware, Payments, Marketing",
        icon: "📊"
      },
      {
        title: "AI-Powered Insights",
        description: "Ask Lemlem Admin Chat for instant operational intelligence",
        icon: "🤖"
      },
      {
        title: "Full Control",
        description: "Manage users, verify properties, process withdrawals, export reports",
        icon: "⚙️"
      }
    ]
  }
};

export function WelcomeOnboarding({ user, onComplete }: WelcomeOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSkipped, setIsSkipped] = useState(false);
  const { toast } = useToast();
  
  const role = user.role as keyof typeof roleContent;
  const content = roleContent[role] || roleContent.guest;
  const totalSteps = content.steps.length + 1; // +1 for welcome screen
  const progress = ((currentStep + 1) / totalSteps) * 100;

  useEffect(() => {
    // Track onboarding start
    trackOnboarding("step_welcome", true);
  }, []);

  const trackOnboarding = async (step: string, value: boolean) => {
    try {
      await apiRequest("/api/onboarding/track", "POST", { step, value });
    } catch (error) {
      console.error("Error tracking onboarding:", error);
    }
  };

  const handleNext = () => {
    if (currentStep < content.steps.length) {
      setCurrentStep(currentStep + 1);
      trackOnboarding("step_tour", true);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    try {
      await apiRequest("/api/onboarding/complete", "POST", {});
      
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      toast({
        title: "Welcome to Alga! 🎉",
        description: `You're all set to start your journey as a ${role}.`,
      });
      
      onComplete();
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast({
        title: "Onboarding Complete",
        description: "Welcome to Alga!",
        variant: "default"
      });
      onComplete();
    }
  };

  const handleSkip = async () => {
    setIsSkipped(true);
    await trackOnboarding("skip_count", true);
    setTimeout(() => {
      onComplete();
    }, 500);
  };

  const IconComponent = content.icon;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        data-testid="onboarding-overlay"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          <Card className="relative overflow-hidden border-none shadow-2xl bg-white dark:bg-gray-900">
            {/* Header */}
            <div className={`relative bg-gradient-to-br ${content.color} p-8 text-white overflow-hidden`}>
              {/* Ethiopian Pattern Background */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-32 h-32 border-4 border-white rotate-45"></div>
                <div className="absolute bottom-0 right-0 w-32 h-32 border-4 border-white rotate-45"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-4 border-white rounded-full"></div>
              </div>

              <div className="relative z-10">
                <button
                  onClick={handleSkip}
                  className="absolute top-0 right-0 p-2 hover:bg-white/20 rounded-lg transition-colors"
                  data-testid="button-skip-onboarding"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-4xl">
                    {content.emoji}
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold">{content.title}</h1>
                    <p className="text-white/90 text-xl font-amharic">{content.amharicGreeting} {user.firstName}!</p>
                  </div>
                </div>

                <Progress value={progress} className="h-2 bg-white/30" />
                <p className="text-sm text-white/80 mt-2">
                  Step {currentStep + 1} of {totalSteps}
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <AnimatePresence mode="wait">
                {currentStep === 0 ? (
                  // Welcome Screen
                  <motion.div
                    key="welcome"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                    data-testid="onboarding-welcome-screen"
                  >
                    {/* Welcome Video */}
                    {'videoUrl' in content && content.videoUrl && (
                      <div className="relative rounded-xl overflow-hidden bg-black shadow-lg">
                        <video
                          className="w-full h-auto max-h-80 object-cover"
                          controls
                          playsInline
                          preload="metadata"
                          poster={`${content.videoUrl.replace('.mp4', '')}_poster.jpg`}
                          data-testid="onboarding-welcome-video"
                        >
                          <source src={content.videoUrl} type="video/mp4" />
                          <p className="text-white p-4">Your browser doesn't support video playback.</p>
                        </video>
                      </div>
                    )}

                    <div className="flex items-start gap-4">
                      <IconComponent className={`w-8 h-8 text-gradient-to-br ${content.color}`} />
                      <div>
                        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                          {content.description}
                        </p>
                      </div>
                    </div>

                    <div className="bg-cream-50 dark:bg-gray-800 border-l-4 border-amber-500 p-4 rounded-r-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                        <span className="font-semibold">Ethiopian Wisdom:</span><br />
                        "{content.proverb}"
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Sparkles className="w-4 h-4" />
                      <span>This quick tour takes less than 30 seconds</span>
                    </div>
                  </motion.div>
                ) : (
                  // Tour Steps
                  <motion.div
                    key={`step-${currentStep}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                    data-testid={`onboarding-step-${currentStep}`}
                  >
                    <div className="text-center">
                      <div className="text-6xl mb-4">{content.steps[currentStep - 1].icon}</div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {content.steps[currentStep - 1].title}
                      </h2>
                      <p className="text-lg text-gray-600 dark:text-gray-400">
                        {content.steps[currentStep - 1].description}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleSkip}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  data-testid="button-skip"
                >
                  Skip tour
                </button>

                <Button
                  onClick={handleNext}
                  className={`bg-gradient-to-r ${content.color} text-white shadow-lg hover:shadow-xl transition-shadow`}
                  data-testid="button-next"
                >
                  {currentStep === content.steps.length ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Get Started
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
