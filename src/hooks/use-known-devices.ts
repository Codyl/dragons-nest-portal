import UserServices from "@/api/services/user.services";
import { useQuery } from "@tanstack/react-query";

const useKnownDevices = () => {
  return useQuery({
    queryKey: ["known-devices"],
    queryFn: UserServices.getKnownDevices,
    staleTime: 1000 * 60 * 60 * 24, 
    gcTime: 1000 * 60 * 60 * 24, 
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

export default useKnownDevices;