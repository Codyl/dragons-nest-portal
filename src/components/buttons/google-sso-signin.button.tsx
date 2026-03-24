import useGoogleSignin from '@/hooks/use-google-signin';
import { GoogleLogin } from '@react-oauth/google';

const GoogleSSOSigninButton = () => {
  const { signInWithGoogle, isPending, error } = useGoogleSignin();
  return (
    <>
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive w-full text-center">
          {error instanceof Error
            ? error.message
            : "Google signin failed. Please try again."}
        </div>
      )}
      {!isPending && !error && <GoogleLogin
        onSuccess={(credentialResponse) => {
          if (credentialResponse.credential) {
            signInWithGoogle(credentialResponse.credential);
          }
        }}
        width="400"
        onError={() => {
          console.log('Login Failed');
        }} />}
      {isPending && (
        <div className="rounded-md bg-muted-foreground/10 h-11 p-3 text-sm text-muted-foreground w-full text-center animate-pulse" />
      )}
    </>
  )
}

export default GoogleSSOSigninButton