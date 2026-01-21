import AuthServices from "@/api/services/auth.services";
import { useMutation } from "@tanstack/react-query";

const useCompleteMFAAuth = () => {
  return useMutation({
    mutationFn: AuthServices.completeMFAAuth,
  });
};

export default useCompleteMFAAuth;