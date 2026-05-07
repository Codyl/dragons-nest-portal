import ProfileServices from '@/api/services/profile.services';
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
    mutationFn: ProfileServices.setUserMFAPreference,
  });
};

export default useUpdateMFAPreference;
