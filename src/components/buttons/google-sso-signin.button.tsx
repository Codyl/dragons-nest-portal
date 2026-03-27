import useGoogleSignin from '@/hooks/use-google-signin';
import { GoogleLogin } from '@react-oauth/google';

const GoogleSSOSigninButton = () => {
  const { signInWithGoogle, isPending, error } = useGoogleSignin();
  return (
    <>

      {!isPending && <GoogleLogin
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
      {error && (
        <div className="text-destructive mt-1">
          {error.message ||
            "Google signin failed. Please try again."}
        </div>
      )}
    </>
  )
}

export default GoogleSSOSigninButton