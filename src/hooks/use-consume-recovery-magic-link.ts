import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import AuthServices from '@/api/services/auth.services';

const useConsumeRecoveryMagicLink = (): UseMutationResult<
  { message: string; data: {} },
  Error,
  { token: string }
> => {
  return useMutation({
    mutationFn: AuthServices.consumeRecoveryMagicLink,
  });
};

export default useConsumeRecoveryMagicLink;
