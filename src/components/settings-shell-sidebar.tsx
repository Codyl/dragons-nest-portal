import { Link, useRouter, useRouterState } from '@tanstack/react-router';
import {
  ArrowLeft,
  Bell,
  BookOpen,
  CreditCard,
  Shield,
  User,
  UserCircle,
  Users,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from '@/components/ui/sidebar';

const settingsNav = [
  { to: '/settings/profile', label: 'Profile', icon: User },
  { to: '/settings/account', label: 'Account', icon: UserCircle },
  { to: '/settings/security', label: 'Security', icon: Shield },
  { to: '/settings/billing', label: 'Billing', icon: CreditCard },
  { to: '/settings/notifications', label: 'Notifications', icon: Bell },
  {
    to: '/settings/teaching-subjects',
    label: 'Teaching Subjects',
    icon: BookOpen,
  },
  {
    to: '/settings/child-accounts',
    label: 'Child Accounts',
    icon: Users,
  },
] as const;

export function SettingsShellSidebar() {
  const router = useRouter()
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => router.history.back()} tooltip="Back to Dashboard">
                <ArrowLeft />
                <span>Back to Dashboard</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsNav.map(({ to, label, icon: Icon }) => (
                <SidebarMenuItem key={to}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === to || pathname.startsWith(`${to}/`)}
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
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
