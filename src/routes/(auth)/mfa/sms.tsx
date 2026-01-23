import { createFileRoute } from "@tanstack/react-router";
import SMSMFAForm from "@/components/forms/sms-mfa.form";
import CommonCard from "@/components/cards/common-card";

export const Route = createFileRoute("/(auth)/mfa/sms")({
  component: SMSMFA,
});

function SMSMFA() {
  return <CommonCard title="SMS MFA" description="Enter the code sent to your phone">
    <SMSMFAForm />
  </CommonCard>;
}
