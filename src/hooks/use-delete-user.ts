import UserServices from "@/api/services/user.services";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";

const useDeleteUser = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: UserServices.deleteUser,
    onSuccess: () => {
      sessionStorage.clear();
      localStorage.clear();
      router.navigate({ to: "/verify-username" });
    },
  });
};

export default useDeleteUser;