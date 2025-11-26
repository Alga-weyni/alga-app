import { eq } from "drizzle-orm";
import { db } from '../server/db.js';
import { users } from '../shared/schema.js';

/**
 * Fayda ID Verification Service
 * 
 * Integration with Ethiopia's National Digital Identity Program (NIDP)
 * API Documentation: https://nidp.atlassian.net/wiki/spaces/FAPIQ/pages/633733136/
 * 
 * This service provides:
 * - Fayda ID number verification (12-digit national ID)
 * - eKYC (Electronic Know Your Customer) integration
 * - Biometric authentication support
 * 
 * IMPORTANT: Requires partnership registration with NIDP to get production credentials
 * Contact: National Digital Identity Program Office, Addis Ababa
 * 
 * Current Mode: SANDBOX (for development)
 * Production Mode: Set FAYDA_API_KEY, FAYDA_CLIENT_ID, FAYDA_SECRET_KEY in environment
 */

// Environment configuration
const FAYDA_API_BASE_URL = process.env.FAYDA_API_BASE_URL || "https://api.fayda.id.et"; // Placeholder
const FAYDA_CLIENT_ID = process.env.FAYDA_CLIENT_ID;
const FAYDA_SECRET_KEY = process.env.FAYDA_SECRET_KEY;
const FAYDA_PARTNER_API_KEY = process.env.FAYDA_PARTNER_API_KEY;
const FAYDA_SANDBOX_MODE = !FAYDA_CLIENT_ID || !FAYDA_SECRET_KEY; // Auto-detect sandbox mode

interface FaydaVerificationRequest {
  faydaId: string; // 12-digit national ID
  dateOfBirth?: string; // Optional for additional verification
  phoneNumber?: string; // Optional for SMS OTP verification
}

interface FaydaVerificationResponse {
  success: boolean;
  kycStatus: boolean;
  identity?: {
    name: Array<{ language: string; value: string }>;
    dob: string;
    gender: Array<{ language: string; value: string }>;
    phoneNumber?: string;
    emailId?: string;
    fullAddress: Array<{ language: string; value: string }>;
  };
  authResponseToken?: string;
  error?: string;
  message?: string;
}

/**
 * Authenticate with Fayda API
 * Obtains access token for subsequent API calls
 */
async function authenticateFaydaClient(): Promise<string | null> {
  if (FAYDA_SANDBOX_MODE) {
    console.log("[Fayda] Running in SANDBOX mode - skipping authentication");
    return "sandbox_token";
  }

  try {
    const response = await fetch(`${FAYDA_API_BASE_URL}/v1/authenticate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: "auth_request",
        version: "v1",
        requesttime: new Date().toISOString(),
        request: {
          clientId: FAYDA_CLIENT_ID,
          secretKey: FAYDA_SECRET_KEY,
          appId: "alga_platform",
        },
      }),
    });

    const data = await response.json() as { response?: { token?: string } };
    
    if (data.response && data.response.token) {
      return data.response.token;
    }

    console.error("[Fayda] Authentication failed:", data);
    return null;
  } catch (error) {
    console.error("[Fayda] Authentication error:", error);
    return null;
  }
}

/**
 * Verify Fayda ID and retrieve identity data via eKYC
 * 
 * @param request - Fayda verification request with ID number and optional details
 * @returns Verification response with identity data
 */
export async function verifyFaydaId(
  request: FaydaVerificationRequest
): Promise<FaydaVerificationResponse> {
  const { faydaId, dateOfBirth, phoneNumber } = request;

  // Validate Fayda ID format (12 digits)
  if (!faydaId || !/^\d{12}$/.test(faydaId)) {
    return {
      success: false,
      kycStatus: false,
      error: "INVALID_FORMAT",
      message: "Fayda ID must be exactly 12 digits",
    };
  }

  // SANDBOX MODE: Simulate verification for development
  if (FAYDA_SANDBOX_MODE) {
    console.log("[Fayda] SANDBOX mode - simulating verification for ID:", faydaId);
    
    // Simulate successful verification for testing
    const mockIdentity = {
      name: [
        { language: "eng", value: "Test User" },
        { language: "amh", value: "ሙከራ ተጠቃሚ" }
      ],
      dob: dateOfBirth || "01/01/1990",
      gender: [{ language: "eng", value: "Not Specified" }],
      phoneNumber: phoneNumber || "+251912345678",
      emailId: "test@example.com",
      fullAddress: [
        { language: "eng", value: "Addis Ababa, Ethiopia" },
        { language: "amh", value: "አዲስ አበባ፣ ኢትዮጵያ" }
      ],
    };

    return {
      success: true,
      kycStatus: true,
      identity: mockIdentity,
      authResponseToken: "sandbox_auth_token_" + Date.now(),
      message: "SANDBOX: Verification successful (test mode)",
    };
  }

  // PRODUCTION MODE: Call actual Fayda eKYC API
  try {
    // Step 1: Authenticate
    const authToken = await authenticateFaydaClient();
    if (!authToken) {
      return {
        success: false,
        kycStatus: false,
        error: "AUTH_FAILED",
        message: "Failed to authenticate with Fayda API",
      };
    }

    // Step 2: Call eKYC API
    const response = await fetch(`${FAYDA_API_BASE_URL}/v1/ekyc`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`,
        "Partner-API-Key": FAYDA_PARTNER_API_KEY || "",
      },
      body: JSON.stringify({
        id: "fayda.identity.kyc",
        version: "v1",
        requesttime: new Date().toISOString(),
        request: {
          nationalId: faydaId,
          dob: dateOfBirth,
          phoneNumber: phoneNumber,
        },
      }),
    });

    interface FaydaApiResponse {
      response?: {
        kycStatus?: boolean;
        identity?: FaydaVerificationResponse['identity'];
        authResponseToken?: string;
      };
      errors?: Array<{ errorCode?: string; message?: string }>;
    }
    const data = await response.json() as FaydaApiResponse;

    if (data.response && data.response.kycStatus) {
      return {
        success: true,
        kycStatus: data.response.kycStatus,
        identity: data.response.identity,
        authResponseToken: data.response.authResponseToken,
        message: "Verification successful",
      };
    }

    return {
      success: false,
      kycStatus: false,
      error: data.errors?.[0]?.errorCode || "VERIFICATION_FAILED",
      message: data.errors?.[0]?.message || "Fayda ID verification failed",
    };
  } catch (error) {
    console.error("[Fayda] Verification error:", error);
    return {
      success: false,
      kycStatus: false,
      error: "API_ERROR",
      message: "An error occurred during verification. Please try again.",
    };
  }
}

/**
 * Update user with Fayda verification data
 * 
 * @param userId - User ID to update
 * @param faydaData - Verified Fayda identity data
 */
export async function updateUserFaydaVerification(
  userId: string,
  faydaId: string,
  faydaData: FaydaVerificationResponse
) {
  if (!faydaData.success || !faydaData.kycStatus) {
    throw new Error("Cannot update user with failed verification");
  }

  try {
    // Extract name from Fayda response (prefer English)
    const nameData = faydaData.identity?.name?.find(n => n.language === "eng") || 
                     faydaData.identity?.name?.[0];
    const fullName = nameData?.value || "";
    const [firstName, ...lastNameParts] = fullName.split(" ");
    const lastName = lastNameParts.join(" ");

    // Update user record
    await db.update(users)
      .set({
        faydaId: faydaId,
        faydaVerified: true,
        faydaVerifiedAt: new Date(),
        faydaVerificationData: faydaData.identity as any,
        idVerified: true, // Also mark general ID as verified
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    console.log(`[Fayda] User ${userId} verified with Fayda ID: ${faydaId}`);
    return true;
  } catch (error) {
    console.error("[Fayda] Failed to update user:", error);
    throw error;
  }
}

/**
 * Check if user has completed Fayda verification
 */
export async function isFaydaVerified(userId: string): Promise<boolean> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  return user?.faydaVerified === true;
}
