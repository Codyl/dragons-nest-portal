import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import AuthServices from '@/api/services/auth.services';

const useConfirmForgotPassword = (): UseMutationResult<
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
    mutationFn: AuthServices.confirmForgotPassword,
  });
};

export default useConfirmForgotPassword;
