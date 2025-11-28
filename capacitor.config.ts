import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'com.alga.app',
  appName: 'Alga',
  webDir: 'dist/public',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
  },
  plugins: {
    // Geolocation - for property search and meal delivery
    Geolocation: {
      enabled: true,
    },
    // Push Notifications - for booking confirmations
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    // Camera - for ID verification
    Camera: {
      enabled: true,
    },
    // Share - share properties with friends
    Share: {
      enabled: true,
    },
    // Browser - open external links
    Browser: {
      enabled: true,
    },
  },
};

export default config;
