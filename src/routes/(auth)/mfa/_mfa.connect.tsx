import { createFileRoute } from "@tanstack/react-router";
import MFAConnectForm from "@/components/forms/mfa-connect.form";
import CommonCard from "@/components/cards/common-card";

export const Route = createFileRoute("/(auth)/mfa/_mfa/connect")({
  head: () => ({
    meta: [
      { title: "Connect MFA | Cody Lillywhite" },
      { name: "description", content: "Connect your multi-factor authentication device." },
    ],
  }),
  component: MFAConnect,
});

function MFAConnect() {
  return <CommonCard title="MFA Connect" description="Connect your MFA device">
    <MFAConnectForm />
  </CommonCard>;
}
