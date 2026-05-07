import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import UserServices, { type User } from '@/api/services/user.services';

const useGetTeachers = ({
  state,
  grade,
  subjectId,
}: {
  state: string;
  grade: string;
  subjectId: string;
}): UseQueryResult<
  {
    message: string;
    data: User[];
  },
  Error
> =>
  useQuery({
    queryKey: ['users', state, grade, subjectId],
    queryFn: () => UserServices.getUsers({ state, grade, subjectId }),
  });

export default useGetTeachers;
