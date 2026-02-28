import AuthServices from '@/api/services/auth.services';
import { useRouter } from '@tanstack/react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';

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
    onSuccess: () => {
      // Backend sets auth cookies; invalidate so next checkAuth() refetches /profile
      queryClient.invalidateQueries({ queryKey: ['auth-status'] });
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
