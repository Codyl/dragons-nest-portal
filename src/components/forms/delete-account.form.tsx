import { z } from 'zod';
import { Button } from '../ui/button';
import { useForm } from '@tanstack/react-form';
import InputField from '../fields/input-field';
import useDeleteUser from '@/hooks/use-delete-user';
import useLoggedInUser from '@/hooks/use-logged-in-user';
import { GoogleLogin } from '@react-oauth/google';
import { useMemo } from 'react';

const DeleteAccountForm = () => {
  const userQuery = useLoggedInUser();
  const user = userQuery.data?.data;
  const { mutate: deleteAccount, isPending, error } = useDeleteUser();

  const hasPassword = user?.hasPassword ?? true;
  const hasGoogle = user?.loginMethods?.includes('GOOGLE') ?? false;
  const isGoogleOnlyDeletion = !hasPassword && hasGoogle;
  const requiresTotp = hasPassword && user?.softwareTokenMfaEnabled === true;

  const schema = useMemo(() => {
    return z
      .object({
        password: z.string().min(8, 'Password must be at least 8 characters'),
        mfaCode: z.string(),
      })
      .superRefine((val, ctx) => {
        if (!requiresTotp) {
          return;
        }
        const code = val.mfaCode?.trim() ?? '';
        if (code.length < 6) {
          ctx.addIssue({
            code: 'custom',
            message: 'Enter the 6-digit code from your authenticator app',
            path: ['mfaCode'],
          });
          return;
        }
        if (!/^\d+$/.test(code)) {
          ctx.addIssue({
            code: 'custom',
            message: 'Code must contain only numbers',
            path: ['mfaCode'],
          });
        }
      });
  }, [requiresTotp]);

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
        ...(requiresTotp && value.mfaCode?.trim()
          ? { mfaCode: value.mfaCode.trim() }
          : {}),
      });
    },
  });

  if (userQuery.isLoading) {
    return (
      <div className="flex flex-col mx-auto max-w-md">
        <div className="animate-pulse bg-muted rounded-md h-10 w-full" />
      </div>
    );
  }

  if (userQuery.isError) {
    return (
      <div
        className="text-destructive text-sm"
        data-testid="delete-account-user-error"
      >
        Could not load your account. Try again or contact support.
      </div>
    );
  }

  if (!hasPassword && !hasGoogle) {
    return (
      <div
        className="text-destructive text-sm"
        data-testid="delete-account-unsupported"
      >
        Account deletion is not available for this sign-in setup. Please contact
        support.
      </div>
    );
  }

  if (isGoogleOnlyDeletion) {
    return (
      <div className="flex flex-col gap-4">
        <p>
          Are you sure you want to delete your account? This action is
          irreversible. Sign in with Google to confirm.
        </p>
        {error && (
          <div className="text-destructive" data-testid="error-message">
            {error.message}
          </div>
        )}
        {!window.Cypress && (
          <div className="flex justify-start">
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                if (credentialResponse.credential) {
                  deleteAccount({
                    googleCredential: credentialResponse.credential,
                  });
                }
              }}
              onError={() => {}}
            />
          </div>
        )}
        {window.Cypress && (
          <Button
            type="button"
            variant="destructive"
            disabled={isPending}
            isPending={isPending}
            data-testid="delete-account-google-confirm"
            onClick={() => deleteAccount({ googleCredential: 'x'.repeat(40) })}
          >
            Confirm delete with Google
          </Button>
        )}
      </div>
    );
  }

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
        {requiresTotp ? (
          <span className="block mt-2 text-muted-foreground text-sm">
            Enter your password and the code from your authenticator app.
          </span>
        ) : null}
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
      {requiresTotp ? (
        <form.Field
          name="mfaCode"
          children={(field) => (
            <InputField
              className="mt-2"
              field={field}
              label="Authenticator code"
              type="text"
              placeholder="6-digit code"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
            />
          )}
        />
      ) : null}
      {error && (
        <div className="text-destructive mt-2" data-testid="error-message">
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
