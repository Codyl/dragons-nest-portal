import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import ProfileServices, {
  type HouseholdStudentDraftAll,
} from '@/api/services/profile.services';

const useAddHouseholdStudent = (): UseMutationResult<
  {
    message: string;
    data: { householdStudentDrafts: HouseholdStudentDraftAll[] };
  },
  Error,
  { displayName: string; currentGrade: number }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ProfileServices.addHouseholdStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    },
  });
};

export default useAddHouseholdStudent;
