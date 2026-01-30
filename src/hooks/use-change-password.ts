import UserServices from '@/api/services/user.services';
import { useMutation, type UseMutationResult } from '@tanstack/react-query';

const useChangePassword = (): UseMutationResult<
  { message: string; data: {} },
  Error,
  { currentPassword: string; newPassword: string }
> => {
  return useMutation({
    mutationFn: UserServices.changePassword,
  });
};

export default useChangePassword;
