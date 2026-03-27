import type { RouterContext } from '@/App';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/(auth)/_auth')({
  component: RouteComponent,
  beforeLoad: async ({ context, location }) => {
    const authContext = context as RouterContext;
    const isAuthenticated = await authContext.checkAuth();

    const isForgotPasswordRoute = location.pathname === '/forgot-password';
    const isResetPasswordRoute = location.pathname === '/reset-password';
    const hasUsernameInSession =
      typeof window !== 'undefined' && sessionStorage.getItem('username');

    // Allow authenticated users to access forgot-password (from change password modal)
    // and reset-password (when they have username in sessionStorage)
    const allowedForAuthenticated =
      isForgotPasswordRoute || (isResetPasswordRoute && hasUsernameInSession);

    if (isAuthenticated && !allowedForAuthenticated) {
      throw redirect({ to: '/' });
    }
  },
});

function RouteComponent() {
  return (
    <div className="max-w-md mx-auto">
      <Outlet />
    </div>
  );
}
