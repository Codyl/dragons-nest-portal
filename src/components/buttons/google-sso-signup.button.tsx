import { GoogleLogin } from '@react-oauth/google';
import useGoogleSignup from '@/hooks/use-google-signup';

const GoogleSSOSignupButton = () => {
  const { mutate: signUpWithGoogle, isPending, error } = useGoogleSignup();

  return (
    <>
      {!isPending && (
        <GoogleLogin
          onSuccess={(credentialResponse) => {
            if (credentialResponse.credential) {
              signUpWithGoogle({ credential: credentialResponse.credential });
            }
          }}
          useOneTap={false}
          width="400"
        />
      )}
      {isPending && (
        <div className="rounded-md bg-muted-foreground/10 h-11 p-3 text-sm text-muted-foreground w-full text-center animate-pulse" />
      )}
      {error && (
        <div className="text-destructive mt-1">
          {error.message || 'Google signup failed. Please try again.'}
        </div>
      )}
    </>
  );
};

export default GoogleSSOSignupButton;
