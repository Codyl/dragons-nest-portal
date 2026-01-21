import { createFileRoute } from "@tanstack/react-router";
import MFAForm from "@/components/forms/mfa.form";

export const Route = createFileRoute("/mfa/verify-code")({
  component: MFAVerifyCode,
});

function MFAVerifyCode() {
  return <MFAForm />;
}
