import AuthServices from "@/api/services/auth.services";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";

const useLogout = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: AuthServices.logout,
    onSuccess: () => {
      sessionStorage.clear();
      localStorage.removeItem("AccessToken");
      localStorage.removeItem("RefreshToken");
      localStorage.removeItem("IdToken");
      router.navigate({ to: "/verify-username" });
    },
  });
};

export default useLogout;
