import ProfileServices, {
  type ProfileUserData,
} from '@/api/services/profile.services';
import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

const useLoggedInUser = (): UseQueryResult<
  {
    message: string;
    data: ProfileUserData;
  },
  Error
> => {
  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: ProfileServices.getProfile,
  });
};

export default useLoggedInUser;
