import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import InputField from "../fields/input-field";
import { Button } from "../ui/button";
import { useRouter, Link } from "@tanstack/react-router";
import { FieldGroup } from "../ui/field";
import { AuthLayout } from "../auth-layout";

const ResetPasswordForm = () => {
    const router = useRouter();

    const schema = z.object({
        newPassword: z
            .string()
            .min(8, "Password must be at least 8 characters long")
            .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
            .regex(/[a-z]/, "Password must contain at least one lowercase letter")
            .regex(/[0-9]/, "Password must contain at least one number"),
        confirmPassword: z
            .string()
            .min(1, "Please confirm your password")
            .refine((data, ctx) => data === ctx.parent.newPassword, {
                message: "Passwords do not match",
                path: ["confirmPassword"]
            })
    });

    const form = useForm({
        defaultValues: {
            newPassword: "",
            confirmPassword: ""
        },
        validators: {
            onSubmit: schema
        },
        onSubmit: async ({ value }) => {
            // TODO: Implement reset password endpoint
            console.log("Reset password:", value.newPassword);
            // For now, redirect to login
            router.navigate({ to: "/login" });
        }
    });

    return (
        <AuthLayout
            title="Create new password"
            description="Enter your new password below"
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
                        name="newPassword"
                        children={(field) => (
                            <InputField
                                field={field}
                                label="New password"
                                type="password"
                            />
                        )}
                    />
                    <form.Field
                        name="confirmPassword"
                        children={(field) => (
                            <InputField
                                field={field}
                                label="Confirm new password"
                                type="password"
                            />
                        )}
                    />
                </FieldGroup>
                <Button type="submit" className="w-full">
                    Reset password
                </Button>
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

export default ResetPasswordForm;
