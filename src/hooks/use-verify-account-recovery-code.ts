import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import AuthServices from '@/api/services/auth.services';

const useVerifyAccountRecoveryCode = (): UseMutationResult<
  {
    message: string;
    data: {
      AuthenticationResult?: {
        AccessToken?: string;
        RefreshToken?: string;
        IdToken?: string;
      };
    };
  },
  Error,
  { username: string; code: string; password: string }
> => {
  return useMutation({
    mutationFn: AuthServices.verifyAccountRecoveryCode,
  });
};

export default useVerifyAccountRecoveryCode;
