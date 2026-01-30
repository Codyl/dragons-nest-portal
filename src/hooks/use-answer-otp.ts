import AuthServices from '@/api/services/auth.services';
import { useMutation, type UseMutationResult } from '@tanstack/react-query';

const useAnswerOTP = (): UseMutationResult<
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
    otpType: string;
    answer: string;
    username: string;
    session?: string;
    emailCode?: string;
  }
> => {
  return useMutation({
    mutationFn: AuthServices.answerOTP,
  });
};

export default useAnswerOTP;
