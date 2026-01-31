import { useMutation } from "@tanstack/react-query";
import { Button } from "../ui/button";
import AuthServices from "@/api/services/auth.services";

const ResendSignupConfirmationCodeButton = () => {
  const {
    mutate: resendCode,
    isPending,
    error,
    data,
  } = useMutation({
    mutationFn: AuthServices.resendSignupConfirmationCode,
  });

  return (
    <>
      <Button
        variant="link"
        type="button"
        disabled={isPending}
        onClick={() =>
          resendCode({
            username: sessionStorage.getItem("username") || "",
          })
        }
        isPending={isPending}
      >
        Resend Code
      </Button>
      {error && <p className="text-destructive">Error: {error.message}</p>}
      {data && <p>Code resent</p>}
    </>
  );
};

export default ResendSignupConfirmationCodeButton;
