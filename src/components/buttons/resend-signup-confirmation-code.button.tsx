import { useMutation } from "@tanstack/react-query";
import { Button } from "../ui/button";
import AuthServices from "@/api/services/auth.services";

const ResendSignupConfirmationCodeButton = () => {
    const {
        mutate: resendCode,
        isPending,
        error,
        data
    } = useMutation({
        mutationFn: AuthServices.resendSignupConfirmationCode
    });
    return (
        <>
            <Button
                type="button"
                disabled={isPending}
                onClick={() =>
                    resendCode({
                        username: sessionStorage.getItem("username") || ""
                    })
                }>
                Resend Code
            </Button>
            {isPending && <p>Resending code...</p>}
            {error && <p>Error: {error.message}</p>}
            {data && <p>Code resent</p>}
        </>
    );
};

export default ResendSignupConfirmationCodeButton;
