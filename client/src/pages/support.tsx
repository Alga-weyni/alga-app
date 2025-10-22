// Support & Help Page - Simple & Friendly
import { Link } from "wouter";
import { 
  Phone, 
  Mail, 
  MessageCircle, 
  HelpCircle,
  Home,
  Wrench,
  CreditCard,
  Shield,
  FileQuestion,
  ExternalLink
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/header";
import Footer from "@/components/footer";

interface HelpCard {
  icon: React.ElementType;
  title: string;
  description: string;
  link?: string;
  external?: boolean;
  color: string;
  iconColor: string;
}

export default function Support() {
  const helpTopics: HelpCard[] = [
    {
      icon: Home,
      title: "Finding a Place",
      description: "How to search and book properties",
      link: "/properties",
      color: "from-blue-50 to-blue-100",
      iconColor: "text-blue-600",
    },
    {
      icon: Wrench,
      title: "Getting Services",
      description: "How to hire service providers",
      link: "/services",
      color: "from-orange-50 to-orange-100",
      iconColor: "text-orange-600",
    },
    {
      icon: CreditCard,
      title: "Payments",
      description: "Payment methods and refunds",
      color: "from-green-50 to-green-100",
      iconColor: "text-green-600",
    },
    {
      icon: Shield,
      title: "Safety & Security",
      description: "Staying safe during your trip",
      color: "from-purple-50 to-purple-100",
      iconColor: "text-purple-600",
    },
    {
      icon: FileQuestion,
      title: "Host Questions",
      description: "Listing your property on Alga",
      link: "/become-host",
      color: "from-yellow-50 to-yellow-100",
      iconColor: "text-yellow-600",
    },
    {
      icon: Wrench,
      title: "Provider Questions",
      description: "Offering services on Alga",
      link: "/become-provider",
      color: "from-teal-50 to-teal-100",
      iconColor: "text-teal-600",
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#f6f2ec" }}>
      <Header />

      {/* Hero Section */}
      <div className="border-b" style={{ background: "#fff", borderColor: "#e5d9ce" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
          <div className="flex justify-center mb-6">
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg"
              style={{ background: "#8a6e4b" }}
            >
              <HelpCircle className="w-10 h-10 text-white" />
            </div>
          </div>
          
          <h1 className="text-3xl sm:text-5xl font-bold mb-4" style={{ color: "#2d1405" }}>
            How Can We Help? 🤝
          </h1>
          <p className="text-lg sm:text-2xl max-w-2xl mx-auto" style={{ color: "#5a4a42" }}>
            We're here to make your experience smooth and easy
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Help Topics */}
        <section className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8" style={{ color: "#2d1405" }}>
            Browse Help Topics
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {helpTopics.map((topic, index) => {
              const content = (
                <Card 
                  className={`h-full transition-all duration-200 hover:shadow-xl hover:-translate-y-1 cursor-pointer border-0 bg-gradient-to-br ${topic.color}`}
                  data-testid={`card-${topic.title.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <CardContent className="p-8 text-center">
                    <div className={`inline-block p-5 rounded-2xl bg-white/80 ${topic.iconColor} mb-4 shadow-md`}>
                      <topic.icon className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-xl mb-2" style={{ color: "#2d1405" }}>
                      {topic.title}
                    </h3>
                    <p className="text-sm" style={{ color: "#5a4a42" }}>
                      {topic.description}
                    </p>
                  </CardContent>
                </Card>
              );

              if (topic.link) {
                return topic.external ? (
                  <a key={index} href={topic.link} target="_blank" rel="noopener noreferrer">
                    {content}
                  </a>
                ) : (
                  <Link key={index} href={topic.link}>
                    {content}
                  </Link>
                );
              }

              return <div key={index}>{content}</div>;
            })}
          </div>
        </section>

        {/* Contact Options - Bigger Buttons */}
        <section className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8" style={{ color: "#2d1405" }}>
            Get in Touch
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <a href="tel:+251911234567">
              <Button
                size="lg"
                className="w-full h-24 text-xl rounded-2xl shadow-lg hover:shadow-xl transition-all flex-col gap-2"
                style={{ background: "#86a38f" }}
                data-testid="button-call"
              >
                <Phone className="h-8 w-8" />
                Call Us
              </Button>
            </a>

            <a href="mailto:support@alga.et">
              <Button
                size="lg"
                className="w-full h-24 text-xl rounded-2xl shadow-lg hover:shadow-xl transition-all flex-col gap-2"
                style={{ background: "#8a6e4b" }}
                data-testid="button-email"
              >
                <Mail className="h-8 w-8" />
                Email Us
              </Button>
            </a>

            <Button
              size="lg"
              className="w-full h-24 text-xl rounded-2xl shadow-lg hover:shadow-xl transition-all flex-col gap-2"
              style={{ background: "#2d1405" }}
              data-testid="button-chat"
            >
              <MessageCircle className="h-8 w-8" />
              Live Chat
            </Button>
          </div>
        </section>

        {/* FAQ Section */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold mb-8" style={{ color: "#2d1405" }}>
            Common Questions
          </h2>
          
          <div className="space-y-4">
            {[
              {
                question: "How do I book a property?",
                answer: "Browse properties, select dates, and click 'Book Now'. You'll get instant confirmation!",
              },
              {
                question: "What payment methods do you accept?",
                answer: "We accept Chapa, Telebirr, Stripe, and PayPal for your convenience.",
              },
              {
                question: "Can I cancel my booking?",
                answer: "Yes! Check the property's cancellation policy for details.",
              },
              {
                question: "How do I become a host?",
                answer: "Click 'List Your Property' on your dashboard and fill out the simple form.",
              },
            ].map((faq, index) => (
              <Card key={index} className="border-0 shadow-md">
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-2" style={{ color: "#2d1405" }}>
                    {faq.question}
                  </h3>
                  <p style={{ color: "#5a4a42" }}>
                    {faq.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Still Need Help CTA */}
        <section className="mt-16 text-center">
          <Card 
            className="border-0 shadow-xl"
            style={{ background: "linear-gradient(135deg, #86a38f 0%, #8a6e4b 100%)" }}
          >
            <CardContent className="p-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                Still Need Help?
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Our friendly support team is here 24/7 to help you
              </p>
              <a href="mailto:support@alga.et">
                <Button
                  size="lg"
                  variant="secondary"
                  className="h-16 px-8 text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all"
                >
                  <Mail className="mr-3 h-6 w-6" />
                  Contact Support Team
                </Button>
              </a>
            </CardContent>
          </Card>
        </section>
      </div>

      <Footer />
    </div>
  );
}
