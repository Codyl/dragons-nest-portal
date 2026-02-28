import {
  useMutation,
  type UseMutationOptions,
  type UseMutationResult,
} from '@tanstack/react-query';
import { rememberDevice } from 'aws-amplify/auth';

const useRememberDevice = (
  options?: UseMutationOptions<void, Error, void>,
): UseMutationResult<void, Error, void> => {
  return useMutation({
    mutationFn: async () => {
      await rememberDevice();
    },
    ...options,
  });
};

export default useRememberDevice;
