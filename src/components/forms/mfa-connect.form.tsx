import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import InputField from "../fields/input-field";
import { Button } from "../ui/button";
import { useMutation } from "@tanstack/react-query";
import AuthServices from "@/api/services/auth.services";

const MFAConnectForm = () => {
    const { mutate: connectAuthenticator, data, error, isPending } = useMutation({
        mutationFn: AuthServices.connectAuthenticatorApp
    });

    const schema = z.object({
        accessToken: z.string().min(1, "Access token is required"),
        friendlyDeviceName: z.string().min(1, "Device name is required"),
        session: z.string().min(1, "Session is required"),
        userCode: z.string().min(1, "User code is required")
    });

    const form = useForm({
        defaultValues: {
            accessToken: "",
            friendlyDeviceName: "",
            session: "",
            userCode: ""
        },
        validators: {
            onSubmit: schema
        },
        onSubmit: async ({ value }) => {
            connectAuthenticator(value);
        }
    });

    return (
        <div className="flex flex-col gap-4">
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    form.handleSubmit();
                }}
                className="flex flex-col tablet:w-md gap-4 mx-auto desktop:mx-0">
                <form.Field
                    name="accessToken"
                    children={(field) => (
                        <InputField field={field} label="Access Token" type="password" />
                    )}
                />
                <form.Field
                    name="friendlyDeviceName"
                    children={(field) => (
                        <InputField field={field} label="Device Name" />
                    )}
                />
                <form.Field
                    name="session"
                    children={(field) => (
                        <InputField field={field} label="Session" />
                    )}
                />
                <form.Field
                    name="userCode"
                    children={(field) => (
                        <InputField field={field} label="User Code" />
                    )}
                />
                <Button type="submit" disabled={isPending}>
                    {isPending ? "Connecting..." : "Connect Authenticator"}
                </Button>
            </form>
            {data && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-md">
                    <pre className="text-xs overflow-auto">
                        {JSON.stringify(data, null, 2)}
                    </pre>
                </div>
            )}
            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-md">
                    <p className="text-red-600 dark:text-red-400">
                        Error: {error instanceof Error ? error.message : "Unknown error"}
                    </p>
                </div>
            )}
        </div>
    );
};

export default MFAConnectForm;
