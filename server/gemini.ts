import { GoogleGenAI, Modality } from "@google/genai";

// Using Replit's AI Integrations for Gemini - FREE (no API key needed, billed to Replit credits)
const ai = new GoogleGenAI({
  apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY!,
  httpOptions: {
    apiVersion: "",
    baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL!,
  },
});

/**
 * Generate personalized welcome image for Alga onboarding
 * 100% FREE - Uses Replit AI Integrations (Gemini)
 * 
 * @param userName - User's first name
 * @param role - User role (guest, host, dellala, operator, admin)
 * @returns Base64 data URL of generated image
 */
export async function generateWelcomeImage(
  userName: string,
  role: string
): Promise<string> {
  const roleDescriptions: Record<string, string> = {
    guest: "traveler exploring Ethiopia's beautiful accommodations",
    host: "property owner sharing their unique space with guests",
    dellala: "agent earning commissions by connecting properties with travelers",
    operator: "verification specialist ensuring platform quality and safety",
    admin: "platform administrator managing Alga's operations",
  };

  const roleColors: Record<string, string> = {
    guest: "warm terracotta and cream",
    host: "rich brown and gold",
    dellala: "emerald green and white",
    operator: "deep blue and silver",
    admin: "royal purple and cream",
  };

  const prompt = `Create a beautiful, professional welcome banner image for ${userName}, a new ${role} on Alga (አልጋ), an Ethiopian property rental platform.

Style Requirements:
- Background: Smooth gradient using ${roleColors[role] || "emerald and cream"} colors
- Ethiopian aesthetic: Incorporate subtle traditional patterns or geometric designs
- Modern and clean: Minimalist, professional look
- Warm and welcoming: Inviting atmosphere with soft lighting
- Text overlay space: Leave center area clear for text overlay
- Dimensions: Landscape format (16:9 aspect ratio)
- Cultural elements: Subtle Ethiopian coffee ceremony items, traditional baskets, or woven patterns in background

Visual elements to include:
- Soft, elegant gradient background
- Subtle Ethiopian geometric patterns (Habesha kemis-inspired)
- Warm golden lighting effect
- Clean, uncluttered composition
- Space for "ሰላም ${userName}!" greeting text
- Role-appropriate imagery: ${roleDescriptions[role]}

Avoid:
- Text in the image (we'll overlay that)
- Busy or cluttered backgrounds
- Harsh colors or sharp contrasts
- Stock photo look

The image should feel authentic, warm, and culturally Ethiopian while maintaining a modern, professional aesthetic.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      },
    });

    const candidate = response.candidates?.[0];
    const imagePart = candidate?.content?.parts?.find((part: any) => part.inlineData);
    
    if (!imagePart?.inlineData?.data) {
      throw new Error("No image data in response");
    }

    const mimeType = imagePart.inlineData.mimeType || "image/png";
    return `data:${mimeType};base64,${imagePart.inlineData.data}`;
  } catch (error) {
    console.error("Error generating welcome image:", error);
    // Fallback: return empty string, component will use CSS gradient instead
    return "";
  }
}

/**
 * Generate personalized welcome message with Ethiopian proverbs
 * 100% FREE - Uses Replit AI Integrations (Gemini)
 */
export async function generateWelcomeMessage(
  userName: string,
  role: string
): Promise<string> {
  const prompt = `Generate a warm, culturally authentic welcome message for ${userName}, a new ${role} on Alga (አልጋ - "bed" in Amharic), an Ethiopian property rental platform.

Requirements:
1. Start with "ሰላም ${userName}!" (Selam - Hello)
2. Include one relevant Ethiopian proverb in English (not Amharic)
3. Explain how ${role}s contribute to Alga's mission
4. Keep it warm, encouraging, and culturally authentic
5. Maximum 3 sentences

Ethiopian proverbs to choose from (pick most relevant):
- "Coffee is our bread" (hospitality is essential)
- "A single stick may smoke, but it will not burn" (unity and collaboration)
- "He who learns, teaches" (knowledge sharing)
- "Milk and honey have different colors, but they share the same house peacefully" (diversity and harmony)

Tone: Warm, welcoming, inspiring, culturally Ethiopian`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    
    return response.text || `ሰላም ${userName}! Welcome to Alga, where Ethiopian hospitality meets modern convenience.`;
  } catch (error) {
    console.error("Error generating welcome message:", error);
    return `ሰላም ${userName}! Welcome to Alga, where Ethiopian hospitality meets modern convenience.`;
  }
}
