import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import UserServices, {
  type HouseholdStudentDraftAll,
} from '@/api/services/user.services';

const useArchiveHouseholdStudent = (): UseMutationResult<
  {
    message: string;
    data: { householdStudentDrafts: HouseholdStudentDraftAll[] };
  },
  Error,
  string
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: UserServices.archiveHouseholdStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    },
  });
};

export default useArchiveHouseholdStudent;
