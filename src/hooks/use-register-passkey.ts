import UserServices from '@/api/services/user.services';
import { passkeysQueryKey } from '@/hooks/use-passkeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { startRegistration } from '@simplewebauthn/browser';

const useRegisterPasskey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data: optionsJSON } =
        await UserServices.getPasskeyRegisterOptions();
      const credential = await startRegistration({
        optionsJSON: optionsJSON as unknown as Parameters<
          typeof startRegistration
        >[0]['optionsJSON'],
      });
      const { data: verifyResult } =
        await UserServices.verifyPasskeyRegistration(
          credential as unknown as Record<string, unknown>,
        );
      if (!verifyResult?.verified) {
        throw new Error('Passkey registration verification failed');
      }

      return verifyResult;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
      void queryClient.invalidateQueries({ queryKey: passkeysQueryKey });
    },
  });
};

export default useRegisterPasskey;
