import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import InputField from "../fields/input-field";
import { Button } from "../ui/button";
import useLoginMutation from "@/hooks/use-login-mutation";
import { useRouter, Link } from "@tanstack/react-router";
import { FieldGroup, Field } from "../ui/field";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { cn } from "@/lib/utils";
import { useResendSignupConfirmationCode } from "@/hooks/use-resend-signup-confirmation-code";
import { useState } from "react";
import MFAAuthenticatorQRCodeModal from "../modals/mfa-authenticator-qrcode.modal";

const LoginForm = ({
  className,
  setStep,
  username,
}: {
  className?: string;
  setStep: (step: 1 | 2 | 3) => void;
  username: string;
}) => {
  const router = useRouter();
  const session = sessionStorage.getItem("session") || "";
  const [showMFAAuthenticatorQRCodeModal, setShowMFAAuthenticatorQRCodeModal] =
    useState(false);
  const passwordSchema = z.object({
    password: z.string().min(6, "Password must be at least 6 characters long"),
  });

  const { mutate: login, error, isPending } = useLoginMutation();
  const { mutateAsync: resendCode } = useResendSignupConfirmationCode();
  const passwordForm = useForm({
    defaultValues: {
      password: "",
    },
    validators: {
      onSubmit: passwordSchema,
    },
    onSubmit: async ({ value }) => {
      login(
        {
          username: username,
          password: value.password,
          session,
        },
        {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onSuccess: (data: any) => {
            console.log(data);
            sessionStorage.setItem("session", data.response.Session);
            sessionStorage.setItem("username", username);
            sessionStorage.setItem("password", value.password);

            if (data.response.ChallengeName === "SOFTWARE_TOKEN_MFA") {
              router.navigate({ to: "/mfa/verify-code" });
            }
            if (data.response.ChallengeName === "SMS_MFA") {
              router.navigate({ to: "/mfa/sms" });
            }
            if (data.response.ChallengeName === "EMAIL_MFA") {
              router.navigate({ to: "/mfa/email" });
            }
            if (data.response.ChallengeName === "NEW_PASSWORD_REQUIRED") {
              router.navigate({ to: "/reset-password" });
            }
            if (data.response.ChallengeName === "MFA_SETUP") {
              setShowMFAAuthenticatorQRCodeModal(true);
            }
            // If no challenge, user is authenticated
            if (!data.response.ChallengeName) {
              if (data.response.AuthenticationResult?.AccessToken) {
                localStorage.setItem(
                  "AccessToken",
                  data.response.AuthenticationResult.AccessToken,
                );
                localStorage.setItem(
                  "RefreshToken",
                  data.response.AuthenticationResult.RefreshToken || "",
                );
                localStorage.setItem(
                  "IdToken",
                  data.response.AuthenticationResult.IdToken || "",
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
          },
        },
      );
    },
  });

  const handleBack = () => {
    setStep(1);
    passwordForm.reset();
  };

  return (
    <>
      <MFAAuthenticatorQRCodeModal
        show={showMFAAuthenticatorQRCodeModal}
        setShow={setShowMFAAuthenticatorQRCodeModal}
      />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          passwordForm.handleSubmit();
        }}
        className={cn("space-y-4", className)}
      >
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
              <InputField field={field} label="Password" type="password" />
            )}
          />
        </FieldGroup>
        <div className="flex items-center justify-between text-sm">
          <Link to="/forgot-password" className="text-primary hover:underline">
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
        {error && <p className="text-red-500">{error.message}</p>}
      </form>
    </>
  );
};

export default LoginForm;
