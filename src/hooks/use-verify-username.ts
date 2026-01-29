import AuthServices from '@/api/services/auth.services';
import { useMutation, type UseMutationResult } from '@tanstack/react-query';

type VerifyUsernameResponse = {
  message: string;
  data: {
    Session: string;
    AvailableChallenges: string[];
  };
};

type VerifyUsernameRequest = {
  email: string;
  session?: string | undefined;
};

const useVerifyUsername = (): UseMutationResult<
  VerifyUsernameResponse,
  Error,
  VerifyUsernameRequest
> => {
  return useMutation({
    mutationFn: AuthServices.verifyUsername,
  });
};

export default useVerifyUsername;
