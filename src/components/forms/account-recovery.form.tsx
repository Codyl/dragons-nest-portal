import { useForm } from '@tanstack/react-form';
import { Link, useRouter } from '@tanstack/react-router';
import { z } from 'zod';
import InputField from '../fields/input-field';
import { Button } from '../ui/button';
import { FieldGroup } from '../ui/field';
import useVerifyAccountRecoveryCode from '@/hooks/use-verify-account-recovery-code';

interface AccountRecoveryFormProps {
  preFilledEmail?: string;
}

const AccountRecoveryForm = ({
  preFilledEmail,
}: AccountRecoveryFormProps = {}) => {
  const router = useRouter();
  const { mutate: verifyRecoveryCode, isPending, error } =
    useVerifyAccountRecoveryCode();
  const schema = z.object({
    username: z.string().min(1, 'Username or email is required'),
    code: z.string().min(1, 'Temporary recovery code is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
  });

  const form = useForm({
    defaultValues: {
      username: preFilledEmail || sessionStorage.getItem('username') || '',
      code: '',
      password: '',
    },
    validators: {
      onSubmit: schema,
    },
    onSubmit: async ({ value }) => {
      verifyRecoveryCode(value, {
        onSuccess: () => {
          sessionStorage.setItem('username', value.username);
          router.navigate({ to: '/' });
        },
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
        <form.Field name="username">
          {(field) => (
            <InputField
              field={field}
              label="Username or email"
              autoFocus
            />
          )}
        </form.Field>
        <form.Field name="code">
          {(field) => (
            <InputField
              field={field}
              label="Temporary recovery code"
            />
          )}
        </form.Field>
        <form.Field name="password">
          {(field) => (
            <InputField
              field={field}
              label="New password"
              type="password"
            />
          )}
        </form.Field>
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
          Recover Account
        </Button>
      </div>
      <div className="text-center text-sm">
        <Link
          to="/login"
          className="text-primary hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    </form>
  );
};

export default AccountRecoveryForm;
