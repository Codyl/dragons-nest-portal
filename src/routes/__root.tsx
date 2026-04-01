import {
  createRootRoute,
  HeadContent,
  Link,
  Outlet,
  redirect,
  isRedirect,
} from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { Button } from '@/components/ui/button';
import useAuth from '@/hooks/use-auth';
import useLogout from '@/hooks/use-logout';
import { runHealthCheck } from '@/hooks/use-health-check';
import { Toaster } from '@/components/ui/sonner';

function GlobalError({ error }: { error: Error }) {
  return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-red-600">
          Something went wrong
        </h1>
        <p className="mt-2 text-gray-600">{error.message}</p>
      </div>
    </div>
  );
}

const RootLayout = () => {
  const { isAuthenticated } = useAuth();
  const { mutate: logout } = useLogout();

  return (
    <>
      <HeadContent />
      <header className="sticky top-0 z-50 w-full border-b bg-white backdrop-blur supports-backdrop-filter:bg-white">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="font-semibold"
            >
              Cody Lillywhite
            </Link>
            {isAuthenticated && (
              <nav className="hidden md:flex items-center gap-4 text-sm">
                <Link
                  to="/account-settings"
                  className="text-muted-foreground transition-colors hover:text-foreground [&.active]:text-foreground"
                >
                  Account Settings
                </Link>
                <Link
                  to="/security-settings"
                  className="text-muted-foreground transition-colors hover:text-foreground [&.active]:text-foreground"
                >
                  Security Settings
                </Link>
              </nav>
            )}
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => logout()}
                >
                  Sign out
                </Button>
              </>
            ) : (
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
            )}
          </div>
        </div>
      </header>
      <main className="container mx-auto w-full min-h-screen p-4">
        <Outlet />
        <Toaster />
      </main>
      <TanStackRouterDevtools />
    </>
  );
};

export const Route = createRootRoute({
  beforeLoad: async ({ location }) => {
    if (location.pathname === '/maintenance') return;

    try {
      await runHealthCheck();
    } catch (error) {
      if (isRedirect(error)) throw error;

      throw redirect({ to: '/maintenance', replace: true });
    }
  },
  component: RootLayout,
  errorComponent: GlobalError,
  head: () => ({
    meta: [
      { title: 'Cody Lillywhite' },
      {
        name: 'keywords',
        content: 'Cody Lillywhite',
      },
      {
        name: 'author',
        content: 'Cody Lillywhite',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1.0',
      },
      {
        name: 'charset',
        content: 'UTF-8',
      },
    ],
  }),
});
