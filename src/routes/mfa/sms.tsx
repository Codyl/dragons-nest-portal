import { createFileRoute } from "@tanstack/react-router";
import SMSMFAForm from "@/components/forms/sms-mfa.form";

export const Route = createFileRoute("/mfa/sms")({
    component: SMSMFA
});

function SMSMFA() {
    return <SMSMFAForm />;
}
