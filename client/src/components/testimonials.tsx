import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "Sarah Johnson",
    location: "London, UK",
    rating: 5,
    text: "My stay in Lalibela was absolutely magical. The traditional home was beautifully maintained, and the host's knowledge of the local culture made the experience unforgettable.",
    avatar: "SJ",
    property: "Lalibela Rock Heritage House"
  },
  {
    name: "Michael Chen",
    location: "Toronto, Canada",
    rating: 5,
    text: "Alga made booking so easy! The payment options including Stripe were seamless, and the property verification gave me confidence. The Hawassa villa exceeded all expectations.",
    avatar: "MC",
    property: "Hawassa Lakeside Villa"
  },
  {
    name: "Amina Hassan",
    location: "Dubai, UAE",
    rating: 5,
    text: "As an Ethiopian abroad, using Alga to find authentic stays back home was perfect. The Telebirr payment option was convenient, and the properties are truly authentic.",
    avatar: "AH",
    property: "Addis View Hotel"
  }
];

export function Testimonials() {
  return (
    <div className="bg-cream-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 
            className="text-3xl sm:text-4xl font-bold text-eth-brown mb-3"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            What Our Guests Say
          </h2>
          <p className="text-eth-brown/70 text-lg">
            Real experiences from travelers discovering Ethiopia
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow duration-300"
              data-testid={`testimonial-${index}`}
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              <p className="text-eth-brown/80 mb-6 leading-relaxed">
                "{testimonial.text}"
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-cream-200">
                <Avatar>
                  <AvatarFallback className="bg-eth-brown text-white">
                    {testimonial.avatar}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-eth-brown">{testimonial.name}</p>
                  <p className="text-sm text-eth-brown/60">{testimonial.location}</p>
                </div>
              </div>

              <div className="mt-3 text-xs text-eth-brown/50 italic">
                Stayed at {testimonial.property}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
