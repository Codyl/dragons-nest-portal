import AuthServices from '@/api/services/auth.services';
import { useRouter } from '@tanstack/react-router';
import { useMutation } from '@tanstack/react-query';

const useGoogleSignup = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (json: { credential: string }) =>
      AuthServices.googleSSOSignup(json),
    onSuccess: (data) => {
      const result = data?.data?.AuthenticationResult;
      if (result) {
        router.navigate({ to: '/' });
      }
    },
  });
};

export default useGoogleSignup;
