import { useMutation, useQueryClient } from "@tanstack/react-query";
import UserServices from "@/api/services/user.services";


const useForgetDevice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: UserServices.forgetDevice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["known-devices"] });
    }
  });
};

export default useForgetDevice;