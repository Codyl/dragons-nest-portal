import AuthServices from '@/api/services/auth.services';
import { useMutation, type UseMutationResult } from '@tanstack/react-query';

const useForgotPassword = (): UseMutationResult<
  {
    message: string;
    data: {};
  },
  Error,
  { username: string }
> => {
  return useMutation({
    mutationFn: AuthServices.forgotPassword,
  });
};

export default useForgotPassword;
