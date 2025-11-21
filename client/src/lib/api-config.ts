// client/src/lib/api-config.ts
import { Capacitor } from "@capacitor/core";

const isNativeMobile = Capacitor.isNativePlatform();

// Web (prod) uses VITE_API_URL, native always uses live API.
// Local dev falls back to http://localhost:5000
export const API_URL = isNativeMobile
  ? "https://api.alga.et"
  : (import.meta.env.VITE_API_URL ?? "https://api.alga.et");

/**
 * Generic API helper.
 * Pass ONLY the endpoint (with or without /api).
 * Examples:
 *   apiRequest("GET", "/auth/user")
 *   apiRequest("POST", "/auth/request-otp/email/login", body)
 */
export async function apiRequest(
  method: string,
  endpoint: string,
  body?: unknown
) {
  // Ensure exactly one `/api` prefix
  const clean = endpoint.startsWith("/api")
    ? endpoint
    : `/api${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const url = `${API_URL}${clean}`;

  console.log("🌐 apiRequest →", method, url);

  const res = await fetch(url, {
    method,
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    const text = await res.text();
    console.error("❌ Non-JSON response:", text);
    throw new Error("Invalid server response");
  }

  if (!res.ok) {
    throw new Error(data?.message || `Request failed: ${res.status}`);
  }

  return data;
}
