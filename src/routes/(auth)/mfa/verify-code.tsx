import { createFileRoute } from "@tanstack/react-router";
import MFAForm from "@/components/forms/mfa.form";

export const Route = createFileRoute("/(auth)/mfa/verify-code")({
  component: MFAVerifyCode,
});

function MFAVerifyCode() {
  return <MFAForm />;
}
