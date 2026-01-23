import type { RouterContext } from '@/App';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)/_auth')({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const authContext = context as RouterContext;
    const isAuthenticated = await authContext.checkAuth();
    if (isAuthenticated) {
      throw redirect({ to: "/" });
    }
  },
})

function RouteComponent() {
  return <div className="max-w-md mx-auto"><Outlet /></div>
}
