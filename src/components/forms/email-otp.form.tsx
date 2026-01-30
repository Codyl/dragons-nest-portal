import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import InputField from "../fields/input-field";
import { Button } from "../ui/button";
import { FieldGroup } from "../ui/field";
import useAnswerOTP from "@/hooks/use-answer-otp";
import { useRouter } from "@tanstack/react-router";

const EmailOTPForm = () => {
  const router = useRouter();

  const { mutate: answerOTP, isPending, error } = useAnswerOTP();

  const schema = z.object({
    emailCode: z
      .string()
      .length(8, "Email code must be 8 digits")
      .regex(/^\d+$/, "Email code must contain only numbers"),
  });

  const form = useForm({
    defaultValues: {
      emailCode: "",
    },
    validators: {
      onSubmit: schema,
    },
    onSubmit: async ({ value }) => {
      answerOTP({
        otpType: "EMAIL_OTP",
        answer: value.emailCode,
        username: sessionStorage.getItem("username") || "",
        emailCode: value.emailCode,
        session: sessionStorage.getItem("session") || "",
      }, {
        onSuccess: (data) => {
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
          router.navigate({ to: "/" });
        }
      });
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
          name="emailCode"
          children={(field) => (
            <InputField
              field={field}
              label="Email verification code"
              type="text"
              maxLength={8}
            />
          )}
        />
      </FieldGroup>
      {error && <p className="text-destructive mt-2" data-testid="error-message">{error.message}</p>}
      <Button type="submit" className="w-full" disabled={isPending} isPending={isPending}>
        Verify
      </Button>
    </form>
  );
};

export default EmailOTPForm;
