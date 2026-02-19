import { createFileRoute } from "@tanstack/react-router";
import MFAForm from "@/components/forms/mfa.form";
import CommonCard from "@/components/cards/common-card";

export const Route = createFileRoute("/(auth)/mfa/")({
  head: () => ({
    meta: [
      { title: "Multi-Factor Authentication | Cody Lillywhite" },
      { name: "description", content: "Verify your identity with multi-factor authentication." },
    ],
  }),
  component: MFA,
});

function MFA() {
  return <CommonCard title="MFA" description="Enter the code sent to your email">
    <MFAForm />
  </CommonCard>;
}
