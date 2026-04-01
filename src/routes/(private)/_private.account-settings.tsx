import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/(private)/_private/account-settings')({
  beforeLoad: () => {
    throw redirect({ to: '/settings/profile', replace: true });
  },
});
