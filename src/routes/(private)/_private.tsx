import type { RouterContext } from '@/App';
import PromotionNudgeBanner from '@/components/banners/promotion-nudge.banner';
import { PrivateAppSidebar } from '@/components/private-app-sidebar';
import { SettingsShellSidebar } from '@/components/settings-shell-sidebar';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { StudentProvider, useStudent } from '@/contexts/student-context';
import {
  createFileRoute,
  Outlet,
  redirect,
  useNavigate,
  useRouterState,
} from '@tanstack/react-router';
import { useEffect } from 'react';

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
    <StudentProvider>
      <StudentRouteGuard pathname={pathname} />
      <SidebarProvider>
        {isSettingsShell ? <SettingsShellSidebar /> : <PrivateAppSidebar />}
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
          </header>
          <div className="container mx-auto w-full flex-1 overflow-auto p-4">
            <PromotionNudgeBanner />
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </StudentProvider>
  );
}

/** ponytail: redirects to /curriculum when a student is active but the user is on a parent-only page */
const studentRoutes = ['/curriculum', '/compliance'];

function StudentRouteGuard({ pathname }: { pathname: string }) {
  const { activeStudent } = useStudent();
  const navigate = useNavigate();

  const isOnStudentRoute = studentRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  useEffect(() => {
    if (activeStudent && !isOnStudentRoute) {
      navigate({ to: '/curriculum', replace: true });
    }
  }, [activeStudent, isOnStudentRoute, navigate]);

  return null;
}
