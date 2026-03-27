import AuthServices from '@/api/services/auth.services';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { startAuthentication } from '@simplewebauthn/browser';

const usePasskeyLogin = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data: optionsJSON } = await AuthServices.getPasskeyAuthOptions();
      const assertion = await startAuthentication({
        optionsJSON: optionsJSON as unknown as Parameters<
          typeof startAuthentication
        >[0]['optionsJSON'],
      });
      const { data: verifyResult } = await AuthServices.verifyPasskeyAuth(
        assertion as unknown as Record<string, unknown>,
      );
      if (!verifyResult?.verified) {
        throw new Error('Passkey authentication failed');
      }

      return verifyResult;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
      router.navigate({ to: '/' });
    },
  });
};

export default usePasskeyLogin;
