// Lemlem Template System - Handles 90% of questions WITHOUT AI (saves money!)
// Only uses AI for complex questions

import type { PropertyInfo, Booking, Property, User } from "@shared/schema";

export interface LemlemContext {
  user?: User;
  booking?: Booking;
  property?: Property;
  propertyInfo?: PropertyInfo;
}

export interface LemlemResponse {
  message: string;
  usedTemplate: boolean;
  confidence: number; // 0-1, how confident we are this is the right answer
}

// Emergency contacts for Ethiopia
const EMERGENCY_CONTACTS = {
  police: "911",
  ambulance: "907",
  fire: "939",
  touristPolice: "+251-11-155-0202",
};

// Keywords for pattern matching
const PATTERNS = {
  lockbox: /lockbox|lock box|code|entry code|door code|access code|get in|enter/i,
  wifi: /wifi|wi-fi|internet|password|network|connect/i,
  checkout: /checkout|check out|leave|departure|when.*leave|leaving/i,
  checkin: /checkin|check in|arrive|arrival|when.*arrive|arriving/i,
  emergency: /emergency|urgent|help|police|ambulance|fire|hospital|doctor|medical/i,
  host: /host|owner|contact.*host|call.*host|reach.*host|speak.*host/i,
  parking: /park|parking|car|vehicle|where.*park/i,
  heating: /heat|heating|warm|cold|temperature|thermostat|ac|air condition/i,
  tv: /tv|television|remote|channels|watch/i,
  kitchen: /kitchen|cook|stove|oven|microwave|refrigerator|fridge/i,
  rules: /rules|rule|allowed|can i|smoke|smoking|pet|pets|party|parties|quiet/i,
  restaurants: /restaurant|food|eat|dining|coffee|cafe|where.*eat/i,
  attractions: /attraction|visit|see|do|tourist|sightseeing|places/i,
  transportation: /transport|taxi|bus|ride|uber|bolt|driver|get around/i,
};

/**
 * Smart template matcher - finds best response without using AI
 */
export function matchTemplate(
  message: string,
  context: LemlemContext
): LemlemResponse | null {
  const lowerMessage = message.toLowerCase();

  // EMERGENCY - Highest priority (instant response)
  if (PATTERNS.emergency.test(message)) {
    return {
      message: `🚨 **Emergency Contacts in Ethiopia:**\n\n🚓 Police: ${EMERGENCY_CONTACTS.police}\n🚑 Ambulance: ${EMERGENCY_CONTACTS.ambulance}\n🔥 Fire Department: ${EMERGENCY_CONTACTS.fire}\n👮 Tourist Police: ${EMERGENCY_CONTACTS.touristPolice}\n\n${
        context.propertyInfo?.nearestHospital
          ? `Nearest Hospital: ${context.propertyInfo.nearestHospital}\n\n`
          : ""
      }${
        context.propertyInfo?.hostEmergencyPhone || context.propertyInfo?.propertyManagerPhone
          ? `Host/Manager: ${context.propertyInfo?.hostEmergencyPhone || context.propertyInfo?.propertyManagerPhone}\n\n`
          : ""
      }Stay safe! Help is on the way. 🙏`,
      usedTemplate: true,
      confidence: 1.0,
    };
  }

  // LOCKBOX/ACCESS CODE
  if (PATTERNS.lockbox.test(message)) {
    if (context.propertyInfo?.lockboxCode) {
      return {
        message: `🔑 **Access Information:**\n\n**Lockbox Code:** ${context.propertyInfo.lockboxCode}\n**Location:** ${context.propertyInfo.lockboxLocation || "At the property entrance"}\n\n${
          context.propertyInfo.entryInstructions
            ? `**Instructions:** ${context.propertyInfo.entryInstructions}\n\n`
            : ""
        }${
          context.propertyInfo.parkingInstructions
            ? `**Parking:** ${context.propertyInfo.parkingInstructions}\n\n`
            : ""
        }If you have any trouble getting in, call ${
          context.propertyInfo.propertyManagerPhone || "the host"
        }. Welcome to your stay! ✨`,
        usedTemplate: true,
        confidence: 1.0,
      };
    } else {
      return {
        message: `I don't have the lockbox code in my records yet, dear. Let me connect you with the host who can share it with you. ${
          context.propertyInfo?.hostEmergencyPhone
            ? `You can call them at ${context.propertyInfo.hostEmergencyPhone}`
            : "Check your booking confirmation or contact the host directly."
        }`,
        usedTemplate: true,
        confidence: 0.9,
      };
    }
  }

  // WIFI PASSWORD
  if (PATTERNS.wifi.test(message)) {
    if (context.propertyInfo?.wifiPassword && context.propertyInfo?.wifiNetwork) {
      return {
        message: `📶 **WiFi Information:**\n\n**Network Name:** ${context.propertyInfo.wifiNetwork}\n**Password:** ${context.propertyInfo.wifiPassword}\n\nJust connect to the network and enter the password. You should be online in no time! ☕️`,
        usedTemplate: true,
        confidence: 1.0,
      };
    } else if (context.propertyInfo?.wifiPassword) {
      return {
        message: `📶 The WiFi password is: **${context.propertyInfo.wifiPassword}**\n\nLook for the wireless network and use this password to connect. Enjoy! ✨`,
        usedTemplate: true,
        confidence: 0.9,
      };
    } else {
      return {
        message: `I don't have the WiFi information in my records, dear. The host should have shared it in your booking details, or you can ask them directly. ${
          context.propertyInfo?.hostEmergencyPhone
            ? `Call them at ${context.propertyInfo.hostEmergencyPhone}`
            : ""
        }`,
        usedTemplate: true,
        confidence: 0.8,
      };
    }
  }

  // CHECK-OUT TIME
  if (PATTERNS.checkout.test(message)) {
    const checkoutTime = context.propertyInfo?.checkOutTime || "11:00 AM";
    return {
      message: `🏠 **Check-out is at ${checkoutTime}**\n\n${
        context.propertyInfo?.checkOutChecklist
          ? `**Before you leave:**\n${context.propertyInfo.checkOutChecklist}\n\n`
          : "Please make sure to:\n- Turn off all lights and AC\n- Lock all doors and windows\n- Return the keys to the lockbox\n\n"
      }Thank you for staying with us! We hope you had a wonderful experience. 🌟\n\nWould you mind leaving us a review? It helps future guests!`,
      usedTemplate: true,
      confidence: 1.0,
    };
  }

  // CHECK-IN TIME
  if (PATTERNS.checkin.test(message)) {
    const checkinTime = context.propertyInfo?.checkInTime || "2:00 PM";
    return {
      message: `🎉 **Check-in is at ${checkinTime}**\n\n${
        context.propertyInfo?.checkInNotes
          ? `${context.propertyInfo.checkInNotes}\n\n`
          : ""
      }${
        context.propertyInfo?.lockboxCode
          ? `The lockbox code is **${context.propertyInfo.lockboxCode}** (${context.propertyInfo.lockboxLocation || "at the entrance"}).\n\n`
          : ""
      }We can't wait to welcome you! Safe travels! ✨`,
      usedTemplate: true,
      confidence: 1.0,
    };
  }

  // HOST CONTACT
  if (PATTERNS.host.test(message)) {
    const phone = context.propertyInfo?.hostEmergencyPhone || context.propertyInfo?.propertyManagerPhone;
    if (phone) {
      return {
        message: `📞 **Contact Information:**\n\n${
          context.propertyInfo?.propertyManager
            ? `Property Manager: ${context.propertyInfo.propertyManager}\n`
            : "Host: "
        }${phone}\n\nFeel free to call or text! They're here to help make your stay comfortable. 😊`,
        usedTemplate: true,
        confidence: 1.0,
      };
    } else {
      return {
        message: `I don't have the host's contact information in my records. Please check your booking confirmation email, or I can help you with your question directly. What do you need help with?`,
        usedTemplate: true,
        confidence: 0.7,
      };
    }
  }

  // PARKING
  if (PATTERNS.parking.test(message)) {
    if (context.propertyInfo?.parkingInstructions) {
      return {
        message: `🚗 **Parking Information:**\n\n${context.propertyInfo.parkingInstructions}\n\nIf you need more help, just let me know!`,
        usedTemplate: true,
        confidence: 1.0,
      };
    }
  }

  // HEATING/AC
  if (PATTERNS.heating.test(message)) {
    if (context.propertyInfo?.heatingInstructions || context.propertyInfo?.acInstructions) {
      return {
        message: `🌡️ **Climate Control:**\n\n${
          context.propertyInfo.heatingInstructions
            ? `**Heating:** ${context.propertyInfo.heatingInstructions}\n\n`
            : ""
        }${
          context.propertyInfo.acInstructions
            ? `**Air Conditioning:** ${context.propertyInfo.acInstructions}\n\n`
            : ""
        }Let me know if you need more help getting comfortable!`,
        usedTemplate: true,
        confidence: 0.9,
      };
    }
  }

  // TV
  if (PATTERNS.tv.test(message)) {
    if (context.propertyInfo?.tvInstructions) {
      return {
        message: `📺 **TV Instructions:**\n\n${context.propertyInfo.tvInstructions}\n\nEnjoy your shows! 🍿`,
        usedTemplate: true,
        confidence: 0.9,
      };
    }
  }

  // KITCHEN
  if (PATTERNS.kitchen.test(message)) {
    if (context.propertyInfo?.kitchenAppliances) {
      return {
        message: `🍳 **Kitchen Information:**\n\n${context.propertyInfo.kitchenAppliances}\n\nEnjoy cooking! Let me know if you need anything else.`,
        usedTemplate: true,
        confidence: 0.9,
      };
    }
  }

  // HOUSE RULES
  if (PATTERNS.rules.test(message)) {
    return {
      message: `📋 **House Rules:**\n\n${
        context.propertyInfo?.quietHours
          ? `🔕 Quiet Hours: ${context.propertyInfo.quietHours}\n`
          : ""
      }${
        context.propertyInfo?.smokingAllowed !== undefined
          ? `🚭 Smoking: ${context.propertyInfo.smokingAllowed ? "Allowed" : "Not allowed"}\n`
          : ""
      }${
        context.propertyInfo?.petsAllowed !== undefined
          ? `🐕 Pets: ${context.propertyInfo.petsAllowed ? "Welcome" : "Not allowed"}\n`
          : ""
      }${
        context.propertyInfo?.partiesAllowed !== undefined
          ? `🎉 Parties: ${context.propertyInfo.partiesAllowed ? "Allowed" : "Not allowed"}\n`
          : ""
      }${
        context.propertyInfo?.additionalRules
          ? `\n${context.propertyInfo.additionalRules}\n`
          : ""
      }\nThank you for respecting the property! 🙏`,
      usedTemplate: true,
      confidence: 0.9,
    };
  }

  // RESTAURANTS
  if (PATTERNS.restaurants.test(message)) {
    if (context.propertyInfo?.nearestRestaurants) {
      return {
        message: `🍽️ **Recommended Restaurants Nearby:**\n\n${context.propertyInfo.nearestRestaurants}\n\nEnjoy your meal! Ethiopian food is amazing! ☕️`,
        usedTemplate: true,
        confidence: 0.9,
      };
    }
  }

  // ATTRACTIONS
  if (PATTERNS.attractions.test(message)) {
    if (context.propertyInfo?.nearestAttractions) {
      return {
        message: `🗺️ **Places to Visit:**\n\n${context.propertyInfo.nearestAttractions}\n\nHave a wonderful time exploring! Ethiopia has so much to offer! ✨`,
        usedTemplate: true,
        confidence: 0.9,
      };
    }
  }

  // TRANSPORTATION
  if (PATTERNS.transportation.test(message)) {
    if (context.propertyInfo?.transportationTips) {
      return {
        message: `🚕 **Getting Around:**\n\n${context.propertyInfo.transportationTips}\n\nSafe travels! 🛣️`,
        usedTemplate: true,
        confidence: 0.9,
      };
    }
  }

  // No template matched
  return null;
}

/**
 * Fallback responses when no property info is available
 */
/**
 * Multilingual greetings for Ethiopia's major languages
 */
const GREETINGS = {
  en: {
    hello: `Hello, dear! I'm Lemlem, your AI assistant. I'm here to help you with anything during your stay - from lockbox codes to local recommendations. What can I help you with? 😊`,
    thanks: `You're very welcome, dear! If you need anything else, I'm here 24/7. Enjoy your stay! ☕️✨`,
  },
  am: { // Amharic
    hello: `ሰላም! እኔ ለምለም ነኝ፣ የእርስዎ AI ረዳት። በእርስዎ ቆይታ ላይ ማንኛውንም ነገር ለመርዳት እዚህ ነኝ። ምን ልረዳዎ? 😊\n\n(Hello! I'm Lemlem, your AI assistant. I'm here to help with anything during your stay. What can I help you with?)`,
    thanks: `በጣም እናመሰግናለን! ሌላ ነገር ከፈለጉ፣ 24/7 እዚህ ነኝ። ቆይታዎን ይደሰቱ! ☕️✨\n\n(You're very welcome! If you need anything else, I'm here 24/7. Enjoy your stay!)`,
  },
  ti: { // Tigrinya
    hello: `ሰላም! ኣነ ለምለም እየ፣ AI ሓጋዚኽን። ኣብ ምጽናሕኩም ዝኾነ ነገር ንምሕጋዝ ኣብዚ ኣለኹ። እንታይ ክሕግዘኩም? 😊\n\n(Hello! I'm Lemlem, your AI assistant. I'm here to help with anything during your stay. What can I help you with?)`,
    thanks: `ብጣዕሚ እየ ዘመስግነኩም! ካልእ ነገር እንተደሊኹም፣ 24/7 ኣብዚ ኣለኹ። ምጽናሕኩም ኣስተማቕሩ! ☕️✨\n\n(You're very welcome! If you need anything else, I'm here 24/7. Enjoy your stay!)`,
  },
  om: { // Afaan Oromo
    hello: `Nagaa! Ani Lemlem jedhama, gargaaraa AI keessan. Yeroo turisimii keessan keessatti waan kamiyyuu isin gargaaruuf asitti argama. Maal isin gargaaruu danda'a? 😊\n\n(Hello! I'm Lemlem, your AI assistant. I'm here to help with anything during your stay. What can I help you with?)`,
    thanks: `Baay'ee galatoomaa! Waan biraa yoo barbaaddan, 24/7 asittin jira. Turizimii keessan itti gammadaa! ☕️✨\n\n(You're very welcome! If you need anything else, I'm here 24/7. Enjoy your stay!)`,
  },
};

export function getGeneralHelp(message: string, context?: LemlemContext): LemlemResponse | null {
  const lower = message.toLowerCase();
  const userPreferences = (context?.user as any)?.preferences || {};
  const language = userPreferences.language || 'en';
  const greetings = GREETINGS[language as keyof typeof GREETINGS] || GREETINGS.en;

  // Greeting detection (works in all Ethiopian languages)
  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey") || 
      lower.includes("selam") || lower.includes("ሰላም") || lower.includes("nagaa")) {
    return {
      message: greetings.hello,
      usedTemplate: true,
      confidence: 1.0,
    };
  }

  // Thank you detection (works in all Ethiopian languages)
  if (lower.includes("thank") || lower.includes("thanks") || 
      lower.includes("ameseginalehu") || lower.includes("አመሰግናለሁ") ||
      lower.includes("yeqenyeley") || lower.includes("galatoomaa")) {
    return {
      message: greetings.thanks,
      usedTemplate: true,
      confidence: 1.0,
    };
  }

  return null;
}
