import { Search, Home, CreditCard, Key } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Search & Discover",
    description: ""
  },
  {
    icon: Home,
    title: "Book Your Stay",
    description: ""
  },
  {
    icon: CreditCard,
    title: "Pay Securely",
    description: ""
  },
  {
    icon: Key,
    title: "Get Access Code",
    description: ""
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

        {/* Desktop: Show 4-step grid */}
        <div className="hidden md:grid grid-cols-2 gap-8 max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="relative text-center"
              data-testid={`how-it-works-${index}`}
            >
              
              <div className="inline-flex items-center justify-center w-16 h-16 bg-eth-brown rounded-full mb-3 relative">
                <step.icon className="h-7 w-7 text-white" />
                <div className="absolute -top-2 -right-2 w-7 h-7 bg-cream-100 rounded-full flex items-center justify-center border-2 border-eth-brown">
                  <span className="font-bold text-eth-brown text-xs">{index + 1}</span>
                </div>
              </div>
              
              <h3 className="font-bold text-lg text-eth-brown">{step.title}</h3>
            </div>
          ))}
        </div>

        {/* Mobile: Show simplified text */}
        <div className="md:hidden text-center max-w-2xl mx-auto">
          <h3 className="font-bold text-xl text-eth-brown mb-2">
            Verified Properties
          </h3>
          <p className="text-eth-brown/70 text-base">
            All properties are verified by our team before listing
          </p>
        </div>
      </div>
    </div>
  );
}
