import type { PasskeyListItem } from '@/api/services/profile.services';
import { useDeletePasskey, usePasskeysList } from '@/hooks/use-passkeys';
import useRegisterPasskey from '@/hooks/use-register-passkey';
import { PasskeyProviderIcon } from '@/components/passkeys/passkey-provider-icon';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { cn } from '@/lib/utils';
import { formatDate } from '@/utils/helpers/formatting.helpers';
import { KeyRound, Loader2, Plus, X } from 'lucide-react';
import { useState } from 'react';

const PasskeyMark = ({ className }: { className?: string }) => (
  <KeyRound
    className={cn('shrink-0', className)}
    aria-hidden
    strokeWidth={2}
  />
);

function PasskeySettingsRow({
  passkey,
  onRequestRemove,
  removeDisabled,
}: {
  passkey: PasskeyListItem;
  onRequestRemove: (credentialId: string) => void;
  removeDisabled: boolean;
}) {
  return (
    <li
      className="flex w-full items-center gap-4 border-b py-4 last:border-b-0"
      data-testid="passkey-row"
      data-credential-id={passkey.credentialId}
    >
      <div
        className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted"
        aria-hidden
      >
        <PasskeyProviderIcon
          provider={passkey.provider}
          className="text-foreground"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold leading-tight">{passkey.displayName}</p>
        <p className="text-sm text-muted-foreground">
          Date created: {formatDate(passkey.createdAt)}
        </p>
        <p className="text-sm text-muted-foreground">
          Last used: {passkey.lastUsedAt ? formatDate(passkey.lastUsedAt) : '—'}
        </p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="shrink-0 text-muted-foreground hover:text-destructive"
        disabled={removeDisabled}
        aria-label={`Remove passkey ${passkey.displayName}`}
        data-testid={`passkey-remove-${passkey.credentialId}`}
        onClick={() => onRequestRemove(passkey.credentialId)}
      >
        <X className="size-5" />
      </Button>
    </li>
  );
}

const PasskeySettingsSection = ({ className }: { className?: string }) => {
  const {
    data: passkeys = [],
    isLoading,
    isError,
    refetch,
  } = usePasskeysList();
  const registerPasskey = useRegisterPasskey();
  const deletePasskey = useDeletePasskey();
  const [removeCredentialId, setRemoveCredentialId] = useState<string | null>(
    null,
  );

  const hasPasskeys = passkeys.length > 0;
  const removeOpen = removeCredentialId !== null;

  return (
    <div className={className}>
      <h1 className="text-2xl font-bold">Passkey settings</h1>
      <p className="mt-2 max-w-prose text-muted-foreground">
        Passkeys use your device’s face, fingerprint, PIN, or screen lock. Each
        passkey is stored in your platform or password manager—remove one here
        if you no longer use that device.
      </p>

      <Card className="mt-4 py-0 shadow-sm">
        <CardContent className="px-4 pb-4 pt-2">
          {isLoading && (
            <div
              className="flex items-center gap-2 py-8 text-muted-foreground"
              data-testid="passkeys-loading"
            >
              <Loader2
                className="size-5 animate-spin"
                aria-hidden
              />
              Loading passkeys…
            </div>
          )}
          {isError && (
            <div
              className="py-6 text-center text-sm text-destructive"
              data-testid="passkeys-error"
              role="alert"
            >
              Could not load passkeys.{' '}
              <button
                type="button"
                className="underline font-medium text-primary"
                onClick={() => void refetch()}
              >
                Try again
              </button>
            </div>
          )}
          {!isLoading && !isError && (
            <>
              {hasPasskeys && (
                <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2 border-b pb-2">
                  <h2 className="text-base font-semibold">Your passkeys</h2>
                  <span
                    className="text-sm text-muted-foreground"
                    data-testid="passkey-count"
                  >
                    {passkeys.length} saved
                  </span>
                </div>
              )}
              <ul
                className="flex flex-col"
                aria-label="Passkeys on this account"
              >
                {passkeys.map((pk) => (
                  <PasskeySettingsRow
                    key={pk.credentialId}
                    passkey={pk}
                    onRequestRemove={setRemoveCredentialId}
                    removeDisabled={deletePasskey.isPending}
                  />
                ))}
              </ul>
              {!hasPasskeys && (
                <p
                  className="py-6 text-center text-sm text-muted-foreground"
                  data-testid="passkeys-empty"
                >
                  No passkeys yet. Create one to sign in without a password.
                </p>
              )}
              <div className="mt-4 flex flex-col items-stretch gap-3 border-t pt-4 tablet:flex-row tablet:items-center tablet:justify-between">
                <div className="hidden tablet:block" />
                <div className="flex flex-col gap-2 tablet:items-end">
                  <Button
                    type="button"
                    variant="default"
                    className="w-full gap-2 tablet:w-auto"
                    onClick={() => registerPasskey.mutate()}
                    disabled={registerPasskey.isPending}
                    data-testid="register-passkey-button"
                    aria-label={
                      registerPasskey.isPending
                        ? 'Creating passkey'
                        : 'Create a new passkey'
                    }
                  >
                    <PasskeyMark className="size-5" />
                    {registerPasskey.isPending
                      ? 'Creating passkey…'
                      : 'Create a new passkey'}
                    <Plus
                      className="size-4"
                      aria-hidden
                    />
                  </Button>
                  {registerPasskey.isSuccess && (
                    <p
                      className="text-sm text-green-600 dark:text-green-400"
                      data-testid="passkey-register-success"
                    >
                      Passkey added successfully.
                    </p>
                  )}
                  {registerPasskey.isError && (
                    <p
                      className="text-sm text-destructive"
                      data-testid="passkey-register-error"
                      role="alert"
                    >
                      {registerPasskey.error?.message ??
                        'Could not add passkey. Try again or use another device.'}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={removeOpen}
        onOpenChange={(open) => {
          if (!open) setRemoveCredentialId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this passkey?</AlertDialogTitle>
            <AlertDialogDescription>
              You won’t be able to use it to sign in. You can add a new passkey
              anytime from this page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={deletePasskey.isPending}
              onClick={() => {
                if (!removeCredentialId) return;
                deletePasskey.mutate(removeCredentialId, {
                  onSettled: () => setRemoveCredentialId(null),
                });
              }}
            >
              {deletePasskey.isPending ? 'Removing…' : 'Remove'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PasskeySettingsSection;
