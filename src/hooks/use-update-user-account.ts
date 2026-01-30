import UserServices from '@/api/services/user.services';
import { useMutation, type UseMutationResult } from '@tanstack/react-query';

const useUpdateUserSettings = (): UseMutationResult<
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
    mutationFn: UserServices.updateUserSettings,
  });
};

export default useUpdateUserSettings;
