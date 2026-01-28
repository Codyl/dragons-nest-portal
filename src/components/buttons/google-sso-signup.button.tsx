import { GoogleLogin } from "@react-oauth/google";
import useGoogleSignup from "@/hooks/use-google-signup";

const GoogleSSOSignupButton = () => {
  const { signUpWithGoogle, isPending, error } = useGoogleSignup();

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive w-full text-center">
          {error instanceof Error
            ? error.message
            : "Google signup failed. Please try again."}
        </div>
      )}
      <GoogleLogin
        onSuccess={(credentialResponse) => {
          if (credentialResponse.credential) {
            signUpWithGoogle(credentialResponse.credential);
          }
        }}
        onError={() => {}}
        useOneTap={false}
      />
      {isPending && (
        <span className="text-sm text-muted-foreground">Signing up...</span>
      )}
    </div>
  );
};

export default GoogleSSOSignupButton;
