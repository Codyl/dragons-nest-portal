import AuthServices from '@/api/services/auth.services';
import { useMutation, type UseMutationResult } from '@tanstack/react-query';

const useConnectAuthenticator = (): UseMutationResult<
  {
    message: string;
    data: {
      Session: string;
      ChallengeName: string;
      AuthenticationResult?: {
        AccessToken?: string;
        RefreshToken?: string;
        IdToken?: string;
      };
    };
  },
  Error,
  {
    accessToken?: string;
    friendlyDeviceName: string;
    session: string;
    userCode: string;
    username: string;
    password: string;
  }
> => {
  return useMutation({
    mutationFn: AuthServices.connectAuthenticatorApp,
  });
};

export default useConnectAuthenticator;
