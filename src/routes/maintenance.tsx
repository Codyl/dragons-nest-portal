import { Button } from '@/components/ui/button';
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
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold">Server is down for maintainance</h1>
      <p className="text-lg text-gray-500">Please try again later.</p>
      <Button onClick={() => window.location.reload()}>Reload</Button>
    </div>);
}
