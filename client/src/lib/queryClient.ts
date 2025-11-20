import { Capacitor } from "@capacitor/core";

const isNativeMobile = Capacitor.isNativePlatform();

// 🌍 Base API URL
export const API_URL = isNativeMobile
  ? "https://api.alga.et/api"
  : import.meta.env.VITE_API_URL || "http://localhost:3000/api";

/**
 * Universal API request helper
 */
export async function apiRequest(method: string, endpoint: string, body?: any) {
  // 🔥 Ensure we NEVER produce /api/api/... by removing extra `/api`
  const cleanEndpoint = endpoint.replace(/^\/api/, "");

  const url = `${API_URL}${cleanEndpoint.startsWith("/") ? "" : "/"}${cleanEndpoint}`;

  console.log("🚀 Request →", url);

  const res = await fetch(url, {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  // Handle JSON safely
  let json: any;
  try {
    json = await res.json();
  } catch (e) {
    const raw = await res.text();
    console.error("❌ Server returned non-JSON:", raw);
    throw new Error("Invalid JSON response from server");
  }

  // Handle failed responses
  if (!res.ok) {
    throw new Error(json.message || `Request failed: ${res.status}`);
  }

  return json;
}
