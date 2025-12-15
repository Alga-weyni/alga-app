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
    // Mobile app: use environment-aware URL (needs full URL for native HTTP client)
    baseUrl = isProduction ? PRODUCTION_API_URL : DEVELOPMENT_API_URL;
  } else if (isProduction) {
    // Web app in production: use production API URL
    baseUrl = PRODUCTION_API_URL;
  } else {
    // Web app in development: use relative URL so browser uses same origin
    // This avoids CSP issues when served via Replit's proxy
    baseUrl = '';
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

/**
 * Get the full URL for an image/asset
 * Handles both relative URLs (old data) and absolute URLs (new data)
 * @param imageUrl - Image URL (can be relative like /uploads/... or /objects/... or absolute)
 * @returns Full URL for the image
 */
export function getImageUrl(imageUrl: string | undefined | null): string {
  if (!imageUrl) {
    return '';
  }
  
  // If already an absolute URL (starts with http/https), return as-is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // If it's a relative URL starting with /uploads or /objects, handle appropriately
  if (imageUrl.startsWith('/uploads/') || imageUrl.startsWith('/objects/')) {
    // For native mobile apps, always use full URL
    if (isNativeMobile) {
      const baseUrl = isProduction ? PRODUCTION_API_URL : DEVELOPMENT_API_URL;
      return `${baseUrl}${imageUrl}`;
    }
    
    // For web apps in production, use production API URL
    if (isProduction) {
      return `${PRODUCTION_API_URL}${imageUrl}`;
    }
    
    // For web apps in development (including Replit), use relative URL
    // The browser will resolve this relative to the current host
    return imageUrl;
  }
  
  // Return as-is for other cases (external URLs, data URLs, etc.)
  return imageUrl;
}

export { isNativeMobile };
