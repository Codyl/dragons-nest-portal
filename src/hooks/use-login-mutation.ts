import { useMutation } from "@tanstack/react-query";
import AuthServices from "@/api/services/auth.services";

const useLoginMutation = () => {
  return useMutation({
    mutationFn: AuthServices.initiateAuth,
  });
};

export default useLoginMutation;
