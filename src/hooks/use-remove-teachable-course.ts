import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import ProfileServices, {
  type TeachableCourseWithEnrollment,
} from '@/api/services/profile.services';

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
    mutationFn: ProfileServices.removeTeachableCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    },
  });
};

export default useRemoveTeachableCourse;
