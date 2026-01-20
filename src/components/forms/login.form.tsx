import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import InputField from "../fields/input-field";
import { Button } from "../ui/button";
import useLoginMutation from "@/hooks/use-login-mutation";
import { useRouter, Link } from "@tanstack/react-router";
import { useResendSignupConfirmationCode } from "@/hooks/use-resend-signup-confirmation-code";
import { FieldGroup, Field } from "../ui/field";
import { AuthLayout } from "../auth-layout";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const LoginForm = ({
    session,
    className,
    ...props
}: {
    session?: string;
    className?: string;
    props?: React.ComponentProps<"div">;
}) => {
    const router = useRouter();
    const { mutate: login, error, isPending } = useLoginMutation();
    const { mutateAsync: resendCode } = useResendSignupConfirmationCode();
    const [step, setStep] = useState<1 | 2>(1);
    const [username, setUsername] = useState("");

    const usernameSchema = z.object({
        username: z.string().min(1, "Email or username is required")
    });

    const passwordSchema = z.object({
        password: z
            .string()
            .min(6, "Password must be at least 6 characters long")
    });

    const usernameForm = useForm({
        defaultValues: {
            username: ""
        },
        validators: {
            onSubmit: usernameSchema
        },
        onSubmit: async ({ value }) => {
            // TODO: Call endpoint to verify email/username exists
            // For now, just move to step 2
            setUsername(value.username);
            setStep(2);
        }
    });

    const passwordForm = useForm({
        defaultValues: {
            password: ""
        },
        validators: {
            onSubmit: passwordSchema
        },
        onSubmit: async ({ value }) => {
            login(
                {
                    username: username,
                    password: value.password,
                    session
                },
                {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onSuccess: (data: any) => {
                        sessionStorage.setItem(
                            "session",
                            data.response.Session
                        );
                        sessionStorage.setItem("username", username);
                        sessionStorage.setItem("password", value.password);
                        
                        if (
                            data.response.ChallengeName === "SOFTWARE_TOKEN_MFA"
                        ) {
                            router.navigate({ to: "/mfa" });
                        }
                        if (data.response.ChallengeName === "SMS_MFA") {
                            router.navigate({ to: "/mfa/sms" });
                        }
                        if (data.response.ChallengeName === "EMAIL_MFA") {
                            router.navigate({ to: "/mfa/email" });
                        }
                        if (
                            data.response.ChallengeName ===
                            "NEW_PASSWORD_REQUIRED"
                        ) {
                            router.navigate({ to: "/reset-password" });
                        }
                        if (data.response.ChallengeName === "MFA_SETUP") {
                            router.navigate({ to: "/mfa/generate" });
                        }
                        // If no challenge, user is authenticated
                        if (!data.response.ChallengeName) {
                            if (data.response.AuthenticationResult?.AccessToken) {
                                localStorage.setItem(
                                    "AccessToken",
                                    data.response.AuthenticationResult.AccessToken
                                );
                                localStorage.setItem(
                                    "RefreshToken",
                                    data.response.AuthenticationResult.RefreshToken || ""
                                );
                                localStorage.setItem(
                                    "IdToken",
                                    data.response.AuthenticationResult.IdToken || ""
                                );
                                router.navigate({ to: "/" });
                            }
                        }
                    },
                    onError: async (error) => {
                        if (error.name === "UserNotConfirmedException") {
                            await resendCode({ username: username });
                            sessionStorage.removeItem("session");
                            sessionStorage.setItem("username", username);
                            router.navigate({ to: "/confirm-signup" });
                        }
                    }
                }
            );
        }
    });

    const handleBack = () => {
        setStep(1);
        passwordForm.reset();
    };

    return (
        <AuthLayout
            title={step === 1 ? "Sign in" : "Enter password"}
            description={
                step === 1
                    ? "Use your account to sign in"
                    : `Enter the password for ${username}`
            }
            className={className}
            {...props}
        >
            {step === 1 ? (
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        usernameForm.handleSubmit();
                    }}
                    className="space-y-4"
                >
                    <FieldGroup>
                        <usernameForm.Field
                            name="username"
                            children={(field) => (
                                <InputField
                                    field={field}
                                    label="Email or username"
                                />
                            )}
                        />
                    </FieldGroup>
                    <Button type="submit" className="w-full">
                        Next
                    </Button>
                    <div className="text-center text-sm text-muted-foreground">
                        Don't have an account?{" "}
                        <Link
                            to="/signup"
                            className="text-primary font-medium hover:underline"
                        >
                            Sign up
                        </Link>
                    </div>
                </form>
            ) : (
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        passwordForm.handleSubmit();
                    }}
                    className="space-y-4"
                >
                    {error && (
                        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                            {error instanceof Error
                                ? error.message
                                : "An error occurred. Please try again."}
                        </div>
                    )}
                    <FieldGroup>
                        <Field>
                            <Label htmlFor="username-display">Email or username</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    id="username-display"
                                    type="text"
                                    value={username}
                                    readOnly
                                    className="bg-muted cursor-not-allowed"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleBack}
                                    className="shrink-0"
                                >
                                    Change
                                </Button>
                            </div>
                        </Field>
                        <passwordForm.Field
                            name="password"
                            children={(field) => (
                                <InputField
                                    field={field}
                                    label="Password"
                                    type="password"
                                />
                            )}
                        />
                    </FieldGroup>
                    <div className="flex items-center justify-between text-sm">
                        <Link
                            to="/forgot-password"
                            className="text-primary hover:underline"
                        >
                            Forgot password?
                        </Link>
                        <Link
                            to="/forgot-username"
                            className="text-muted-foreground hover:text-foreground"
                        >
                            Forgot username?
                        </Link>
                    </div>
                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? "Signing in..." : "Sign in"}
                    </Button>
                </form>
            )}
        </AuthLayout>
    );
};

export default LoginForm;
