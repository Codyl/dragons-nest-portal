import { createFileRoute } from "@tanstack/react-router";
import MFAConnectForm from "@/components/forms/mfa-connect.form";

export const Route = createFileRoute("/mfa/connect")({
    component: MFAConnect
});

function MFAConnect() {
    return (
        <div className="p-2">
            <h2 className="text-2xl font-bold mb-4">Connect Authenticator App</h2>
            <MFAConnectForm />
        </div>
    );
}
