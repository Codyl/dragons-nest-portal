import { createFileRoute } from "@tanstack/react-router";
import MFAConnectForm from "@/components/forms/mfa-connect.form";

export const Route = createFileRoute("/mfa/connect")({
    component: MFAConnect
});

function MFAConnect() {
    return <MFAConnectForm />;
}
