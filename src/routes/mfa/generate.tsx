import { createFileRoute } from "@tanstack/react-router";
import MFAGenerateSecretForm from "@/components/forms/mfa-generate-secret.form";

export const Route = createFileRoute("/mfa/generate")({
    component: MFAGenerate
});

function MFAGenerate() {
    return (
        <div className="p-2">
            <h2 className="text-2xl font-bold mb-4">Add Authenticator Apps</h2>

            <MFAGenerateSecretForm />
        </div>
    );
}
