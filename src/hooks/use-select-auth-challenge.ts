import AuthServices from '@/api/services/auth.services';
import { useMutation, type UseMutationResult } from '@tanstack/react-query';

const useSelectAuthChallenge = (): UseMutationResult<
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
  { answer: string; username: string; session?: string; emailCode?: string }
> => {
  return useMutation({
    mutationFn: AuthServices.selectAuthChallenge,
  });
};

export default useSelectAuthChallenge;
