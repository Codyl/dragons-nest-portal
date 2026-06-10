import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import ProfileServices, {
  type HouseholdStudentDraftAll,
} from '@/api/services/profile.services';

const useRestoreHouseholdStudent = (): UseMutationResult<
  {
    message: string;
    data: { managedAccountsView: HouseholdStudentDraftAll[] };
  },
  Error,
  string
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ProfileServices.restoreHouseholdStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    },
  });
};

export default useRestoreHouseholdStudent;
