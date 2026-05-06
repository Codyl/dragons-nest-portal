import { Link, useRouterState } from '@tanstack/react-router';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  ChevronsUpDown,
  ClipboardCheck,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
} from 'lucide-react';

import useLoggedInUser from '@/hooks/use-logged-in-user';
import useLogout from '@/hooks/use-logout';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { StudentSelector } from '@/components/student-selector';
import { useStudent } from '@/contexts/student-context';

const studentNavTabs = [
  { to: '/curriculum' as string, label: 'Curriculum', icon: BookOpen },
  { to: '/compliance' as string, label: 'Compliance', icon: ClipboardCheck },
];

const parentNavTabs = [
  { to: '/' as string, label: 'Dashboard', icon: LayoutDashboard },
  { to: '/class-requests' as string, label: 'Class Requests', icon: Users },
  { to: '/schedule' as string, label: 'Schedule', icon: Calendar },
  { to: '/my-subjects' as string, label: 'My Subjects', icon: GraduationCap },
];

function profileLabel(data: {
  given_name?: string;
  family_name?: string;
  email?: string;
}): string {
  const g = data.given_name?.trim();
  const f = data.family_name?.trim();
  if (g && f) return `${g} ${f}`;

  if (g) return g;

  const email = data.email;
  if (email?.includes('@')) return email.split('@')[0] ?? 'Account';

  return email?.trim() || 'Account';
}

function initials(data: {
  given_name?: string;
  family_name?: string;
  email?: string;
}): string {
  const g = data.given_name?.trim();
  const f = data.family_name?.trim();
  if (g && f) return `${g[0] ?? ''}${f[0] ?? ''}`.toUpperCase().slice(0, 2);

  if (g) return g.slice(0, 2).toUpperCase();

  const email = data.email;
  if (email?.length) return email.slice(0, 2).toUpperCase();

  return '?';
}

const popoverLinkClass =
  'flex w-full items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring';

export function PrivateAppSidebar() {
  const { mutate: logout } = useLogout();
  const { data: userRes } = useLoggedInUser();
  const user = userRes?.data;
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const { activeStudent, students, setActiveStudent, isLoading } = useStudent();

  const displayName = user ? profileLabel(user) : '…';
  const email = user?.email ?? '';
  const initialsStr = user ? initials(user) : '…';

  return (
    <Sidebar
      collapsible="icon"
      variant="inset"
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
            >
              <Link to="/">
                <span className="truncate font-semibold">Cody Lillywhite</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {activeStudent !== null ? (
          <SidebarGroup>
            <SidebarGroupLabel>
              <button
                type="button"
                onClick={() => setActiveStudent(null)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Back to my view"
              >
                <ArrowLeft className="size-3" />
                Back to my view
              </button>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {studentNavTabs.map(({ to, label, icon: Icon }) => (
                  <SidebarMenuItem key={to}>
                    <SidebarMenuButton
                      asChild
                      isActive={
                        pathname === to || pathname.startsWith(`${to}/`)
                      }
                      tooltip={label}
                    >
                      <Link to={to}>
                        <Icon />
                        <span>{label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
          <SidebarGroup>
            <SidebarGroupLabel>App</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {parentNavTabs.map(({ to, label, icon: Icon }) => (
                  <SidebarMenuItem key={to}>
                    <SidebarMenuButton
                      asChild
                      isActive={
                        to === '/'
                          ? pathname === '/'
                          : pathname === to || pathname.startsWith(`${to}/`)
                      }
                      tooltip={label}
                    >
                      <Link to={to}>
                        <Icon />
                        <span>{label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <StudentSelector
              students={students}
              activeStudent={activeStudent}
              onSelect={setActiveStudent}
              isLoading={isLoading}
            />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Popover>
              <PopoverTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  tooltip={displayName}
                >
                  <Avatar
                    className="size-8 rounded-lg"
                    size="sm"
                  >
                    <AvatarFallback className="rounded-lg text-xs">
                      {initialsStr}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{displayName}</span>
                    {email ? (
                      <span className="truncate text-xs text-muted-foreground">
                        {email}
                      </span>
                    ) : null}
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </PopoverTrigger>
              <PopoverContent
                className="w-56 p-0"
                side="top"
                align="start"
                sideOffset={8}
              >
                <div className="flex flex-col gap-1 p-1">
                  <Link
                    to="/settings/profile"
                    className={cn(popoverLinkClass, 'font-medium')}
                  >
                    <Settings className="mr-2 size-4 opacity-70" />
                    Settings
                  </Link>
                  <Link
                    to="/settings/security"
                    className={popoverLinkClass}
                  >
                    Security
                  </Link>
                  <Separator className="my-1" />
                  <button
                    type="button"
                    className={cn(
                      popoverLinkClass,
                      'text-left text-destructive hover:bg-destructive/10 hover:text-destructive',
                    )}
                    onClick={() => logout()}
                  >
                    <LogOut className="mr-2 size-4 opacity-70" />
                    Sign out
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
