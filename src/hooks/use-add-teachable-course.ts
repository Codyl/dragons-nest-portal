import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import ProfileServices, {
  type TeachableCourseWithEnrollment,
} from '@/api/services/profile.services';

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
    mutationFn: ProfileServices.addTeachableCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    },
  });
};

export default useAddTeachableCourse;
