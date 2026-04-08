import { createFileRoute } from '@tanstack/react-router';
import LoginForm from '@/components/forms/login.form';
import CommonCard from '@/components/cards/common-card';
import { useRouter } from '@tanstack/react-router';
import usePasskeyLogin from '@/hooks/use-passkey-login';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import MFAAuthenticatorQRCodeModal from '@/components/modals/mfa-authenticator-qrcode.modal';

export const Route = createFileRoute('/(auth)/_auth/login')({
  head: () => ({
    meta: [
      { title: 'Login | Cody Lillywhite' },
      {
        name: 'description',
        content: 'Sign in with your password or passwordless option.',
      },
    ],
  }),
  component: Login,
});

function Login() {
  const router = useRouter();
  const [showMfaSetupModal, setShowMfaSetupModal] = useState(false);
  const passkeyLogin = usePasskeyLogin({
    onMfaSetupRequired: () => setShowMfaSetupModal(true),
  });

  const availableChallenges =
    sessionStorage.getItem('availableChallenges')?.split(',') || [];
  const availablePasswordlessChallenges = [
    'WEB_AUTHN',
    'EMAIL_OTP',
    'SMS_OTP',
  ].filter((challenge) => availableChallenges?.includes(challenge));
  const availablePasswordChallenges = availableChallenges.filter(
    (challenge) => !availablePasswordlessChallenges.includes(challenge),
  );

  if (availableChallenges.length === 0) {
    router.navigate({ to: '/verify-username' });
  }

  const canPasskey = availablePasswordlessChallenges.includes('WEB_AUTHN');
  const canPassword = availablePasswordChallenges.length > 0;

  const description =
    canPasskey && canPassword
      ? 'Sign in with passkey or password.'
      : canPasskey
        ? 'Sign in with your passkey.'
        : 'Enter your email and password to login';

  if (!canPasskey && !canPassword) {
    return null;
  }

  return (
    <CommonCard
      title="Login"
      description={description}
    >
      <MFAAuthenticatorQRCodeModal
        show={showMfaSetupModal}
        setShow={setShowMfaSetupModal}
      />
      <div className="space-y-4">
        {canPasskey && (
          <>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => passkeyLogin.mutate()}
              disabled={passkeyLogin.isPending}
              data-testid="sign-in-with-passkey"
            >
              {passkeyLogin.isPending ? 'Signing in…' : 'Sign in with Passkey'}
            </Button>
            {passkeyLogin.isError && (
              <p
                className="text-sm text-destructive"
                data-testid="passkey-login-error"
              >
                {passkeyLogin.error?.message}
              </p>
            )}
          </>
        )}
        {canPasskey && canPassword && (
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with password
              </span>
            </div>
          </div>
        )}
        {canPassword && <LoginForm />}
      </div>
    </CommonCard>
  );
}
