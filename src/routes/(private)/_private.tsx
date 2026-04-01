import type { RouterContext } from '@/App';
import { PrivateAppSidebar } from '@/components/private-app-sidebar';
import { SettingsShellSidebar } from '@/components/settings-shell-sidebar';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  createFileRoute,
  Outlet,
  redirect,
  useRouterState,
} from '@tanstack/react-router';

export const Route = createFileRoute('/(private)/_private')({
  beforeLoad: async ({ context, location }) => {
    const authContext = context as RouterContext;
    const isAuthenticated = await authContext.checkAuth();

    if (!isAuthenticated) {
      throw redirect({
        to: '/verify-username',
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAccountSetupShell =
    pathname === '/account-setup' || pathname.startsWith('/account-setup/');
  const isSettingsShell = pathname.startsWith('/settings');

  if (isAccountSetupShell) {
    return (
      <div className="bg-background min-h-svh w-full">
        <Outlet />
      </div>
    );
  }

  return (
    <SidebarProvider>
      {isSettingsShell ? <SettingsShellSidebar /> : <PrivateAppSidebar />}
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
        </header>
        <div className="container mx-auto w-full flex-1 overflow-auto p-4">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
