import AuthServices from "@/api/services/auth.services";
import { useMutation } from "@tanstack/react-query";

const useAnswerOTP = () => {
  return useMutation({
    mutationFn: AuthServices.answerOTP,
  });
};

export default useAnswerOTP;