import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
} from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { isAuthenticated } from '@/lib/auth-session';

export const Route = createFileRoute('/(auth)/_auth')({
  component: RouteComponent,
  beforeLoad: ({ location }) => {
    const isForgotPasswordRoute = location.pathname === '/forgot-password';
    const isResetPasswordRoute = location.pathname === '/reset-password';
    const hasUsernameInSession =
      typeof window !== 'undefined' && sessionStorage.getItem('username');

    // Allow authenticated users to access forgot-password (from change password modal)
    // and reset-password (when they have username in sessionStorage)
    const allowedForAuthenticated =
      isForgotPasswordRoute || (isResetPasswordRoute && hasUsernameInSession);

    if (isAuthenticated() && !allowedForAuthenticated) {
      throw redirect({ to: '/' });
    }
  },
});

function RouteComponent() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-white backdrop-blur supports-backdrop-filter:bg-white">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center">
            <Link to="/about" className="font-semibold">
              Cody Lillywhite
            </Link>
            <Button variant="link" className='ml-8' size="lg" asChild>
              <Link to="/about">Product</Link>
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/verify-username">Sign in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/signup">Sign up</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="container mx-auto flex w-full flex-1 justify-center px-4 py-6">
        <div className="w-full max-w-2xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
