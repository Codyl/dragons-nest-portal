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
      <GoogleLogin
        onSuccess={(credentialResponse) => {
          if (credentialResponse.credential) {
            signInWithGoogle(credentialResponse.credential);
          }
        }}
        onError={() => {
          console.log('Login Failed');
        }} />
      {isPending && (
        <span className="text-sm text-muted-foreground">Signing in...</span>
      )}
    </>
  )
}

export default GoogleSSOSigninButton