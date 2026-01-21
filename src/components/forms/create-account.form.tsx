import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import InputField from "../fields/input-field";
import { Button } from "../ui/button";
import { useMutation } from "@tanstack/react-query";
import AuthServices from "@/api/services/auth.services";
import { useRouter, Link } from "@tanstack/react-router";
import { FieldGroup } from "../ui/field";
import { AuthLayout } from "../auth-layout";

const CreateAccountForm = ({
  className,
  ...props
}: {
  className?: string;
  props?: React.ComponentProps<"div">;
}) => {
  const router = useRouter();
  const {
    mutate: signup,
    error,
    isPending,
  } = useMutation({
    mutationFn: AuthServices.initiateSignup,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSuccess: (data: any, variables: any) => {
      console.log(data);
      sessionStorage.setItem("session", data.response.Session);
      sessionStorage.setItem("username", variables.email);
      sessionStorage.setItem("password", variables.password);
      router.navigate({ to: "/confirm-signup" });
    },
  });

  const schema = z
    .object({
      email: z.email("Please enter a valid email address"),
      password: z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
      confirmPassword: z.string().min(1, "Please confirm your password"),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });

  const form = useForm({
    defaultValues: {
      email: "codylillyw+2@gmail.com",
      password: "Password123!",
      confirmPassword: "Password123!",
    },
    validators: {
      onSubmit: schema,
    },
    onSubmit: async ({ value }) => {
      signup({
        email: value.email,
        password: value.password,
      });
    },
  });

  return (
    <AuthLayout
      title="Create your account"
      description="Enter your information to get started"
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
            name="email"
            children={(field) => (
              <InputField field={field} label="Email" type="email" />
            )}
          />
          <form.Field
            name="password"
            children={(field) => (
              <InputField field={field} label="Password" type="password" />
            )}
          />
          <form.Field
            name="confirmPassword"
            children={(field) => (
              <InputField
                field={field}
                label="Confirm Password"
                type="password"
              />
            )}
          />
        </FieldGroup>
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Creating account..." : "Create account"}
        </Button>
        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-primary font-medium hover:underline"
          >
            Sign in
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default CreateAccountForm;
