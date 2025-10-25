import addisAbabaImg from "@assets/stock_images/addis_ababa_ethiopia_ab074746.jpg";
import bahirDarImg from "@assets/stock_images/bahir_dar_ethiopia_l_aa3e2250.jpg";
import gondarImg from "@assets/stock_images/gondar_ethiopia_roya_bce991b8.jpg";

// 20 Major Ethiopian Cities (Alphabetically sorted for dropdown consistency)
export const ETHIOPIAN_CITIES = [
  "Adama",
  "Addis Ababa",
  "Arba Minch",
  "Axum",
  "Bahir Dar",
  "Bishoftu",
  "Debre Birhan",
  "Dessie",
  "Dire Dawa",
  "Gondar",
  "Hawassa",
  "Hossana",
  "Jijiga",
  "Jimma",
  "Kombolcha",
  "Lalibela",
  "Mekelle",
  "Nekemte",
  "Shashemene",
  "Wolaita Sodo",
] as const;

export const PROPERTY_TYPES = [
  { value: "hotel", label: "Hotel" },
  { value: "guesthouse", label: "Guesthouse" },
  { value: "traditional_home", label: "Traditional Home" },
  { value: "eco_lodge", label: "Eco Lodge" },
  { value: "apartment", label: "Apartment" },
  { value: "villa", label: "Villa" },
];

export const ETHIOPIAN_REGIONS = [
  "Addis Ababa",
  "Amhara",
  "Oromia",
  "SNNPR", // Southern Nations, Nationalities, and Peoples' Region
  "Tigray",
  "Afar",
  "Somali",
  "Benishangul-Gumuz",
  "Gambela",
  "Harari",
  "Dire Dawa",
];

export const AMENITIES = [
  "WiFi",
  "Air Conditioning",
  "Kitchen",
  "Parking",
  "Swimming Pool",
  "Restaurant",
  "Bar",
  "Gym",
  "Spa",
  "Conference Room",
  "Airport Shuttle",
  "Pet Friendly",
  "24/7 Reception",
  "Room Service",
  "Laundry Service",
  "Traditional Coffee Ceremony",
  "Cultural Tours",
  "Mountain View",
  "Lake View",
  "Garden",
];

export const PAYMENT_METHODS = [
  {
    id: "alga_pay",
    name: "Alga Pay",
    description: "Secure payment - Cards, Mobile Money & Banks",
    icon: "💳",
    recommended: true,
    featured: true,
  },
  {
    id: "alga_pay_international",
    name: "Alga Pay (International)",
    description: "Global cards (Visa, Mastercard, Alipay)",
    icon: "🌍",
    recommended: true,
    international: true,
  },
  {
    id: "telebirr",
    name: "Telebirr",
    description: "Ethiopian mobile money - Fast & Secure",
    icon: "📱",
  },
];

export const BOOKING_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
} as const;

export const PAYMENT_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  REFUNDED: "refunded",
} as const;

export const CURRENCY = "ETB";

export const FEATURED_DESTINATIONS = [
  {
    name: "Addis Ababa",
    description: "Capital city adventures",
    image: addisAbabaImg,
    priceFrom: 850,
  },
  {
    name: "Bahir Dar",
    description: "Lake Tana paradise",
    image: bahirDarImg,
    priceFrom: 650,
  },
  {
    name: "Gondar",
    description: "Royal city heritage",
    image: gondarImg,
    priceFrom: 750,
  },
];
