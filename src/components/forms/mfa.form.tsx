import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import InputField from "../fields/input-field";
import { Button } from "../ui/button";
import { useRouter } from "@tanstack/react-router";
import { FieldGroup } from "../ui/field";
import { AuthLayout } from "../layouts/auth-layout";
import useCompleteMFAAuth from "@/hooks/use-complete-mfa-auth";

const MFAForm = () => {
  const router = useRouter();
  const { mutate: completeMFA, error, isPending } = useCompleteMFAAuth();

  const schema = z.object({
    softwareTokenMfaCode: z
      .string()
      .min(6, "MFA code must be 6 digits")
      .max(6, "MFA code must be 6 digits")
      .regex(/^\d+$/, "MFA code must contain only numbers"),
  });

  const form = useForm({
    defaultValues: {
      softwareTokenMfaCode: "",
    },
    validators: {
      onSubmit: schema,
    },
    onSubmit: async ({ value }) => {
      completeMFA(
        {
          username: sessionStorage.getItem("username") || "",
          password: sessionStorage.getItem("password") || "",
          softwareTokenMfaCode: value.softwareTokenMfaCode,
          session: sessionStorage.getItem("session") || "",
          challengeName: "SOFTWARE_TOKEN_MFA",
        },
        {
          onSuccess: (data) => {
            if (data.data.AuthenticationResult?.AccessToken) {
              localStorage.setItem(
                "AccessToken",
                data.data.AuthenticationResult.AccessToken,
              );
              localStorage.setItem(
                "RefreshToken",
                data.data.AuthenticationResult.RefreshToken || "",
              );
              localStorage.setItem(
                "IdToken",
                data.data.AuthenticationResult.IdToken || "",
              );
              sessionStorage.clear();
              router.navigate({ to: "/" });
            }
          },
        },
      );
    },
  });

  return (
    <AuthLayout
      title="Enter verification code"
      description="Enter the code from your authenticator app"
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
              : "Invalid code. Please try again."}
          </div>
        )}
        <FieldGroup>
          <form.Field
            name="softwareTokenMfaCode"
            children={(field) => (
              <InputField field={field} label="Verification code" type="text" />
            )}
          />
        </FieldGroup>
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Verifying..." : "Verify"}
        </Button>
        <div className="text-center text-sm text-muted-foreground">
          <p>Don't have access to your authenticator app?</p>
          <Button variant="link" type="button" className="text-sm" disabled>
            Use a different verification method
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default MFAForm;
