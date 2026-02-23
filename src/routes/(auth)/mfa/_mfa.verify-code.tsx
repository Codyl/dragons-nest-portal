import { createFileRoute } from "@tanstack/react-router";
import MFAForm from "@/components/forms/mfa.form";
import CommonCard from "@/components/cards/common-card";

export const Route = createFileRoute("/(auth)/mfa/_mfa/verify-code")({
  head: () => ({
    meta: [
      { title: "Verify MFA Code | Cody Lillywhite" },
      { name: "description", content: "Enter your multi-factor authentication code." },
    ],
  }),
  component: MFAVerifyCode,
});

function MFAVerifyCode() {
  return <CommonCard title="Verify Code" description="Enter the code sent to your authenticator app." className="max-w-md mx-auto">
    <MFAForm />
  </CommonCard>;
}
