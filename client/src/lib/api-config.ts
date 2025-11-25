import { Capacitor } from '@capacitor/core';

/**
 * API Configuration for Mobile and Web
 * 
 * On Web: Uses relative URLs or full URLs based on environment
 * On Mobile: Uses environment-aware backend URL
 */

// Production backend URL (INSA-approved production domain)
const PRODUCTION_API_URL = 'https://api.alga.et';

// Development backend URL (Render or localhost)
const DEVELOPMENT_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Check if running on native mobile platform
const isNativeMobile = Capacitor.isNativePlatform();

// Check if running in production environment
const isProduction = import.meta.env.PROD;

/**
 * Get the full API URL for a given endpoint
 * @param endpoint - API endpoint (e.g., '/api/auth/login')
 * @returns Full URL for the API request
 */
export function getApiUrl(endpoint: string): string {
  // Determine which base URL to use
  let baseUrl = '';
  
  if (isNativeMobile) {
    // Mobile app: use environment-aware URL
    baseUrl = isProduction ? PRODUCTION_API_URL : DEVELOPMENT_API_URL;
  } else {
    // Web app: use production API in production, development in dev
    baseUrl = isProduction ? PRODUCTION_API_URL : DEVELOPMENT_API_URL;
  }
  
  return `${baseUrl}${endpoint}`;
}

/**
 * Get the base API URL
 */
export function getBaseApiUrl(): string {
  if (isProduction) {
    return PRODUCTION_API_URL;
  }
  return DEVELOPMENT_API_URL;
}

export { isNativeMobile };
