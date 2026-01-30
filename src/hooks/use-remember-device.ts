import {
  useMutation,
  type UseMutationOptions,
  type UseMutationResult,
} from '@tanstack/react-query';
import UserServices from '@/api/services/user.services';

const useRememberDevice = (
  options?: UseMutationOptions<
    {
      message: string;
      data: {};
    },
    Error,
    {
      deviceKey: string;
      shouldRememberDevice: boolean;
    }
  >,
): UseMutationResult<
  {
    message: string;
    data: {};
  },
  Error,
  {
    deviceKey: string;
    shouldRememberDevice: boolean;
  }
> => {
  return useMutation({
    mutationFn: UserServices.rememberDevice,
    ...options,
  });
};

export default useRememberDevice;
