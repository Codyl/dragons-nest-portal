import { createFileRoute } from "@tanstack/react-router";
import EmailMFAForm from "@/components/forms/email-mfa.form";
import CommonCard from "@/components/cards/common-card";

export const Route = createFileRoute("/(auth)/mfa/email")({
  component: EmailMFA,
});

function EmailMFA() {
  return <CommonCard title="Email MFA" description="Enter the code sent to your email">
    <EmailMFAForm />
  </CommonCard>;
}
