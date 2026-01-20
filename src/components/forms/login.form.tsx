import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import InputField from "../fields/input-field";
import { Button } from "../ui/button";
import useLoginMutation from "@/hooks/use-login-mutation";
import { useRouter, Link } from "@tanstack/react-router";
import { useResendSignupConfirmationCode } from "@/hooks/use-resend-signup-confirmation-code";
import { FieldGroup } from "../ui/field";
import { AuthLayout } from "../auth-layout";

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

    const schema = z.object({
        username: z.string().min(1, "Username is required"),
        password: z
            .string()
            .min(6, "Password must be at least 6 characters long")
    });

    const form = useForm({
        defaultValues: {
            username: "",
            password: ""
        },
        validators: {
            onSubmit: schema
        },
        onSubmit: async ({ value }) => {
            login(
                {
                    username: value.username,
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
                        sessionStorage.setItem("username", value.username);
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
                            await resendCode({ username: value.username });
                            sessionStorage.removeItem("session");
                            sessionStorage.setItem("username", value.username);
                            router.navigate({ to: "/confirm-signup" });
                        }
                    }
                }
            );
        }
    });

    return (
        <AuthLayout
            title="Sign in"
            description="Use your account to sign in"
            className={className}
            {...props}
        >
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    form.handleSubmit();
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
                    <form.Field
                        name="username"
                        children={(field) => (
                            <InputField
                                field={field}
                                label="Email or username"
                            />
                        )}
                    />
                    <form.Field
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
        </AuthLayout>
    );
};

export default LoginForm;
