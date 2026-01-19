import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import InputField from "../fields/input-field";
import { Button } from "../ui/button";
import { useMutation } from "@tanstack/react-query";
import AuthServices from "@/api/services/auth.services";
import ResendSignupConfirmationCodeButton from "../buttons/resend-signup-confirmation-code.button";

const ConfirmSignupForm = () => {
    const {
        mutate: confirmSignup,
        data,
        error,
        isPending
    } = useMutation({
        mutationFn: AuthServices.confirmSignup
    });

    const schema = z.object({
        code: z.string().min(1, "Confirmation code is required")
    });

    const form = useForm({
        defaultValues: {
            code: ""
        },
        validators: {
            onSubmit: schema
        },
        onSubmit: async ({ value }) => {
            confirmSignup({
                username: sessionStorage.getItem("username") || "",
                code: value.code,
                session: sessionStorage.getItem("session")
            });
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
                    name="code"
                    children={(field) => (
                        <InputField field={field} label="Confirmation Code" />
                    )}
                />
                <ResendSignupConfirmationCodeButton />
                <Button type="submit" disabled={isPending}>
                    {isPending ? "Confirming..." : "Confirm Signup"}
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

export default ConfirmSignupForm;
