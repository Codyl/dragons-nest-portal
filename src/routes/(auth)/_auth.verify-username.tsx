import VerifyUsernameForm from '@/components/forms/verify-username.form';
import CommonCard from '@/components/cards/common-card';
import { createFileRoute } from '@tanstack/react-router';
import { GoogleLogin } from '@react-oauth/google';
import useGoogleSignin from '@/hooks/use-google-signin';

export const Route = createFileRoute('/(auth)/_auth/verify-username')({
  head: () => ({
    meta: [
      { title: 'Sign In | Cody Lillywhite' },
      {
        name: 'description',
        content: 'Enter your username to sign in to your account.',
      },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { signInWithGoogle } = useGoogleSignin();

  return (
    <CommonCard
      title="Verify Username"
      description="Enter your username to verify your account"
    >
      <VerifyUsernameForm />
      <hr className="my-4" />
      {!window.Cypress && (<>
        <GoogleLogin
          onSuccess={(credentialResponse) => {
            if (credentialResponse.credential) {
              signInWithGoogle(credentialResponse.credential);
            }
          }}
          onError={() => {
            console.log('Login Failed');
          }}
          useOneTap
        />
      </>)}
      
    </CommonCard>
  );
}
