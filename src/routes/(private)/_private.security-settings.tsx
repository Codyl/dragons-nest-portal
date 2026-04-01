import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/(private)/_private/security-settings')({
  beforeLoad: () => {
    throw redirect({ to: '/settings/security', replace: true });
  },
});
