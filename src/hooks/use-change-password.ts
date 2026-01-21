import AuthServices from "@/api/services/auth.services";
import { useMutation } from "@tanstack/react-query";

const useChangePassword = () => {
  return useMutation({
    mutationFn: AuthServices.changePassword,
  });
};

export default useChangePassword;
