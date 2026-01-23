import { createFileRoute } from "@tanstack/react-router";
import ForgotUsernameForm from "@/components/forms/forgot-username.form";

export const Route = createFileRoute("/(auth)/forgot-username")({
  component: RouteComponent,
});

function RouteComponent() {
  return <ForgotUsernameForm />;
}
