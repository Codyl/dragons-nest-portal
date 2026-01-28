import AuthServices from "@/api/services/auth.services";
import { useRouter } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";

type GoogleSignupResponse = {
  data?: {
    AuthenticationResult?: {
      AccessToken?: string;
      RefreshToken?: string;
      IdToken?: string;
    };
  };
};

const useGoogleSignup = () => {
  const router = useRouter();

  const { mutate: googleSignup, isPending, error } = useMutation({
    mutationFn: (json: { credential: string }) =>
      AuthServices.googleSSOSignup(json) as Promise<GoogleSignupResponse>,
    onSuccess: (data) => {
      const result = data?.data?.AuthenticationResult;
      if (result?.AccessToken) {
        localStorage.setItem("AccessToken", result.AccessToken);
        localStorage.setItem("RefreshToken", result.RefreshToken ?? "");
        localStorage.setItem("IdToken", result.IdToken ?? "");
        router.navigate({ to: "/" });
      }
    },
  });

  return {
    signUpWithGoogle: (credential: string) => googleSignup({ credential }),
    isPending,
    error,
  };
};

export default useGoogleSignup;
