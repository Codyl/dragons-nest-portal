import UserServices from '@/api/services/user.services';
import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';

const useDeleteUser = (): UseMutationResult<
  { message: string; data: {} },
  Error,
  { password?: string; mfaCode?: string; googleCredential?: string }
> => {
  const router = useRouter();

  return useMutation({
    mutationFn: UserServices.deleteUser,
    onSuccess: () => {
      sessionStorage.clear();
      localStorage.clear();
      router.navigate({ to: '/verify-username' });
    },
  });
};

export default useDeleteUser;
