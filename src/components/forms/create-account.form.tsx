import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import InputField from "../fields/input-field";
import { Button } from "../ui/button";
import { useMutation } from "@tanstack/react-query";
import AuthServices from "@/api/services/auth.services";

const CreateAccountForm = () => {
    const { mutate: signup, data, error, isPending } = useMutation({
        mutationFn: AuthServices.initiateSignup
    });

    const schema = z.object({
        username: z.string().min(1, "Username is required"),
        password: z
            .string()
            .min(8, "Password must be at least 8 characters long"),
        email: z.string().email("Invalid email address"),
        given_name: z.string().min(1, "First name is required"),
        family_name: z.string().min(1, "Last name is required"),
        middle_name: z.string().optional(),
        address: z.string().optional(),
        timezone: z.string().optional()
    });

    const form = useForm({
        defaultValues: {
            username: "",
            password: "",
            email: "",
            given_name: "",
            family_name: "",
            middle_name: "",
            address: "",
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        validators: {
            onSubmit: schema
        },
        onSubmit: async ({ value }) => {
            signup(value);
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
                    name="username"
                    children={(field) => (
                        <InputField field={field} label="Username" />
                    )}
                />
                <form.Field
                    name="email"
                    children={(field) => <InputField field={field} label="Email" />}
                />
                <form.Field
                    name="password"
                    children={(field) => (
                        <InputField field={field} label="Password" type="password" />
                    )}
                />
                <form.Field
                    name="given_name"
                    children={(field) => (
                        <InputField field={field} label="First Name" />
                    )}
                />
                <form.Field
                    name="family_name"
                    children={(field) => (
                        <InputField field={field} label="Last Name" />
                    )}
                />
                <form.Field
                    name="middle_name"
                    children={(field) => (
                        <InputField field={field} label="Middle Name (Optional)" />
                    )}
                />
                <form.Field
                    name="address"
                    children={(field) => (
                        <InputField field={field} label="Address (Optional)" />
                    )}
                />
                <form.Field
                    name="timezone"
                    children={(field) => (
                        <InputField field={field} label="Timezone" />
                    )}
                />
                <Button type="submit" disabled={isPending}>
                    {isPending ? "Signing up..." : "Sign Up"}
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

export default CreateAccountForm;
