import { createFileRoute } from "@tanstack/react-router";
import ResetPasswordForm from "@/components/forms/reset-password.form";

export const Route = createFileRoute("/reset-password")({
    component: ResetPassword
});

function ResetPassword() {
    return <ResetPasswordForm />;
}
