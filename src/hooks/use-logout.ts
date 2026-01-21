import AuthServices from "@/api/services/auth.services";
import { useMutation } from "@tanstack/react-query";

const useLogout = () => {
  return useMutation({
    mutationFn: AuthServices.logout,
  });
};

export default useLogout;
