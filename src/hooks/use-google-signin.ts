import AuthServices from '@/api/services/auth.services';
import { useRouter } from '@tanstack/react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { markAuthenticated } from '@/lib/auth-session';

const useGoogleSignin = (): {
  signInWithGoogle: (credential: string) => void;
  isPending: boolean;
  error: Error | null;
} => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    mutate: googleSignin,
    isPending,
    error,
  } = useMutation({
    mutationFn: (json: { credential: string }) =>
      AuthServices.googleTokenExchange(json),
    onSuccess: (data) => {
      // So the new-device modal can hide when user signed in with Google
      sessionStorage.setItem(
        'lastLoginProvider',
        data?.data?.loginProvider ?? 'google',
      );
      queryClient.invalidateQueries({ queryKey: ['auth-status'] });
      markAuthenticated();
      router.navigate({ to: '/' });
    },
  });

  return {
    signInWithGoogle: (credential: string) => googleSignin({ credential }),
    isPending,
    error,
  };
};

export default useGoogleSignin;
