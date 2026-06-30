import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import ProfileServices, {
  type ManagedUserDraftAll,
} from '@/api/services/profile.services';

const useAddManagedUser = (): UseMutationResult<
  {
    message: string;
    data: { managedAccountsView: ManagedUserDraftAll[] };
  },
  Error,
  { displayName: string; currentGrade: number }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ProfileServices.addManagedUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    },
  });
};

export default useAddManagedUser;
