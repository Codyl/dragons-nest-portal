import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import InputField from "../fields/input-field";
import { Button } from "../ui/button";
import { Link, useRouter } from "@tanstack/react-router";
import { FieldGroup, FieldSeparator } from "../ui/field";
import useForgotPassword from "@/hooks/use-forgot-password";

const ForgotPasswordForm = () => {
  const router = useRouter();
  const { mutate: forgotPassword, isPending, error } = useForgotPassword();
  const schema = z.object({
    username: z.string().min(1, "Username or email is required"),
  });

  const form = useForm({
    defaultValues: {
      username: sessionStorage.getItem("username") || "",
    },
    validators: {
      onSubmit: schema,
    },
    onSubmit: async ({ value }) => {
      forgotPassword(
        { username: value.username },
        {
          onSuccess: () => {
            sessionStorage.setItem("username", value.username);
            router.navigate({ to: "/reset-password" });
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
          name="username"
          children={(field) => (
            <InputField field={field} label="Username or email" />
          )}
        />
      </FieldGroup>
      <div className="space-y-3">
        {error && <p className="text-red-500">{error.message}</p>}
        <Button
          type="submit"
          className="w-full"
          disabled={isPending}
          isPending={isPending}
        >
          Send reset code
        </Button>
        <FieldSeparator>Or</FieldSeparator>
        <div className="space-y-2">
          <Button type="button" variant="outline" className="w-full" disabled>
            <span className="flex items-center gap-2">
              <span>Send code via SMS</span>
              <span className="text-xs text-muted-foreground">
                (Coming soon)
              </span>
            </span>
          </Button>
          <Button type="button" variant="outline" className="w-full" disabled>
            <span className="flex items-center gap-2">
              <span>Send code via Email</span>
              <span className="text-xs text-muted-foreground">
                (Coming soon)
              </span>
            </span>
          </Button>
        </div>
      </div>
      <div className="text-center text-sm">
        <Link to="/verify-username" className="text-primary hover:underline">
          Back to sign in
        </Link>
      </div>
    </form>
  );
};

export default ForgotPasswordForm;
