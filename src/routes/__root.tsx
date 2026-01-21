import { createRootRoute, Link, Outlet, useRouter } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useMutation } from '@tanstack/react-query';
import AuthServices from '@/api/services/auth.services';

const RootLayout = () => {
    const router = useRouter();
    
    const { isAuthenticated } = useAuth();
    const { mutate: logout } = useMutation({
        mutationFn: AuthServices.logout,
        onSuccess: () => {
            sessionStorage.removeItem("session");
            sessionStorage.removeItem("username");
            sessionStorage.removeItem("password");
            localStorage.removeItem("AccessToken");
            localStorage.removeItem("RefreshToken");
            localStorage.removeItem("IdToken");
            router.navigate({ to: "/login" });
        }
    });
        const handleLogout = () => {
        const token = localStorage.getItem("AccessToken");
        if (token) {
            logout(token);
        }
    };


    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
                <div className="container flex h-14 items-center justify-between px-4">
                    <div className="flex items-center gap-6">
                        <Link to="/" className="font-semibold">
                            Acme Inc
                        </Link>
                        {isAuthenticated && (
                            <nav className="hidden md:flex items-center gap-4 text-sm">
                                <Link
                                    to="/users/me"
                                    className="text-muted-foreground transition-colors hover:text-foreground [&.active]:text-foreground"
                                >
                                    Profile
                                </Link>
                                <Link
                                    to="/users/me/settings"
                                    className="text-muted-foreground transition-colors hover:text-foreground [&.active]:text-foreground"
                                >
                                    Settings
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
                                    onClick={handleLogout}
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
                                    <Link to="/login">Sign in</Link>
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
            <main>
                <Outlet />
            </main>
            <TanStackRouterDevtools />
        </>
    );
};

export const Route = createRootRoute({ component: RootLayout });
