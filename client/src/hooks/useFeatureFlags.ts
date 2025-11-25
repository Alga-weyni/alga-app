import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export type FeatureFlag = {
  id: string;
  enabled: boolean;
  name: string;
  description: string;
};

export function useFeatureFlags() {
  const { data: flags = {}, isLoading, refetch } = useQuery<Record<string, FeatureFlag>>({
    queryKey: ['/api/feature-flags'],
    staleTime: 60 * 1000, // Cache for 1 minute
  });

  const isFeatureEnabled = (featureId: string): boolean => {
    return flags[featureId]?.enabled ?? true;
  };

  const toggleFeature = async (featureId: string, enabled: boolean) => {
    await apiRequest('PATCH', `/api/feature-flags/${featureId}`, { enabled });
    refetch();
  };

  return {
    flags,
    isLoading,
    isFeatureEnabled,
    toggleFeature,
    refetch,
  };
}
