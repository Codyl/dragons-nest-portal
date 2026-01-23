import { createFileRoute } from "@tanstack/react-router";
import ForgotUsernameForm from "@/components/forms/forgot-username.form";
import CommonCard from "@/components/cards/common-card";

export const Route = createFileRoute("/(auth)/_auth/forgot-username")({
  component: RouteComponent,
});

function RouteComponent() {
  return <CommonCard title="Forgot Username" description="Enter your email to receive a username recovery code">
    <ForgotUsernameForm />
  </CommonCard>;
}
