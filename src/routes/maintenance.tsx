import { runHealthCheck } from '@/hooks/use-health-check';
import { createFileRoute, redirect, isRedirect } from '@tanstack/react-router';

export const Route = createFileRoute('/maintenance')({
  beforeLoad: async () => {
    try {
      const health = await runHealthCheck();
      if (health.message === 'OK') {
        throw redirect({ to: '/verify-username', replace: true });
      }
    } catch (error) {
      if (isRedirect(error)) throw error;
      // Backend still down – stay on maintenance page
    }
  },
  component: RouteComponent,
  head: () => ({
    meta: [
      { title: 'Maintenance | Cody Lillywhite' },
      {
        name: 'description',
        content: 'Server is temporarily unavailable. Please try again later.',
      },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
});

function RouteComponent() {
  return <div>Server is down for maintainance</div>;
}
