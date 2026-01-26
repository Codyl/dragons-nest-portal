import UserServices from "@/api/services/user.services";
import { useMutation } from "@tanstack/react-query";

const useChangePassword = () => {
  return useMutation({
    mutationFn: UserServices.changePassword,
  });
};

export default useChangePassword;
