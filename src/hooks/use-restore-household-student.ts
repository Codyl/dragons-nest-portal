import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import UserServices, {
  type HouseholdStudentDraftAll,
} from '@/api/services/user.services';

const useRestoreHouseholdStudent = (): UseMutationResult<
  {
    message: string;
    data: { householdStudentDrafts: HouseholdStudentDraftAll[] };
  },
  Error,
  string
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: UserServices.restoreHouseholdStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    },
  });
};

export default useRestoreHouseholdStudent;
