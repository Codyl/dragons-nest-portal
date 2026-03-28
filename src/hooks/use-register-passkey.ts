import UserServices from '@/api/services/user.services';
import { passkeysQueryKey } from '@/hooks/use-passkeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { startRegistration } from '@simplewebauthn/browser';
import type { PublicKeyCredentialCreationOptionsJSON } from '@simplewebauthn/types';

const useRegisterPasskey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await UserServices.getWebAuthnRegistrationOptions();
      const credential = await startRegistration({
        optionsJSON: data
          .credentialCreationOptions as PublicKeyCredentialCreationOptionsJSON,
      });
      await UserServices.completeWebAuthnRegistration(
        credential as unknown as Record<string, unknown>,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
      void queryClient.invalidateQueries({ queryKey: passkeysQueryKey });
    },
  });
};

export default useRegisterPasskey;
