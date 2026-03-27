import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import InputField from '../fields/input-field';
import { Button } from '../ui/button';
import { Link, useRouter } from '@tanstack/react-router';
import { FieldGroup, FieldSeparator } from '../ui/field';
import useForgotPassword from '@/hooks/use-forgot-password';

interface ForgotPasswordFormProps {
  preFilledEmail?: string;
}

const ForgotPasswordForm = ({
  preFilledEmail,
}: ForgotPasswordFormProps = {}) => {
  const router = useRouter();
  const { mutate: forgotPassword, isPending, error } = useForgotPassword();
  const schema = z.object({
    username: z.string().min(1, 'Username or email is required'),
  });

  const form = useForm({
    defaultValues: {
      username: preFilledEmail || sessionStorage.getItem('username') || '',
    },
    validators: {
      onSubmit: schema,
    },
    onSubmit: async ({ value }) => {
      forgotPassword(
        { username: value.username },
        {
          onSuccess: () => {
            sessionStorage.setItem('username', value.username);
            // Navigate to private reset-password route if user is logged in, otherwise auth route
            router.navigate({
              to: preFilledEmail ? '/reset-password' : '/reset-password',
            });
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
            <InputField
              field={field}
              label="Username or email"
              autoFocus
            />
          )}
        />
      </FieldGroup>
      <div className="space-y-3">
        {error && (
          <p
            className="text-destructive mt-2"
            data-testid="error-message"
          >
            {error.message}
          </p>
        )}
        <Button
          type="submit"
          className="w-full"
          disabled={isPending}
          isPending={isPending}
        >
          Send Reset Code
        </Button>
      </div>
      <div className="text-center text-sm">
        {preFilledEmail ? (
          <Link
            to="/security-settings"
            className="text-primary hover:underline"
          >
            Back to security settings
          </Link>
        ) : (
          <Link
            to="/login"
            className="text-primary hover:underline"
          >
            Back to sign in
          </Link>
        )}
      </div>
    </form>
  );
};

export default ForgotPasswordForm;
