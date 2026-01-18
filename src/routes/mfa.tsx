import { createFileRoute } from "@tanstack/react-router";
import MFAForm from "@/components/forms/mfa.form";

export const Route = createFileRoute("/mfa")({
    component: MFA
});

function MFA() {
    return (
        <div className="p-2">
            <h2 className="text-2xl font-bold mb-4">Multi-Factor Authentication</h2>
            <MFAForm />
        </div>
    );
}
