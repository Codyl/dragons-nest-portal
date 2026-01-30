import AuthServices from '@/api/services/auth.services';
import { useMutation, type UseMutationResult } from '@tanstack/react-query';

const useCompleteMFAAuth = (): UseMutationResult<
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
    username: string;
    password: string;
    softwareTokenMfaCode: string;
    session: string;
    challengeName: string;
  }
> => {
  return useMutation({
    mutationFn: AuthServices.completeMFAAuth,
  });
};

export default useCompleteMFAAuth;
