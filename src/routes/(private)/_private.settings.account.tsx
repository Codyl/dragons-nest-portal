import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(private)/_private/settings/account')({
  head: () => ({
    meta: [
      { title: 'Account | Settings | Cody Lillywhite' },
      {
        name: 'description',
        content: 'Account preferences and workspace defaults.',
      },
    ],
  }),
  component: SettingsAccount,
});

function SettingsAccount() {
  return (
    <div className="mx-auto max-w-md">
      <h2 className="mb-2 text-2xl font-bold">Account</h2>
      <p className="text-muted-foreground text-sm">
        Additional account-level preferences will appear here.
      </p>
    </div>
  );
}
