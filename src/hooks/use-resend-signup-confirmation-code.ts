import AuthServices from '@/api/services/auth.services';
import { useMutation, type UseMutationResult } from '@tanstack/react-query';

export const useResendSignupConfirmationCode = (): UseMutationResult<
  {
    message: string;
    data: {};
  },
  Error,
  { username: string }
> =>
  useMutation({
    mutationFn: AuthServices.resendSignupConfirmationCode,
  });
