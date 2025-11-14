import { Capacitor } from '@capacitor/core';

/**
 * API Configuration for Mobile and Web
 * 
 * On Web: Uses relative URLs (same origin as frontend)
 * On Mobile: Uses full backend URL
 */

// Production backend URL (INSA-approved production domain)
const PRODUCTION_API_URL = 'https://api.alga.et';

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
