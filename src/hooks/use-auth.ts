import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import AuthServices from "@/api/services/auth.services";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem("AccessToken");
  });

  const { data, isLoading } = useQuery({
    queryKey: ["auth-status"],
    queryFn: async () => {
      const token = localStorage.getItem("AccessToken");
      if (!token) {
        return { authenticated: false };
      }
      try {
        await AuthServices.checkAuthenticated();
        return { authenticated: true };
      } catch {
        return { authenticated: false };
      }
    },
    enabled: isAuthenticated,
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const token = localStorage.getItem("AccessToken");
    console.log("checkin", token);
    setIsAuthenticated(!!token);
  }, []);

  // Listen for storage changes (e.g., logout in another tab)
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem("AccessToken");
      setIsAuthenticated(!!token);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return {
    isAuthenticated: data?.authenticated ?? isAuthenticated,
    isLoading: isLoading && isAuthenticated,
  };
}
