import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import InputField from "../fields/input-field";
import { Button } from "../ui/button";
import { useMutation } from "@tanstack/react-query";
import AuthServices from "@/api/services/auth.services";

const MFAForm = () => {
    const {
        mutate: completeMFA,
        data,
        error,
        isPending
    } = useMutation({
        mutationFn: AuthServices.completeMFAAuth
    });

    const schema = z.object({
        softwareTokenMfaCode: z.string().min(1, "MFA code is required")
    });

    const form = useForm({
        defaultValues: {
            softwareTokenMfaCode: ""
        },
        validators: {
            onSubmit: schema
        },
        onSubmit: async ({ value }) => {
            completeMFA(
                {
                    username: sessionStorage.getItem("username") || "",
                    password: sessionStorage.getItem("password") || "",
                    softwareTokenMfaCode: value.softwareTokenMfaCode,
                    session: sessionStorage.getItem("session") || "",
                    challengeName: "SOFTWARE_TOKEN_MFA"
                },
                {
                    onSuccess: (data) => {
                        console.log(
                            data.response.AuthenticationResult?.AccessToken
                        );
                        localStorage.setItem(
                            "AccessToken",
                            data.response.AuthenticationResult?.AccessToken
                        );
                        localStorage.setItem(
                            "RefreshToken",
                            data.response.AuthenticationResult?.RefreshToken
                        );
                        localStorage.setItem(
                            "IdToken",
                            data.response.AuthenticationResult?.IdToken
                        );
                    }
                }
            );
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
                    name="softwareTokenMfaCode"
                    children={(field) => (
                        <InputField field={field} label="MFA Code" />
                    )}
                />

                <Button type="submit" disabled={isPending}>
                    {isPending ? "Verifying..." : "Verify MFA"}
                </Button>
            </form>
            {data !== undefined && data !== null && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-md">
                    <pre className="text-xs overflow-auto">
                        {JSON.stringify(data, null, 2)}
                    </pre>
                </div>
            )}
            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-md">
                    <p className="text-red-600 dark:text-red-400">
                        Error:{" "}
                        {error instanceof Error
                            ? error.message
                            : "Unknown error"}
                    </p>
                </div>
            )}
        </div>
    );
};

export default MFAForm;
