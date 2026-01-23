import {
  createRootRoute,
  Link,
  Outlet,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import useLogout from "@/hooks/use-logout";

const RootLayout = () => {
  const { isAuthenticated } = useAuth();
  const { mutate: logout } = useLogout();

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link to="/" className="font-semibold">
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
                <Button variant="ghost" size="sm" onClick={() => logout()}>
                  Sign out
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/verify-username">Sign in</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/signup">Sign up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="container mx-auto w-full min-h-screen p-4">
        <Outlet />
      </main>
      <TanStackRouterDevtools />
    </>
  );
};

export const Route = createRootRoute({ component: RootLayout });
