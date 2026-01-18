import { createFileRoute } from "@tanstack/react-router";
import ConfirmSignupForm from "@/components/forms/confirm-signup.form";

export const Route = createFileRoute("/confirm-signup")({
    component: ConfirmSignup
});

function ConfirmSignup() {
    return (
        <div className="p-2">
            <h2 className="text-2xl font-bold mb-4">Confirm Signup</h2>
            <ConfirmSignupForm />
        </div>
    );
}
