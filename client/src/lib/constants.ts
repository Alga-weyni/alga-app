import addisAbabaImg from "@assets/stock_images/addis_ababa_ethiopia_ab074746.jpg";
import bahirDarImg from "@assets/stock_images/bahir_dar_ethiopia_l_aa3e2250.jpg";
import gondarImg from "@assets/stock_images/gondar_ethiopia_roya_bce991b8.jpg";

export const ETHIOPIAN_CITIES = [
  "Addis Ababa",
  "Bahir Dar",
  "Gondar",
  "Lalibela",
  "Hawassa",
  "Dire Dawa",
  "Mekelle",
  "Jimma",
  "Adama",
  "Awassa",
  "Harar",
  "Axum",
  "Dessie",
  "Gambela",
  "Jijiga",
  "Assosa",
  "Semera",
];

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
    id: "cbe",
    name: "Commercial Bank of Ethiopia",
    description: "Secure payment via CBE",
    icon: "🏛️",
  },
  {
    id: "dashen",
    name: "Dashen Bank",
    description: "Pay with Dashen Bank",
    icon: "🏦",
  },
  {
    id: "abyssinia",
    name: "Bank of Abyssinia",
    description: "Bank of Abyssinia payment",
    icon: "🏛️",
  },
  {
    id: "m_birr",
    name: "M-Birr",
    description: "Mobile money payment",
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
