import AuthServices from "@/api/services/auth.services";
import { useMutation } from "@tanstack/react-query";

const useSelectAuthChallenge = () => {
  return useMutation({
    mutationFn: AuthServices.selectAuthChallenge,
  });
};

export default useSelectAuthChallenge;
