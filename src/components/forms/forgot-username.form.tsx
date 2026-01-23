import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import InputField from "../fields/input-field";
import { Button } from "../ui/button";
import { useRouter, Link } from "@tanstack/react-router";
import { FieldGroup } from "../ui/field";
import { AuthLayout } from "../layouts/auth-layout";

const ForgotUsernameForm = () => {
  const router = useRouter();

  const schema = z.object({
    email: z.string().email("Please enter a valid email address"),
  });

  const form = useForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onSubmit: schema,
    },
    onSubmit: async ({ value }) => {
      // TODO: Implement forgot username endpoint
      console.log("Forgot username for email:", value.email);
      alert("Username recovery functionality will be available soon");
    },
  });

  return (
    <AuthLayout
      title="Find your username"
      description="Enter your email address to receive your username"
    >
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
            name="email"
            children={(field) => (
              <InputField field={field} label="Email address" type="email" />
            )}
          />
        </FieldGroup>
        <Button type="submit" className="w-full">
          Send username
        </Button>
        <div className="text-center text-sm">
          <Link to="/login" className="text-primary hover:underline">
            Back to sign in
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ForgotUsernameForm;
