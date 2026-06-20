import { unauthenticatedApi } from '@/api/api.unauthenticated.config';
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
    mutationFn: async (json) => {
      const response = await unauthenticatedApi.post('auth/answer-otp', {
        json,
      });
      return response.json();
    },
  });
};

export default useAnswerOTP;
