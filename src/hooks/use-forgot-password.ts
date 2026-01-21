import AuthServices from "@/api/services/auth.services";
import { useMutation } from "@tanstack/react-query";

const useForgotPassword = () => {
  return useMutation({
    mutationFn: AuthServices.forgotPassword,
  });
};

export default useForgotPassword;
