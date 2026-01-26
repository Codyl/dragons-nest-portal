import { useRouter } from "@tanstack/react-router";
import { Button } from "../ui/button";
import useSelectAuthChallenge from "@/hooks/use-select-auth-challenge";
import CHALLENGE_NAMES from "@/utils/constants/challenge-names";
import { cn } from "@/lib/utils";

const SelectOTPButton = ({ otpType, className }: { otpType: string, className?: string }) => {
  const router = useRouter();

  const selectAuthChallenge = useSelectAuthChallenge();

  return (
    <Button className={cn("capitalize", className)} onClick={() => {
      selectAuthChallenge.mutate({
        answer: otpType,
        username: sessionStorage.getItem("username") || "",
        session: sessionStorage.getItem("session") || "",
      }, {
        onSuccess: (data) => {
          console.log('data.data', data.data)
          sessionStorage.setItem("session", data.data.Session);
          router.navigate({ to: `/otp/${CHALLENGE_NAMES[otpType as keyof typeof CHALLENGE_NAMES].toLowerCase().split(" ")[0]}` });
        },
      })
    }} variant="outline" key={otpType}>
      {CHALLENGE_NAMES[otpType as keyof typeof CHALLENGE_NAMES]}
    </Button>
  );
};

export default SelectOTPButton; 