import { createFileRoute } from "@tanstack/react-router";
import MFAForm from "@/components/forms/mfa.form";
import CommonCard from "@/components/cards/common-card";

export const Route = createFileRoute("/(auth)/mfa/verify-code")({
  component: MFAVerifyCode,
});

function MFAVerifyCode() {
  return <CommonCard title="Verify Code" description="Enter the code sent to your email">
    <MFAForm />
  </CommonCard>;
}
