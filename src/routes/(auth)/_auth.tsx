import type { RouterContext } from '@/App';
import { createFileRoute, Link, Outlet, redirect } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';

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
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-white backdrop-blur supports-backdrop-filter:bg-white">
        <div className="container flex h-14 items-center justify-between px-4">
          <Link
            to="/"
            className="font-semibold"
          >
            Cody Lillywhite
          </Link>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              asChild
            >
              <Link to="/verify-username">Sign in</Link>
            </Button>
            <Button
              size="sm"
              asChild
            >
              <Link to="/signup">Sign up</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="container mx-auto flex w-full flex-1 justify-center px-4 py-6">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
