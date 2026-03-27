import { createFileRoute, Link, useRouter } from '@tanstack/react-router';
import { useEffect } from 'react';
import CommonCard from '@/components/cards/common-card';
import useConsumeRecoveryMagicLink from '@/hooks/use-consume-recovery-magic-link';

export const Route = createFileRoute('/(auth)/_auth/account-recovery/magic-link')(
  {
    component: AccountRecoveryMagicLink,
  },
);

function AccountRecoveryMagicLink() {
  const router = useRouter();
  const searchParams = new URLSearchParams(
    typeof window !== 'undefined' ? window.location.search : '',
  );
  const token = searchParams.get('token') ?? '';
  const consumeMutation = useConsumeRecoveryMagicLink();

  useEffect(() => {
    if (!token) return;
    consumeMutation.mutate(
      { token },
      {
        onSuccess: () => {
          router.navigate({ to: '/' });
        },
      },
    );
    // Run once for this token while route is mounted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (!token) {
    return (
      <CommonCard
        title="Invalid recovery link"
        description="This recovery link is missing a required token."
      >
        <div className="text-center text-sm">
          <Link
            to="/account-recovery"
            className="text-primary hover:underline"
          >
            Back to account recovery
          </Link>
        </div>
      </CommonCard>
    );
  }

  return (
    <CommonCard
      title="Signing you in"
      description="Validating your one-time recovery magic link."
    >
      <div className="space-y-3 text-sm">
        {consumeMutation.isPending && (
          <p className="text-muted-foreground">Please wait...</p>
        )}
        {consumeMutation.isError && (
          <p
            className="text-destructive"
            data-testid="recovery-link-error"
          >
            {consumeMutation.error.message}
          </p>
        )}
        {consumeMutation.isError && (
          <div className="space-y-1">
            <Link
              to="/account-recovery"
              className="text-primary hover:underline block"
            >
              Request another recovery link
            </Link>
            <Link
              to="/signup"
              className="text-primary hover:underline block"
            >
              Create a new account
            </Link>
          </div>
        )}
      </div>
    </CommonCard>
  );
}
