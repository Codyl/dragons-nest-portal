import UserServices from '@/api/services/user.services';
import { useMutation, type UseMutationResult } from '@tanstack/react-query';

const useUpdateMFAPreference = (): UseMutationResult<
  {
    message: string;
    data: {};
  },
  Error,
  {
    emailMfaEnabled?: boolean;
    smsMfaEnabled?: boolean;
    softwareTokenMfaEnabled?: boolean;
    preferredMfa?: string;
  }
> => {
  return useMutation({
    mutationFn: UserServices.setUserMFAPreference,
  });
};

export default useUpdateMFAPreference;
