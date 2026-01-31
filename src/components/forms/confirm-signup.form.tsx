import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import InputField from "../fields/input-field";
import { Button } from "../ui/button";
import { useMutation } from "@tanstack/react-query";
import AuthServices from "@/api/services/auth.services";
import ResendSignupConfirmationCodeButton from "../buttons/resend-signup-confirmation-code.button";
import { FieldGroup } from "../ui/field";
import { useRouter } from "@tanstack/react-router";

const ConfirmSignupForm = () => {
  const router = useRouter();

  const {
    mutate: confirmSignup,
    error,
    isPending,
  } = useMutation({
    mutationFn: AuthServices.confirmSignup,
    onSuccess: (data: any) => {
      if (data.data.Session) {
        sessionStorage.setItem("session", data.data.Session);
      }
      if (data.data.AuthenticationResult.AccessToken) {
        localStorage.setItem("AccessToken", data.data.AuthenticationResult.AccessToken);
        localStorage.setItem("RefreshToken", data.data.AuthenticationResult.RefreshToken);
        localStorage.setItem("IdToken", data.data.AuthenticationResult.IdToken);
        router.navigate({ to: "/" });
      }
    },
  });

  const schema = z.object({
    code: z
      .string()
      .min(6, "Confirmation code must be 6 digits")
      .max(6, "Confirmation code must be 6 digits")
      .regex(/^\d+$/, "Confirmation code must contain only numbers"),
  });

  const username = sessionStorage.getItem("username") || "";
  const session = sessionStorage.getItem("session") || "";
  const password = sessionStorage.getItem("password") || "";
  const form = useForm({
    defaultValues: {
      code: "",
    },
    validators: {
      onSubmit: schema,
    },
    onSubmit: async ({ value }) => {
      confirmSignup({
        username,
        code: value.code,
        session,
        password,
      });
    },
  });

  return (
    <>
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
            name="code"
            children={(field) => (
              <InputField
                field={field}
                label="Verification code"
                type="text"
              />
            )}
          />
        </FieldGroup>
        <Button type="submit" className="w-full" disabled={isPending} isPending={isPending}>
          Verify Email
        </Button>
        <div className="text-center">
          <ResendSignupConfirmationCodeButton />
        </div>
      </form>
    </>
  );
};

export default ConfirmSignupForm;
