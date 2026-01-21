import AuthServices from "@/api/services/auth.services";
import { useQuery } from "@tanstack/react-query";

const useGenerateAuthenticatorSecret = (query: {
  session: string;
  username: string;
  accessToken?: string;
}) => {
  return useQuery({
    queryKey: ["generate-authenticator-secret"],
    queryFn: () => AuthServices.generateAuthenticatorSecret(query),
  });
};

export default useGenerateAuthenticatorSecret;