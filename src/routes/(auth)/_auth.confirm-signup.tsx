import { createFileRoute } from "@tanstack/react-router";
import ConfirmSignupForm from "@/components/forms/confirm-signup.form";
import CommonCard from "@/components/cards/common-card";

export const Route = createFileRoute("/(auth)/_auth/confirm-signup")({
  head: () => ({
    meta: [
      { title: "Confirm Sign Up | Cody Lillywhite" },
      { name: "description", content: "Verify your email with the confirmation code we sent you." },
    ],
  }),
  component: ConfirmSignup,
});

function ConfirmSignup() {
  return <CommonCard title="Confirm Signup" description="Enter the code sent to your email">
    <ConfirmSignupForm />
  </CommonCard>;
}
