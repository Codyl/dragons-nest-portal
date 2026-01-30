import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import UserServices from '@/api/services/user.services';

const useForgetDevice = (): UseMutationResult<
  {
    message: string;
    data: {};
  },
  Error,
  { deviceKey: string }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: UserServices.forgetDevice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['known-devices'] });
    },
  });
};

export default useForgetDevice;
