import { createFileRoute, Navigate } from "@tanstack/react-router";
import ResetPasswordForm from "@/components/forms/reset-password.form";
import ConfirmResetCodeForm from "@/components/forms/confirm-reset-code.form";
import { useState } from "react";
import CommonCard from "@/components/cards/common-card";

export const Route = createFileRoute("/(auth)/_auth/reset-password")({
  component: ResetPassword,
});

function ResetPassword() {
  const [step, setStep] = useState(1);

  if (!sessionStorage.getItem("username")) {
    return <Navigate to="/forgot-password" />;
  }

  return (
    <>
      {step === 1 && <CommonCard title="Confirm Reset Code" description="Enter the code sent to your email"><ConfirmResetCodeForm setStep={setStep} /></CommonCard>}
      {step === 2 && <CommonCard title="Reset Password" description="Enter your new password"><ResetPasswordForm /></CommonCard>}
    </>
  );
}
