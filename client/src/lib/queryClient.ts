import { Capacitor } from "@capacitor/core";

const isNativeMobile = Capacitor.isNativePlatform();

export const API_URL = isNativeMobile
  ? "https://api.alga.et/api"
  : import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export async function apiRequest(method: string, endpoint: string, body?: any) {
  const url = endpoint.startsWith("/api")
    ? `${API_URL}${endpoint.replace("/api", "")}`
    : `${API_URL}${endpoint}`;

  const res = await fetch(url, {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  let json: any = null;

  try {
    json = await res.json();
  } catch (e) {
    console.error("❌ Response wasn't JSON", await res.text());
    throw new Error("Invalid server response");
  }

  if (!res.ok) {
    throw new Error(json.message || `Request failed: ${res.status}`);
  }

  return json;
}
