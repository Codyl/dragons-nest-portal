import { useMutation } from "@tanstack/react-query";
import AuthServices from "@/api/services/auth.services";

const useConfirmForgotPassword = () => {
  return useMutation({
    mutationFn: AuthServices.confirmForgotPassword,
  });
};

export default useConfirmForgotPassword;
