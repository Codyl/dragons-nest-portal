import UserServices from "@/api/services/user.services";
import { useMutation } from "@tanstack/react-query";

const useUpdateUserSettings = () => {
  return useMutation({
    mutationFn: UserServices.updateUserSettings,
  });
};

export default useUpdateUserSettings;
