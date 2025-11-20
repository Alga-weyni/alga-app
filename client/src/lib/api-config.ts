import { Capacitor } from "@capacitor/core";

const isNativeMobile = Capacitor.isNativePlatform();

export const API_URL = isNativeMobile
  ? "https://api.alga.et"                         // no /api here
  : import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * Universal Request Wrapper
 */
export async function apiRequest(
  method: string,
  endpoint: string,
  body?: any
) {
  // Normalize endpoints to always include /api/
  const url = endpoint.startsWith("/api")
    ? `${API_URL}${endpoint}`
    : `${API_URL}/api${endpoint}`;

  const res = await fetch(url, {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  let json;
  try {
    json = await res.json();
  } catch {
    console.error("❌ Server returned non-JSON:", await res.text());
    throw new Error("Invalid JSON response from server");
  }

  if (!res.ok) {
    throw new Error(json?.message || `Request failed: ${res.status}`);
  }

  return json;
}
