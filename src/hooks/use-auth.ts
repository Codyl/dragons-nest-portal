import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import UserServices from "@/api/services/user.services";

export function useAuth() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["auth-status"],
    queryFn: async () => {
      const token = localStorage.getItem("AccessToken");
      if (!token) {
        return { authenticated: false };
      }
      try {
        await UserServices.getUser();
        return { authenticated: true };
      } catch {
        return { authenticated: false };
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  return {
    isLoading: isLoading,
    checkAuth: refetch,
    isAuthenticated: data?.authenticated ?? false,
  };
}
