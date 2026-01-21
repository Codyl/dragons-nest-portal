import UserServices from "@/api/services/user.services";
import { useQuery } from "@tanstack/react-query";

const useLoggedInUser = () => {
  return useQuery({
    queryKey: ["user", "me"],
    queryFn: UserServices.getUser,
  });
};

export default useLoggedInUser;
