import { createFileRoute } from "@tanstack/react-router";
import ConfirmSignupForm from "@/components/forms/confirm-signup.form";

export const Route = createFileRoute("/(auth)/_auth/confirm-signup")({
  component: ConfirmSignup,
});

function ConfirmSignup() {
  return <ConfirmSignupForm />;
}
