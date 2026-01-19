import AuthServices from "@/api/services/auth.services";
import { useMutation } from "@tanstack/react-query";

export const useResendSignupConfirmationCode = () =>
    useMutation({
        mutationFn: AuthServices.resendSignupConfirmationCode
    });
