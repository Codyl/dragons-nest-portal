import { createFileRoute } from "@tanstack/react-router";
import CreateAccountForm from "@/components/forms/create-account.form";

export const Route = createFileRoute("/(auth)/signup")({
  component: Signup,
});

function Signup() {
  return <CreateAccountForm />;
}
