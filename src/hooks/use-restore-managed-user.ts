import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import ProfileServices, {
  type ManagedUserDraftAll,
} from '@/api/services/profile.services';

const useRestoreManagedUser = (): UseMutationResult<
  {
    message: string;
    data: { managedAccountsView: ManagedUserDraftAll[] };
  },
  Error,
  string
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ProfileServices.restoreManagedUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    },
  });
};

export default useRestoreManagedUser;
