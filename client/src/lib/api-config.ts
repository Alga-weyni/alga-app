import { Capacitor } from "@capacitor/core";

// Detect platform
const isNativeMobile = Capacitor.isNativePlatform();

/**
 * API Priorities
 * ───────────────────────────
 * 1) Mobile apps → Always hit full backend URL
 * 2) Web (production) → Uses VITE_API_URL from environment
 * 3) Web (dev) → Falls back to localhost
 */
const API_URL = isNativeMobile
  ? "https://api.alga.et"
  : import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * Universal request wrapper
 */
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
};

export { API_URL, isNativeMobile };
