import AuthServices from '@/api/services/auth.services';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';

const useGenerateAuthenticatorSecret = (query: {
  session: string;
  username: string;
  accessToken?: string;
}): UseQueryResult<
  {
    message: string;
    data: {
      Session: string;
      qrString: string;
    };
  },
  Error
> => {
  return useQuery({
    queryKey: ['generate-authenticator-secret'],
    queryFn: () => AuthServices.generateAuthenticatorSecret(query),
  });
};

export default useGenerateAuthenticatorSecret;
