import { z } from 'zod';
import { Button } from '../ui/button';
import { useForm } from '@tanstack/react-form';
import InputField from '../fields/input-field';
import useDeleteUser from '@/hooks/use-delete-user';

const DeleteAccountForm = () => {
  const { mutate: deleteAccount, isPending, error } = useDeleteUser();
  const schema = z.object({
    password: z.string().min(1, 'Password is required'),
    mfaCode: z.string().optional(),
  });

  const form = useForm({
    defaultValues: {
      password: '',
      mfaCode: '',
    },
    validators: {
      onSubmit: schema,
    },
    onSubmit: async ({ value }) => {
      deleteAccount({
        password: value.password,
        ...(value.mfaCode?.trim()
          ? { mfaCode: value.mfaCode.trim() }
          : {}),
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
    >
      <div>
        Are you sure you want to delete your account? This action is
        irreversible.
      </div>
      <form.Field
        name="password"
        children={(field) => (
          <InputField
            field={field}
            label="Password"
            type="password"
            autoFocus
          />
        )}
      />
      <form.Field
        name="mfaCode"
        children={(field) => (
          <InputField
            field={field}
            label="Authenticator code"
            type="text"
            placeholder="If you use 2FA, enter your 6-digit code"
            inputMode="numeric"
            autoComplete="one-time-code"
          />
        )}
      />
      {error && (
        <div
          className="text-destructive mt-2"
          data-testid="error-message"
        >
          {error.message}
        </div>
      )}
      <Button
        className="mt-2 w-32"
        type="submit"
        disabled={isPending}
        isPending={isPending}
      >
        Delete Account
      </Button>
    </form>
  );
};

export default DeleteAccountForm;
