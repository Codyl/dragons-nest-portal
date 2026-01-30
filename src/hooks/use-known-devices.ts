import UserServices from '@/api/services/user.services';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';

const useKnownDevices = (): UseQueryResult<
  {
    message: string;
    data: {
      DeviceKey: string;
      DeviceName: string;
      DeviceLastIPUsed: string;
      DeviceCreateDate: string;
      DeviceLastAuthenticatedDate: string;
      DeviceLastModifiedDate: string;
      City: string;
      Region: string;
      Country: string;
    }[];
  },
  Error
> => {
  return useQuery({
    queryKey: ['known-devices'],
    queryFn: UserServices.getKnownDevices,
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

export default useKnownDevices;
