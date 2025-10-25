import { Link } from "react-router-dom";
import { useState } from "react";
import { 
  Home,
  Wrench,
  CreditCard,
  Shield,
  FileQuestion,
  Sparkles,
  Heart
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { LemlemChat } from "@/components/lemlem-chat";

interface HelpCard {
  icon: React.ElementType;
  title: string;
  lemlemVoice: string;
  description: string;
  link?: string;
  color: string;
  iconColor: string;
}

export default function Support() {
  const [showLemlem, setShowLemlem] = useState(false);

  const helpTopics: HelpCard[] = [
    {
      icon: Shield,
      title: "Safety & Security",
      lemlemVoice: "Let me help you stay safe, dear 🛡️",
      description: "Emergency contacts, location sharing, and safety tips",
      link: "/help/safety",
      color: "from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
    {
      icon: Home,
      title: "Finding a Place",
      lemlemVoice: "I'll guide you to the perfect stay 🏡",
      description: "How to search, book, and check in to properties",
      link: "/properties",
      color: "from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      icon: Wrench,
      title: "Getting Services",
      lemlemVoice: "Need help? I know just the people 🔧",
      description: "How to hire service providers for your stay",
      link: "/services",
      color: "from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900",
      iconColor: "text-orange-600 dark:text-orange-400",
    },
    {
      icon: CreditCard,
      title: "Money Matters",
      lemlemVoice: "Don't worry, we'll sort it out together 💰",
      description: "Payment methods, refunds, and billing questions",
      link: "/help/payments",
      color: "from-green-50 to-green-100 dark:from-green-950 dark:to-green-900",
      iconColor: "text-green-600 dark:text-green-400",
    },
    {
      icon: FileQuestion,
      title: "For Hosts",
      lemlemVoice: "I'll walk you through hosting with confidence 🌟",
      description: "Listing your property and managing bookings",
      link: "/become-host",
      color: "from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900",
      iconColor: "text-yellow-600 dark:text-yellow-400",
    },
    {
      icon: Wrench,
      title: "For Providers",
      lemlemVoice: "Let me help you share your skills 🛠️",
      description: "Offering services on Alga marketplace",
      link: "/become-provider",
      color: "from-teal-50 to-teal-100 dark:from-teal-950 dark:to-teal-900",
      iconColor: "text-teal-600 dark:text-teal-400",
    },
  ];

  // Ethiopian proverbs/wisdom
  const dailyWisdom = [
    "When you travel, keep your ID and your smile ready — one keeps you safe, the other opens hearts.",
    "A guest is a gift from God — treat them with warmth and they'll carry your kindness home.",
    "The best coffee is shared with good conversation — take time to connect with your host.",
    "Trust is built slowly, like a strong foundation — give it time to grow.",
    "A locked door is safer than a worried mind — always secure your space.",
  ];

  const randomWisdom = dailyWisdom[Math.floor(Math.random() * dailyWisdom.length)];

  return (
    <div className="min-h-screen bg-[#f9e9d8] dark:bg-[#2d1405]">
      <Header />

      {/* Hero Section - Featuring Lemlem */}
      <div className="border-b bg-gradient-to-br from-[#FFF6EA] to-[#f9e9d8] dark:from-[#3c2f2f] dark:to-[#2d1405] border-[#e5d9ce] dark:border-[#5a4a42]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
          <div className="flex justify-center mb-6">
            <div 
              className="w-24 h-24 rounded-full flex items-center justify-center shadow-2xl text-6xl bg-gradient-to-br from-[#F49F0A] to-[#CD7F32] border-4 border-white dark:border-[#5a4a42]"
            >
              👵🏾
            </div>
          </div>
          
          <h1 
            className="text-4xl sm:text-6xl font-bold mb-3"
            style={{ 
              color: "#2d1405",
              fontFamily: "'Noto Sans Ethiopic', 'Noto Sans', sans-serif"
            }}
            data-testid="text-page-title"
          >
            Ask Lemlem (ልምልም)
          </h1>
          
          <div className="inline-block px-4 py-2 rounded-full bg-[#CD7F32]/10 dark:bg-[#CD7F32]/20 mb-4">
            <p className="text-lg font-semibold text-[#CD7F32] dark:text-[#F49F0A]">
              Your AI Assistant — Named After My Beautiful Grandma! 💚
            </p>
          </div>
          
          <p className="text-lg sm:text-2xl max-w-3xl mx-auto text-[#5a4a42] dark:text-[#e5d9ce] leading-relaxed">
            Like a caring Ethiopian grandmother, I'm here to guide you with warmth and wisdom. 
            Ask me anything about your stay! ☕️
          </p>

          <div className="mt-8">
            <Button
              size="lg"
              onClick={() => setShowLemlem(true)}
              className="h-16 px-10 text-xl rounded-full shadow-2xl hover:shadow-[0_8px_30px_rgba(244,159,10,0.5)] transition-all hover:scale-105 bg-gradient-to-r from-[#F49F0A] to-[#CD7F32] hover:from-[#FFB020] hover:to-[#DAA520] text-white border-2 border-white/30"
              data-testid="button-chat-with-lemlem"
            >
              <Sparkles className="mr-3 h-6 w-6" />
              Chat with Lemlem Now
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* What Lemlem Can Help With */}
        <section className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-[#2d1405] dark:text-[#f9e9d8]">
            What I Can Help You With
          </h2>
          <p className="text-lg text-[#5a4a42] dark:text-[#e5d9ce] mb-8">
            Choose a topic and I'll guide you through it, step by step 🌸
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {helpTopics.map((topic, index) => {
              const content = (
                <Card 
                  className={`h-full transition-all duration-200 hover:shadow-2xl hover:-translate-y-2 cursor-pointer border-2 border-[#CD7F32]/20 hover:border-[#CD7F32] bg-gradient-to-br ${topic.color}`}
                  data-testid={`card-${topic.title.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <CardContent className="p-8 text-center">
                    <div className={`inline-block p-5 rounded-2xl bg-white dark:bg-[#2d1405]/50 ${topic.iconColor} mb-4 shadow-lg`}>
                      <topic.icon className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-xl mb-3 text-[#2d1405] dark:text-white">
                      {topic.title}
                    </h3>
                    <p className="text-base italic mb-3 font-medium" style={{ color: "#CD7F32" }}>
                      "{topic.lemlemVoice}"
                    </p>
                    <p className="text-sm text-[#5a4a42] dark:text-[#e5d9ce]">
                      {topic.description}
                    </p>
                  </CardContent>
                </Card>
              );

              if (topic.link) {
                return (
                  <Link key={index} to={topic.link}>
                    {content}
                  </Link>
                );
              }

              return <div key={index}>{content}</div>;
            })}
          </div>
        </section>

        {/* Lemlem's Daily Wisdom */}
        <section className="mb-16">
          <Card 
            className="border-2 border-[#CD7F32]/30 shadow-xl overflow-hidden"
            style={{ 
              background: "linear-gradient(135deg, #FFF6EA 0%, #f9e9d8 100%)"
            }}
          >
            <CardContent className="p-10 text-center">
              <div className="flex justify-center mb-4">
                <Heart className="w-12 h-12 text-[#CD7F32] animate-pulse" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[#2d1405]">
                Lemlem's Wisdom for Today 🌟
              </h3>
              <p className="text-lg italic text-[#5a4a42] leading-relaxed max-w-3xl mx-auto font-medium">
                "{randomWisdom}"
              </p>
              <p className="mt-4 text-sm text-[#8a6e4b]">
                — From your grandmother Lemlem, with love 💚
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Quick Questions - Ethiopian Style */}
        <section className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-[#2d1405] dark:text-[#f9e9d8]">
            Quick Answers from Lemlem
          </h2>
          <p className="text-lg text-[#5a4a42] dark:text-[#e5d9ce] mb-8">
            Here are answers to the questions guests ask me most often ☕️
          </p>
          
          <div className="space-y-4">
            {[
              {
                question: "How do I book a property, Lemlem?",
                answer: "It's easy, dear! Browse properties, pick your dates, and click 'Book Now'. You'll get instant confirmation — like a warm hug! 🏡",
              },
              {
                question: "What payment methods can I use?",
                answer: "We welcome Chapa, Telebirr, Stripe, and PayPal. Choose whichever makes you comfortable, my dear. 💳",
              },
              {
                question: "Can I cancel my booking?",
                answer: "Of course! Life happens. Just check the property's cancellation policy for the details. I'm here if you need help. 🤝",
              },
              {
                question: "How do I become a host on Alga?",
                answer: "Wonderful! Click 'List Your Property' on your dashboard. I'll walk you through it step by step, with care and patience. 🏡",
              },
            ].map((faq, index) => (
              <Card 
                key={index} 
                className="border-2 border-[#e5d9ce] dark:border-[#5a4a42] shadow-md hover:shadow-xl transition-all bg-white dark:bg-[#3c2f2f]"
                data-testid={`faq-${index}`}
              >
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-3 text-[#2d1405] dark:text-[#f9e9d8]">
                    {faq.question}
                  </h3>
                  <p className="text-[#5a4a42] dark:text-[#e5d9ce] leading-relaxed">
                    {faq.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Still Need Help - Chat with Lemlem */}
        <section className="mt-16 text-center">
          <Card 
            className="border-0 shadow-2xl overflow-hidden"
            style={{ 
              background: "linear-gradient(135deg, #F49F0A 0%, #CD7F32 100%)"
            }}
          >
            <CardContent className="p-12">
              <div className="text-6xl mb-4">👵🏾💬</div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Still Need Help, Dear?
              </h2>
              <p className="text-xl text-white/95 mb-8 max-w-2xl mx-auto leading-relaxed">
                I'm always here for you — day or night. Let's chat and sort things out together, 
                just like family. 💚
              </p>
              <Button
                size="lg"
                onClick={() => setShowLemlem(true)}
                className="h-16 px-10 text-lg rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-105 bg-white text-[#CD7F32] hover:bg-[#FFF6EA]"
                data-testid="button-chat-lemlem-cta"
              >
                <Sparkles className="mr-3 h-6 w-6" />
                Start Chatting with Lemlem
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Lemlem Chat Integration - Opens automatically when button clicked */}
      {showLemlem && <LemlemChat propertyId={undefined} bookingId={undefined} defaultOpen={true} />}

      <Footer />
    </div>
  );
}
