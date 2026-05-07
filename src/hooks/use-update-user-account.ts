import ProfileServices from '@/api/services/profile.services';
import {
  useMutation,
  type UseMutationOptions,
  type UseMutationResult,
} from '@tanstack/react-query';

const useUpdateUserSettings = (
  options?: UseMutationOptions<
    {
      message: string;
      data: {};
    },
    Error,
    {
      email?: string;
      family_name?: string;
      middle_name?: string;
      given_name?: string;
      phone_number?: string;
    }
  >,
): UseMutationResult<
  {
    message: string;
    data: {};
  },
  Error,
  {
    email?: string;
    family_name?: string;
    middle_name?: string;
    given_name?: string;
    phone_number?: string;
  }
> => {
  return useMutation({
    mutationFn: ProfileServices.updateUserSettings,
    ...options,
  });
};

export default useUpdateUserSettings;
