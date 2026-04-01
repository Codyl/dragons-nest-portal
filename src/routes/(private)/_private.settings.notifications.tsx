import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/(private)/_private/settings/notifications',
)({
  head: () => ({
    meta: [
      { title: 'Notifications | Settings | Cody Lillywhite' },
      {
        name: 'description',
        content: 'Notification preferences.',
      },
    ],
  }),
  component: SettingsNotifications,
});

function SettingsNotifications() {
  return (
    <div className="mx-auto max-w-md">
      <h2 className="mb-2 text-2xl font-bold">Notifications</h2>
      <p className="text-muted-foreground text-sm">
        Choose how you want to be notified. More options coming soon.
      </p>
    </div>
  );
}
