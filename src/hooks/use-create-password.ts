import UserServices from '@/api/services/user.services';
import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';

const useCreatePassword = (): UseMutationResult<
  { message: string; data: {} },
  Error,
  { newPassword: string }
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: UserServices.createPassword,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    },
  });
};

export default useCreatePassword;
