import { createFileRoute } from "@tanstack/react-router";
import MFAForm from "@/components/forms/mfa.form";

export const Route = createFileRoute("/(auth)/mfa/")({
  component: MFA,
});

function MFA() {
  return <MFAForm />;
}
