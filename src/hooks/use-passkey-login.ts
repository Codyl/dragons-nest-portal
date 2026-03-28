import { useMutation } from '@tanstack/react-query';
import { startAuthentication } from '@simplewebauthn/browser';
import { UAParser } from 'ua-parser-js';
import { useRouter } from '@tanstack/react-router';
import AuthServices from '@/api/services/auth.services';
import { parseCredentialRequestOptionsFromCognito } from '@/utils/cognito-webauthn-challenge';

export type UsePasskeyLoginOptions = {
  onMfaSetupRequired?: () => void;
};

const usePasskeyLogin = (options?: UsePasskeyLoginOptions) => {
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      const username = sessionStorage.getItem('username') || '';
      const session = sessionStorage.getItem('session') || '';
      if (!username || !session) {
        throw new Error(
          'Missing sign-in session. Go back and verify your email again.',
        );
      }

      const begin = await AuthServices.webAuthnSignInBegin({
        username,
        session,
      });

      if (begin.data.authenticationResult !== undefined) {
        router.navigate({ to: '/' });
        return;
      }

      const optionsJson = parseCredentialRequestOptionsFromCognito(
        begin.data.challengeParameters,
      );

      const credential = await startAuthentication({
        optionsJSON: optionsJson,
      });

      const parser = new UAParser();
      const deviceName = `${parser.getBrowser().name ?? 'Browser'} on ${parser.getOS().name ?? 'OS'}`;

      const complete = await AuthServices.webAuthnSignInComplete({
        username,
        session: begin.data.session ?? session,
        credential: credential as unknown as Record<string, unknown>,
        deviceName,
      });

      const cd = complete.data;
      if (cd.session) {
        sessionStorage.setItem('session', cd.session);
        activeSession = cd.session;
      }

      if (cd.challengeName === 'SOFTWARE_TOKEN_MFA') {
        router.navigate({ to: '/mfa/verify-code' });
        return;
      }

      if (cd.challengeName === 'NEW_PASSWORD_REQUIRED') {
        router.navigate({ to: '/reset-password' });
        return;
      }

      if (cd.challengeName === 'MFA_SETUP') {
        options?.onMfaSetupRequired?.();
        return;
      }

      if (!cd.challengeName) {
        router.navigate({ to: '/' });
      }
    },
  });
};

export default usePasskeyLogin;
