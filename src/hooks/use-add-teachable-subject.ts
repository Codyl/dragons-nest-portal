import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import ProfileServices, {
  type TeachableSubjectWithEnrollment,
} from '@/api/services/profile.services';

const useAddTeachableSubject = (): UseMutationResult<
  {
    message: string;
    data: { teachableCourses: TeachableSubjectWithEnrollment[] };
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
    mutationFn: ProfileServices.addTeachableSubject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    },
  });
};

export default useAddTeachableSubject;
