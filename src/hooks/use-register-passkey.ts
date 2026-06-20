import ProfileServices from '@/api/services/profile.services';
import { passkeysQueryKey } from '@/hooks/use-passkeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { startRegistration } from '@simplewebauthn/browser';
import type { PublicKeyCredentialCreationOptionsJSON } from '@simplewebauthn/types';

const useRegisterPasskey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await ProfileServices.getWebAuthnRegistrationOptions();
      const credential = await startRegistration({
        optionsJSON:
          data.credentialCreationOptions as unknown as PublicKeyCredentialCreationOptionsJSON,
      });
      await ProfileServices.completeWebAuthnRegistration(
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
