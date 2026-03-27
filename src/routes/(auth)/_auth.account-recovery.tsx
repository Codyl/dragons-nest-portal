import { createFileRoute } from '@tanstack/react-router';
import AccountRecoveryForm from '@/components/forms/account-recovery.form';
import CommonCard from '@/components/cards/common-card';

export const Route = createFileRoute('/(auth)/_auth/account-recovery')({
  head: () => ({
    meta: [
      { title: 'Account Recovery | Cody Lillywhite' },
      {
        name: 'description',
        content:
          'Enter your temporary recovery code to restore account access.',
      },
    ],
  }),
  component: AccountRecovery,
});

function AccountRecovery() {
  return (
    <CommonCard
      title="Account Recovery"
      description="Enter the temporary code sent after support verification to recover your account."
    >
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">
          If you cannot sign in because of lost TOTP, email access, or any other
          reason, contact support first. A temporary code is only sent after
          confirming your recent account activity over the phone.
        </div>
        <div className="text-sm">
          <p>
            Support email:{' '}
            <a
              href="mailto:support@codylillywhite.com"
              className="text-primary hover:underline"
            >
              support@codylillywhite.com
            </a>
          </p>
          <p>
            Support phone:{' '}
            <a
              href="tel:+18664857839"
              className="text-primary hover:underline"
            >
              +18664857839
            </a>
          </p>
        </div>
        <AccountRecoveryForm />
      </div>
    </CommonCard>
  );
}
