import { Shield, Check, Lock, Users } from "lucide-react";

const trustFeatures = [
  {
    icon: Shield,
    title: "Verified Properties",
    description: "All properties are verified by our team before listing"
  },
  {
    icon: Check,
    title: "ID Verification",
    description: "Secure identity verification for all hosts and guests"
  },
  {
    icon: Lock,
    title: "Secure Payments",
    description: "Multiple payment options with bank-level security"
  }
];

export function TrustSection() {
  return (
    <div className="bg-white py-16 border-t border-b border-cream-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:hidden">
          <h2 
            className="text-3xl sm:text-4xl font-bold text-eth-brown mb-3"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            How Alga Works
          </h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {trustFeatures.map((feature, index) => (
            <div 
              key={index} 
              className="text-center"
              data-testid={`trust-feature-${index}`}
            >
              <div className="inline-flex items-center justify-center w-14 h-14 bg-eth-brown/10 rounded-full mb-4">
                <feature.icon className="h-7 w-7 text-eth-brown" />
              </div>
              <h3 className="font-bold text-eth-brown mb-2">{feature.title}</h3>
              <p className="text-sm text-eth-brown/70">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
