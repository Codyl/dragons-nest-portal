import ProfileServices from '@/api/services/profile.services';
import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';

const useCreatePassword = (): UseMutationResult<
  { message: string; data: {} },
  Error,
  { newPassword: string }
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ProfileServices.createPassword,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    },
  });
};

export default useCreatePassword;
