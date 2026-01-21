import AuthServices from "@/api/services/auth.services";
import { useMutation } from "@tanstack/react-query";

const useConnectAuthenticator = () => {
  return useMutation({
    mutationFn: AuthServices.connectAuthenticatorApp,
  });
};

export default useConnectAuthenticator;