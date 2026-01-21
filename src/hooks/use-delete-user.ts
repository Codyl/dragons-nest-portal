import AuthServices from "@/api/services/auth.services";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
const useDeleteUser = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: AuthServices.deleteUser,
    onSuccess: () => {
      sessionStorage.clear();
      localStorage.clear();
      router.navigate({ to: "/login" });
    },
  });
};

export default useDeleteUser;