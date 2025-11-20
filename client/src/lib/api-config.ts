import { Capacitor } from "@capacitor/core";

// ---- BASE API ROUTING ----
export const API_URL = Capacitor.isNativePlatform()
  ? "https://api.alga.et/api"
  : import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// ---- UNIVERSAL API FUNCTION ----
export async function apiRequest(
  method: string,
  path: string,
  body?: any
) {
  const url = `${API_URL}${path}`;

  console.log("📡 API Request →", url);

  const res = await fetch(url, {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `API Error: ${res.status}`);
  }

  return res.json();
}
