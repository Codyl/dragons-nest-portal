import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import InputField from "../fields/input-field";
import { Button } from "../ui/button";
import { FieldGroup } from "../ui/field";
import useChangePassword from "@/hooks/use-change-password";

const ChangePasswordForm = ({ onPasswordChangeSuccess }: { onPasswordChangeSuccess: () => void }) => {
  const {
    mutate: changePassword,
    isPending,
    error,
  } = useChangePassword();

  const schema = z
    .object({
      currentPassword: z.string().min(1, "Current password is required"),
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
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validators: {
      onSubmit: schema,
    },
    onSubmit: async ({ value }) => {
      changePassword(
        {
          currentPassword: value.currentPassword,
          newPassword: value.newPassword,
        },
        {
          onSuccess: onPasswordChangeSuccess,
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
          name="currentPassword"
          children={(field) => (
            <InputField field={field} label="Current password" type="password" />
          )}
        />
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
      {error && <p className="text-destructive" data-testid="error-message">{error.message}</p>}
      <Button
        type="submit"
        className="w-full"
        disabled={isPending}
        isPending={isPending}
      >
        Change password
      </Button>
    </form>
  );
};

export default ChangePasswordForm;
