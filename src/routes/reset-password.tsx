import { createFileRoute, Navigate } from "@tanstack/react-router";
import ResetPasswordForm from "@/components/forms/reset-password.form";
import ConfirmResetCodeForm from "@/components/forms/confirm-reset-code.form";
import { useState } from "react";

export const Route = createFileRoute("/reset-password")({
  component: ResetPassword,
});

function ResetPassword() {
  const [step, setStep] = useState(1);

  if(!sessionStorage.getItem("username")) {
    return <Navigate to="/forgot-password" />;
  }
  
  return (
    <>
      {step === 1 && <ConfirmResetCodeForm setStep={setStep} />}
      {step === 2 && <ResetPasswordForm setStep={setStep} />}
    </>
  );
}
