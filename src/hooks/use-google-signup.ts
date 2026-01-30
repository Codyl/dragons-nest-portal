import AuthServices from '@/api/services/auth.services';
import { useRouter } from '@tanstack/react-router';
import { useMutation } from '@tanstack/react-query';

const useGoogleSignup = (): {
  signUpWithGoogle: (credential: string) => void;
  isPending: boolean;
  error: Error | null;
} => {
  const router = useRouter();

  const {
    mutate: googleSignup,
    isPending,
    error,
  } = useMutation({
    mutationFn: (json: { credential: string }) =>
      AuthServices.googleSSOSignup(json),
    onSuccess: (data) => {
      const result = data?.data?.AuthenticationResult;
      if (result?.AccessToken) {
        localStorage.setItem('AccessToken', result.AccessToken);
        localStorage.setItem('RefreshToken', result.RefreshToken ?? '');
        localStorage.setItem('IdToken', result.IdToken ?? '');
        router.navigate({ to: '/' });
      }
    },
  });

  return {
    signUpWithGoogle: (credential: string) => googleSignup({ credential }),
    isPending,
    error,
  };
};

export default useGoogleSignup;
