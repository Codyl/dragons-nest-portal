import { createFileRoute } from "@tanstack/react-router";
import CreateAccountForm from "@/components/forms/create-account.form";

export const Route = createFileRoute("/signup")({
    component: Signup
});

function Signup() {
    return (
        <div className="p-2">
            <h2 className="text-2xl font-bold mb-4">Create Account</h2>
            <CreateAccountForm />
        </div>
    );
}
