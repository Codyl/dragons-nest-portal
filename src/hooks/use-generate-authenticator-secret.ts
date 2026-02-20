import AuthServices from '@/api/services/auth.services';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';

const useGenerateAuthenticatorSecret = (params: {
  session: string;
  username: string;
  accessToken?: string;
  enabled?: boolean;
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
  const { enabled = true, ...query } = params;
  return useQuery({
    queryKey: ['generate-authenticator-secret', query.session, query.username],
    queryFn: () => AuthServices.generateAuthenticatorSecret(query),
    enabled: enabled && (!!query.session || !!query.username),
  });
};

export default useGenerateAuthenticatorSecret;
