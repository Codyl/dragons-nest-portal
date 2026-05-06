import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import UserServices, {
  type TeachableCourseWithEnrollment,
} from '@/api/services/user.services';

const useRemoveTeachableCourse = (): UseMutationResult<
  {
    message: string;
    data: { teachableCourses: TeachableCourseWithEnrollment[] };
  },
  Error,
  number
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: UserServices.removeTeachableCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    },
  });
};

export default useRemoveTeachableCourse;
