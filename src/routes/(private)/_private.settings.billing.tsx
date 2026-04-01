import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(private)/_private/settings/billing')({
  head: () => ({
    meta: [
      { title: 'Billing | Settings | Cody Lillywhite' },
      {
        name: 'description',
        content: 'Billing and subscription management.',
      },
    ],
  }),
  component: SettingsBilling,
});

function SettingsBilling() {
  return (
    <div className="mx-auto max-w-md">
      <h2 className="mb-2 text-2xl font-bold">Billing</h2>
      <p className="text-muted-foreground text-sm">
        Billing and invoices will appear here when available.
      </p>
    </div>
  );
}
