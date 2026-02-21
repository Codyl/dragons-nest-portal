import { createFileRoute } from "@tanstack/react-router";
import LoginForm from "@/components/forms/login.form";
import CommonCard from "@/components/cards/common-card";
import { useRouter } from "@tanstack/react-router";
import CHALLENGE_NAMES from "@/utils/constants/challenge-names";

export const Route = createFileRoute("/(auth)/_auth/login")({
  head: () => ({
    meta: [
      { title: "Login | Cody Lillywhite" },
      { name: "description", content: "Sign in with your password or passwordless option." },
    ],
  }),
  component: Login,
});

function Login() {
  const router = useRouter();

  const availableChallenges = sessionStorage.getItem("availableChallenges")?.split(",") || [];
  const availablePasswordlessChallenges = ["WEB_AUTHN", "EMAIL_OTP", "SMS_OTP"].filter(challenge => availableChallenges?.includes(challenge));
  const availablePasswordChallenges = availableChallenges.filter(challenge => !availablePasswordlessChallenges.includes(challenge));

  if (availableChallenges.length === 0) {
    router.navigate({ to: "/verify-username" });
  }

  return (
    <>
      {availablePasswordChallenges.length > 0 && (
        <CommonCard title="Login" description="Enter your email and password to login">
          <LoginForm />
        </CommonCard>
      )}
    </>
  );
}
