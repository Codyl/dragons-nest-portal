import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import UserServices from "@/api/services/user.services";

const useRememberDevice = (options?: UseMutationOptions<any, Error, any>) => {
  return useMutation({
    mutationFn: UserServices.rememberDevice,
    ...options,
  });
};

export default useRememberDevice;