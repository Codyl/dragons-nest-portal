import { createFileRoute } from "@tanstack/react-router";
import ConfirmSignupForm from "@/components/forms/confirm-signup.form";
import CommonCard from "@/components/cards/common-card";

export const Route = createFileRoute("/(auth)/_auth/confirm-signup")({
  component: ConfirmSignup,
});

function ConfirmSignup() {
  return <CommonCard title="Confirm Signup" description="Enter the code sent to your email">
    <ConfirmSignupForm />
  </CommonCard>;
}
