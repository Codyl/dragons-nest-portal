import { createFileRoute } from "@tanstack/react-router";
import MFAGenerateSecretForm from "@/components/forms/mfa-generate-secret.form";

export const Route = createFileRoute("/mfa/generate")({
    component: MFAGenerate
});

function MFAGenerate() {
    return <MFAGenerateSecretForm />;
}
