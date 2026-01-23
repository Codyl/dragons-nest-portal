import { createFileRoute } from "@tanstack/react-router";
import ForgotPasswordForm from "@/components/forms/forgot-password.form";

export const Route = createFileRoute("/(auth)/_auth/forgot-password")({
  component: ForgotPassword,
});

function ForgotPassword() {
  return <ForgotPasswordForm />;
}
