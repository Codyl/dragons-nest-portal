import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useLocation } from "@tanstack/react-router";
import UserServices from "@/api/services/user.services";

export function useAuth() {
  const location = useLocation();

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

  useEffect(() => {
    refetch();
  }, [location.pathname, refetch]);

  // Listen for storage changes (e.g., logout in another tab)
  useEffect(() => {
    const handleStorageChange = () => {
      refetch();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [refetch]);

  return {
    isAuthenticated: data?.authenticated,
    isLoading: isLoading,
  };
}
