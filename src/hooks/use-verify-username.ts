import AuthServices from "@/api/services/auth.services";
import { useMutation } from "@tanstack/react-query";

const useVerifyUsername = () => {
    return useMutation({
        mutationFn: AuthServices.verifyUsername
    });
};

export default useVerifyUsername;