import { DEFAULT_FEATURE_FLAGS, type FeatureFlag } from '../shared/feature-flags.js';

// In-memory feature flag storage (can be moved to database later)
let featureFlags: Record<string, FeatureFlag> = { ...DEFAULT_FEATURE_FLAGS };

export function getFeatureFlags(): Record<string, FeatureFlag> {
  return { ...featureFlags };
}

export function getFeatureFlag(flagId: string): FeatureFlag | undefined {
  return featureFlags[flagId];
}

export function isFeatureEnabled(flagId: string): boolean {
  return featureFlags[flagId]?.enabled ?? true;
}

export function setFeatureFlag(flagId: string, enabled: boolean): void {
  if (featureFlags[flagId]) {
    featureFlags[flagId].enabled = enabled;
  }
}

export function resetFeatureFlags(): void {
  featureFlags = { ...DEFAULT_FEATURE_FLAGS };
}
