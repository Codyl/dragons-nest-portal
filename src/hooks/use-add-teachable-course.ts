import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import UserServices, {
  type TeachableCourseWithEnrollment,
} from '@/api/services/user.services';

const useAddTeachableCourse = (): UseMutationResult<
  {
    message: string;
    data: { teachableCourses: TeachableCourseWithEnrollment[] };
  },
  Error,
  {
    className: string;
    subjectId: string;
    matchesAllGrades: boolean;
    grades: string[];
    curriculum: string;
    maxStudents: number;
  }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: UserServices.addTeachableCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    },
  });
};

export default useAddTeachableCourse;
