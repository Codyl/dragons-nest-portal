import ProfileServices from '@/api/services/profile.services';
import { useMutation, type UseMutationResult } from '@tanstack/react-query';

const useChangePassword = (): UseMutationResult<
  { message: string; data: {} },
  Error,
  { currentPassword: string; newPassword: string }
> => {
  return useMutation({
    mutationFn: ProfileServices.changePassword,
  });
};

export default useChangePassword;
