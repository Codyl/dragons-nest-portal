import AuthServices from '@/api/services/auth.services';
import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { clearAuthenticated } from '@/lib/auth-session';

const useLogout = (): UseMutationResult<
  {
    message: string;
    data: {};
  },
  Error,
  void
> => {
  const router = useRouter();
  return useMutation({
    mutationFn: AuthServices.logout,
    onSuccess: () => {
      clearAuthenticated();
      sessionStorage.clear();
      localStorage.removeItem('NewDeviceModalDismissed');
      localStorage.removeItem('activestudentId');
      router.navigate({ to: '/verify-username' });
    },
  });
};

export default useLogout;
