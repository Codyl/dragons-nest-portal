import { createFileRoute } from "@tanstack/react-router";
import MFAForm from "@/components/forms/mfa.form";
import CommonCard from "@/components/cards/common-card";

export const Route = createFileRoute("/(auth)/mfa/")({
  component: MFA,
});

function MFA() {
  return <CommonCard title="MFA" description="Enter the code sent to your email">
    <MFAForm />
  </CommonCard>;
}
