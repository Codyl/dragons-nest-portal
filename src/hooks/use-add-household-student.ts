import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import UserServices, {
  type HouseholdStudentDraftAll,
} from '@/api/services/user.services';

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
    mutationFn: UserServices.addHouseholdStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    },
  });
};

export default useAddHouseholdStudent;
