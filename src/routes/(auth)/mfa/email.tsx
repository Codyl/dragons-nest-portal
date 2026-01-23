import { createFileRoute } from "@tanstack/react-router";
import EmailMFAForm from "@/components/forms/email-mfa.form";

export const Route = createFileRoute("/(auth)/mfa/email")({
  component: EmailMFA,
});

function EmailMFA() {
  return <EmailMFAForm />;
}
