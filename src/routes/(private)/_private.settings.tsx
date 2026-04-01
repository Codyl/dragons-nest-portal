import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/(private)/_private/settings')({
  beforeLoad: ({ location }) => {
    const p = location.pathname.replace(/\/$/, '') || '/';
    if (p === '/settings') {
      throw redirect({ to: '/settings/profile', replace: true });
    }
  },
  component: SettingsLayout,
});

function SettingsLayout() {
  return <Outlet />;
}
