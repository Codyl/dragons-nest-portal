import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import InputField from "../fields/input-field";
import { Button } from "../ui/button";
import { Link } from "@tanstack/react-router";
import { FieldGroup, FieldSeparator } from "../ui/field";
import { AuthLayout } from "../auth-layout";

const ForgotPasswordForm = () => {
    const schema = z.object({
        username: z.string().min(1, "Username or email is required")
    });

    const form = useForm({
        defaultValues: {
            username: ""
        },
        validators: {
            onSubmit: schema
        },
        onSubmit: async ({ value }) => {
            // TODO: Implement forgot password endpoint
            console.log("Forgot password for:", value.username);
            // For now, just show a message
            alert("Password reset functionality will be available soon");
        }
    });

    return (
        <AuthLayout
            title="Reset your password"
            description="Enter your username or email to receive a password reset code"
        >
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    form.handleSubmit();
                }}
                className="space-y-4"
            >
                <FieldGroup>
                    <form.Field
                        name="username"
                        children={(field) => (
                            <InputField
                                field={field}
                                label="Username or email"
                            />
                        )}
                    />
                </FieldGroup>
                <div className="space-y-3">
                    <Button type="submit" className="w-full">
                        Send reset code
                    </Button>
                    <FieldSeparator>Or</FieldSeparator>
                    <div className="space-y-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            disabled
                        >
                            <span className="flex items-center gap-2">
                                <span>Send code via SMS</span>
                                <span className="text-xs text-muted-foreground">
                                    (Coming soon)
                                </span>
                            </span>
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            disabled
                        >
                            <span className="flex items-center gap-2">
                                <span>Send code via Email</span>
                                <span className="text-xs text-muted-foreground">
                                    (Coming soon)
                                </span>
                            </span>
                        </Button>
                    </div>
                </div>
                <div className="text-center text-sm">
                    <Link
                        to="/login"
                        className="text-primary hover:underline"
                    >
                        Back to sign in
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
};

export default ForgotPasswordForm;
