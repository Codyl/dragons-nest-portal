import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import ProfileServices, {
  type TeachableSubjectWithEnrollment,
} from '@/api/services/profile.services';

const useRemoveTeachableSubject = (): UseMutationResult<
  {
    message: string;
    data: { teachableCourses: TeachableSubjectWithEnrollment[] };
  },
  Error,
  number
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ProfileServices.removeTeachableSubject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    },
  });
};

export default useRemoveTeachableSubject;
