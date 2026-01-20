import { createFileRoute } from "@tanstack/react-router";
import ConfirmSignupForm from "@/components/forms/confirm-signup.form";

export const Route = createFileRoute("/confirm-signup")({
    component: ConfirmSignup
});

function ConfirmSignup() {
    return <ConfirmSignupForm />;
}
