// Location utilities with caching to minimize API calls

interface LocationData {
  latitude: number;
  longitude: number;
  area: string;
  city: string;
  timestamp: number;
}

const CACHE_KEY = 'alga_user_location';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Get cached location if still valid
export const getCachedLocation = (): LocationData | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const data: LocationData = JSON.parse(cached);
    const age = Date.now() - data.timestamp;
    
    // Return cached data if less than 24 hours old
    if (age < CACHE_DURATION) {
      return data;
    }
    
    // Clear expired cache
    localStorage.removeItem(CACHE_KEY);
    return null;
  } catch {
    return null;
  }
};

// Save location to cache
export const cacheLocation = (location: LocationData): void => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(location));
  } catch {
    // Silent fail - caching is optional
  }
};

// Reverse geocode using Google Maps API (minimized calls via caching)
export const reverseGeocode = async (
  lat: number,
  lng: number
): Promise<{ area: string; city: string }> => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    return { area: 'Your Area', city: 'Addis Ababa' };
  }

  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
    );
    const data = await res.json();

    if (data.status !== 'OK' || !data.results?.length) {
      return { area: 'Your Area', city: 'Addis Ababa' };
    }

    const result = data.results[0];
    const components = result.address_components;

    // Extract neighborhood/area
    const areaComponent = components.find(
      (c: any) =>
        c.types.includes('neighborhood') ||
        c.types.includes('sublocality') ||
        c.types.includes('sublocality_level_1')
    );

    // Extract city
    const cityComponent = components.find(
      (c: any) =>
        c.types.includes('locality') ||
        c.types.includes('administrative_area_level_2')
    );

    return {
      area: areaComponent?.long_name || 'Your Area',
      city: cityComponent?.long_name || 'Addis Ababa',
    };
  } catch {
    return { area: 'Your Area', city: 'Addis Ababa' };
  }
};

// Get user's current location with browser geolocation
export const getCurrentLocation = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false, // Faster, less battery
      timeout: 10000,
      maximumAge: 300000, // Accept 5-minute-old position
    });
  });
};
