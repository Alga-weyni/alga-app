import { Capacitor } from '@capacitor/core';

export const isMobileApp = () => {
  return Capacitor.isNativePlatform();
};

export const isWeb = () => {
  return !Capacitor.isNativePlatform();
};

export const getPlatform = () => {
  return Capacitor.getPlatform();
};
