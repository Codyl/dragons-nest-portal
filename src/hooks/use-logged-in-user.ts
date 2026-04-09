import UserServices, { type ProfileUserData } from '@/api/services/user.services';
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
    queryFn: UserServices.getUser,
  });
};

export default useLoggedInUser;
