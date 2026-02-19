import { createFileRoute } from "@tanstack/react-router";
import ForgotUsernameForm from "@/components/forms/forgot-username.form";
import CommonCard from "@/components/cards/common-card";

export const Route = createFileRoute("/(auth)/_auth/forgot-username")({
  head: () => ({
    meta: [
      { title: "Forgot Username | Cody Lillywhite" },
      { name: "description", content: "Recover your username. Enter your email to receive a recovery code." },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return <CommonCard title="Forgot Username" description="Enter your email to receive a username recovery code">
    <ForgotUsernameForm />
  </CommonCard>;
}
