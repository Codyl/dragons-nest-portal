import UserServices from "@/api/services/user.services";
import { useMutation } from "@tanstack/react-query";

const useUpdateMFAPreference = () => {
  return useMutation({
    mutationFn: UserServices.setUserMFAPreference,
  });
};

export default useUpdateMFAPreference;