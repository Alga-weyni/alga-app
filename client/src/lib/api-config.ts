import { Capacitor } from '@capacitor/core';

/**
 * API Configuration for Mobile and Web
 * 
 * On Web: Uses relative URLs (same origin as frontend)
 * On Mobile: Uses full backend URL
 */

// Production backend URL (Replit deployment)
const PRODUCTION_API_URL = 'https://ce3a76da-b414-4186-9234-d3db2b65b94b-00-2df3xcgh8cs7v.kirk.replit.dev';

// Check if running on native mobile platform
const isNativeMobile = Capacitor.isNativePlatform();

/**
 * Get the full API URL for a given endpoint
 * @param endpoint - API endpoint (e.g., '/api/auth/login')
 * @returns Full URL for the API request
 */
export function getApiUrl(endpoint: string): string {
  // On mobile: Use full production URL
  if (isNativeMobile) {
    return `${PRODUCTION_API_URL}${endpoint}`;
  }
  
  // On web: Use relative URL (same origin)
  return endpoint;
}

/**
 * Get the base API URL
 */
export function getBaseApiUrl(): string {
  return isNativeMobile ? PRODUCTION_API_URL : '';
}

export { isNativeMobile };
