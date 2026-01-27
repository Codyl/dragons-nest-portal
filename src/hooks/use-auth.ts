import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import UserServices from "@/api/services/user.services";

export function useAuth() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["auth-status"],
    queryFn: async () => {
      const token = localStorage.getItem("AccessToken");
      if (!token) {
        return { isAuthenticated: false };
      }
      try {
        const user = await UserServices.getUser();
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
      // Use refetch directly instead of ensureQueryData to avoid circular dependency
      const session = await refetch();
      return session.data?.isAuthenticated ?? false;
    } catch (error: any) {
      return false;
    }
  }, [refetch]);

  return {
    isLoading: isLoading,
    checkAuth: ensureAuth,
    isAuthenticated: data?.isAuthenticated ?? false,
  };
}
