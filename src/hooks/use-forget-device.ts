import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import ProfileServices from '@/api/services/profile.services';

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
    mutationFn: ProfileServices.forgetDevice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['known-devices'] });
    },
  });
};

export default useForgetDevice;
