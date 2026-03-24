import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import SixDigitCodeField from "../fields/six-digit-code-field";
import { Button } from "../ui/button";
import { useRouter } from "@tanstack/react-router";
import { FieldGroup } from "../ui/field";
import useCompleteMFAAuth, { type CompleteMFAMutationData } from "@/hooks/use-complete-mfa-auth";

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
          onSuccess: (data: CompleteMFAMutationData) => {
            if (data.data.AuthenticationResult) {
              sessionStorage.clear();
              const authResult = data.data.AuthenticationResult;
              if (authResult.NewDeviceMetadata) {
                localStorage.setItem(
                  "DeviceKey",
                  authResult.NewDeviceMetadata.DeviceKey || "",
                );
              }
              router.navigate({ to: "/" });
            }
          },
        },
      );
    },
  });

  return (
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
          name="softwareTokenMfaCode"
          children={(field) => (
            <SixDigitCodeField field={field} label="Verification code" autoFocus />
          )}
        />
      </FieldGroup>
      {error && <p className="text-destructive mt-2" data-testid="error-message">{error.message}</p>}
      <Button type="submit" className="w-full" disabled={isPending} isPending={isPending}>
        Verify Code
      </Button>
    </form>
  );
};

export default MFAForm;
