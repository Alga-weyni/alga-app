import { Search, Home, CreditCard, Key } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Search & Discover",
    description: "Browse verified Ethiopian properties from Addis to Axum"
  },
  {
    icon: Home,
    title: "Book Your Stay",
    description: "Choose dates, guests, and complete secure booking"
  },
  {
    icon: CreditCard,
    title: "Pay Securely",
    description: "Multiple payment options including Telebirr & Stripe"
  },
  {
    icon: Key,
    title: "Get Access Code",
    description: "Receive your 6-digit access code for seamless check-in"
  }
];

export function HowItWorks() {
  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 
            className="text-3xl sm:text-4xl font-bold text-eth-brown mb-3"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            How Alga Works
          </h2>
          <p className="text-eth-brown/70 text-lg max-w-2xl mx-auto">
            Booking your Ethiopian stay is simple and secure with our streamlined process
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="relative text-center"
              data-testid={`how-it-works-${index}`}
            >
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-eth-brown/30 to-transparent -z-10" />
              )}
              
              <div className="inline-flex items-center justify-center w-20 h-20 bg-eth-brown rounded-full mb-4 relative">
                <step.icon className="h-9 w-9 text-white" />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-cream-100 rounded-full flex items-center justify-center border-2 border-eth-brown">
                  <span className="font-bold text-eth-brown text-sm">{index + 1}</span>
                </div>
              </div>
              
              <h3 className="font-bold text-xl text-eth-brown mb-2">{step.title}</h3>
              <p className="text-eth-brown/70">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
