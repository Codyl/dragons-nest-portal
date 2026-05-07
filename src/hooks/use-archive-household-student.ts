import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import ProfileServices, {
  type HouseholdStudentDraftAll,
} from '@/api/services/profile.services';

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
    mutationFn: ProfileServices.archiveHouseholdStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    },
  });
};

export default useArchiveHouseholdStudent;
