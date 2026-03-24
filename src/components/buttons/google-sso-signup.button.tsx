import { GoogleLogin } from "@react-oauth/google";
import useGoogleSignup from "@/hooks/use-google-signup";

const GoogleSSOSignupButton = () => {
  const { mutate: signUpWithGoogle, isPending, error } = useGoogleSignup();

  return (
    <>
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive w-full text-center">
          {error
            ? error.message
            : "Google signup failed. Please try again."}
        </div>
      )}
      {!isPending && !error && <GoogleLogin
        onSuccess={(credentialResponse) => {
          if (credentialResponse.credential) {
            signUpWithGoogle({ credential: credentialResponse.credential });
          }
        }}
        useOneTap={false}
        width="400"
      />}
      {isPending && (
        <div className="rounded-md bg-muted-foreground/10 h-11 p-3 text-sm text-muted-foreground w-full text-center animate-pulse" />
      )}
    </>
  );
};

export default GoogleSSOSignupButton;
