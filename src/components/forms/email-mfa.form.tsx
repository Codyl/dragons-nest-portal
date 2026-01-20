import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import InputField from "../fields/input-field";
import { Button } from "../ui/button";
import { FieldGroup } from "../ui/field";
import { AuthLayout } from "../auth-layout";

const EmailMFAForm = () => {
    const schema = z.object({
        emailCode: z
            .string()
            .min(6, "Email code must be 6 digits")
            .max(6, "Email code must be 6 digits")
            .regex(/^\d+$/, "Email code must contain only numbers")
    });

    const form = useForm({
        defaultValues: {
            emailCode: ""
        },
        validators: {
            onSubmit: schema
        },
        onSubmit: async ({ value }) => {
            // TODO: Implement Email MFA endpoint
            console.log("Email MFA code:", value.emailCode);
            alert("Email MFA functionality will be available soon");
        }
    });

    return (
        <AuthLayout
            title="Enter email verification code"
            description="We've sent a code to your email address"
        >
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    form.handleSubmit();
                }}
                className="space-y-4"
            >
                <div className="rounded-md bg-muted/50 p-3 text-sm text-muted-foreground">
                    Email MFA is not yet implemented. This feature will be available soon.
                </div>
                <FieldGroup>
                    <form.Field
                        name="emailCode"
                        children={(field) => (
                            <InputField
                                field={field}
                                label="Email verification code"
                                type="text"
                            />
                        )}
                    />
                </FieldGroup>
                <Button type="submit" className="w-full" disabled>
                    Verify (Coming soon)
                </Button>
                <div className="text-center text-sm text-muted-foreground">
                    <p>Didn't receive a code?</p>
                    <Button
                        variant="link"
                        type="button"
                        className="text-sm"
                        disabled
                    >
                        Resend code (Coming soon)
                    </Button>
                </div>
            </form>
        </AuthLayout>
    );
};

export default EmailMFAForm;
