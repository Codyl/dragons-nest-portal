import AuthServices from '@/api/services/auth.services';
import { useRouter } from '@tanstack/react-router';
import { useMutation } from '@tanstack/react-query';
import { markAuthenticated } from '@/lib/auth-session';

const useGoogleSignup = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (json: { credential: string }) =>
      AuthServices.googleSSOSignup(json),
    onSuccess: () => {
      markAuthenticated();
      router.navigate({ to: '/' });
    },
  });
};

export default useGoogleSignup;
