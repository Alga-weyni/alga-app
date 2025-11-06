import { Capacitor } from '@capacitor/core';

export const isMobileApp = () => {
  // Check for dev toggle override
  if (typeof window !== 'undefined') {
    const devForceMobile = localStorage.getItem('dev-force-mobile');
    if (devForceMobile === 'true') {
      return true;
    }
  }
  
  return Capacitor.isNativePlatform();
};

export const isWeb = () => {
  return !isMobileApp();
};

export const getPlatform = () => {
  if (typeof window !== 'undefined') {
    const devForceMobile = localStorage.getItem('dev-force-mobile');
    if (devForceMobile === 'true') {
      return 'android'; // Simulate Android for dev testing
    }
  }
  
  return Capacitor.getPlatform();
};
