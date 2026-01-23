import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import InputField from "../fields/input-field";
import { Button } from "../ui/button";
import { Link, useRouter } from "@tanstack/react-router";
import { FieldGroup } from "../ui/field";
import useConfirmForgotPassword from "@/hooks/use-confirm-forgot-password";

const ResetPasswordForm = () => {
  const router = useRouter();
  const {
    mutate: resetPassword,
    isPending,
    error,
  } = useConfirmForgotPassword();

  const schema = z
    .object({
      newPassword: z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
      confirmPassword: z.string().min(1, "Please confirm your password"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });

  const form = useForm({
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
    validators: {
      onSubmit: schema,
    },
    onSubmit: async ({ value }) => {
      resetPassword(
        {
          username: sessionStorage.getItem("username") || "",
          code: sessionStorage.getItem("code") || "",
          password: value.newPassword,
        },
        {
          onSuccess: (data) => {
            sessionStorage.clear();
            if (data.data.AuthenticationResult) {
              localStorage.setItem("AccessToken", data.data.AuthenticationResult.AccessToken);
              localStorage.setItem("RefreshToken", data.data.AuthenticationResult.RefreshToken || "");
              localStorage.setItem("IdToken", data.data.AuthenticationResult.IdToken || "");
            }
            router.navigate({ to: "/users" });
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
          name="newPassword"
          children={(field) => (
            <InputField field={field} label="New password" type="password" />
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
      {error && <p className="text-red-500">{error.message}</p>}
      <Button
        type="submit"
        className="w-full"
        disabled={isPending}
        isPending={isPending}
      >
        Reset password
      </Button>
      <div className="text-center text-sm">
        <Link to="/verify-username" className="text-primary hover:underline">
          Back to sign in
        </Link>
      </div>
    </form>
  );
};

export default ResetPasswordForm;
