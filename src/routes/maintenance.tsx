import { runHealthCheck } from '@/hooks/use-health-check';
import { createFileRoute, redirect, isRedirect } from '@tanstack/react-router'

export const Route = createFileRoute('/maintenance')({
  component: RouteComponent,
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
})

function RouteComponent() {

  return <div>Server is down for maintainance</div>
}
