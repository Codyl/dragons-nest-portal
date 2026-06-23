import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import ProfileServices from '@/api/services/profile.services';

const useAuth = (): {
  isLoading: boolean;
  checkAuth: () => Promise<boolean>;
  isAuthenticated: boolean;
} => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['auth-status'],
    queryFn: async () => {
      try {
        await ProfileServices.getProfile();
        return { isAuthenticated: true };
      } catch {
        return { isAuthenticated: false };
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  const ensureAuth = useCallback(async () => {
    try {
      // if (data !== undefined) {
      //   return data.isAuthenticated;
      // }
      const session = await refetch();
      return session.data?.isAuthenticated ?? false;
    } catch (error: any) {
      return false;
    }
  }, [ refetch]);

  return {
    isLoading: isLoading,
    checkAuth: ensureAuth,
    isAuthenticated: data?.isAuthenticated ?? false,
  };
};

export default useAuth;
