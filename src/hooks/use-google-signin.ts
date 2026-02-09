import AuthServices from '@/api/services/auth.services';
import { useRouter } from '@tanstack/react-router';
import { useMutation } from '@tanstack/react-query';

const useGoogleSignin = (): {
  signInWithGoogle: (credential: string) => void;
  isPending: boolean;
  error: Error | null;
} => {
  const router = useRouter();

  const {
    mutate: googleSignin,
    isPending,
    error,
  } = useMutation({
    mutationFn: (json: { credential: string }) =>
      AuthServices.googleSSOSignin(json),
    onSuccess: (data) => {
      const result = data?.data?.AuthenticationResult;
      if (result) {
        router.navigate({ to: '/' });
      }
    },
  });

  return {
    signInWithGoogle: (credential: string) => googleSignin({ credential }),
    isPending,
    error,
  };
};

export default useGoogleSignin;
