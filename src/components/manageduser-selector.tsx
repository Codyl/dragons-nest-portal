import { UserRound, X } from 'lucide-react';

import type { ManagedUserProfile } from '@/api/services/profile.services';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useSidebar } from '@/components/ui/sidebar';
import { useManagedUser } from '@/contexts/managed-user-context';
import { useNavigate } from '@tanstack/react-router';

interface ManagedUserSelectorProps {
  managedUsers: ManagedUserProfile[];
  isLoading?: boolean;
}

/**
 * Derives up-to-2-character initials from a display name.
 * Falls back to the first two characters of the name, or "?" if empty.
 */
function getInitials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase();
  }

  return displayName.slice(0, 2).toUpperCase() || '?';
}

export function ManagedUserSelector({
  managedUsers,
  isLoading = false,
}: ManagedUserSelectorProps) {
  const { state } = useSidebar();
  const {activeManagedUser, setActiveManagedUser} = useManagedUser();
  const navigate = useNavigate()
  const isCollapsed = state === 'collapsed';
  console.log(managedUsers)

  // Requirements 7.2 — show skeleton while loading
  if (isLoading) {
    return <Skeleton className="h-9 w-full" />;
  }

  // Collapsed sidebar mode — show initials or UserRound icon as tooltip trigger
  // Requirements 2.8
  if (isCollapsed) {
    const triggerLabel = activeManagedUser
      ? getInitials(activeManagedUser.displayName)
      : null;

    const tooltipText = activeManagedUser
      ? activeManagedUser.displayName
      : 'Select a managedUser';

    return (
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label={tooltipText}
              className="flex size-8 items-center justify-center rounded-md text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              {triggerLabel ? (
                <span>{triggerLabel}</span>
              ) : (
                <UserRound className="size-4" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" align="center">
            {tooltipText}
          </TooltipContent>
        </Tooltip>
        {activeManagedUser && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label="Back to my view"
                onClick={() => setActiveManagedUser(null)}
                className="flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <X className="size-3" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" align="center">
              Back to my view
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    );
  }

  // Requirements 2.6, 8.3 — no managedUsers available
  if (managedUsers.length === 0) {
    return (
      <Select disabled>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="No managedUsers available" />
        </SelectTrigger>
        <SelectContent>
          {/* empty — disabled select has no options */}
        </SelectContent>
      </Select>
    );
  }

  // Requirements 2.3, 2.4, 2.5 — normal select with managedUsers
  return (
    <Select
      value={activeManagedUser?.managedUserId ?? ''}
      onValueChange={(value) => {
        if (value === '__my_view__') {
          setActiveManagedUser(null);
          navigate({to: '/'})
          return;
        }

        const managedUser = managedUsers.find((s) => s.managedUserId === value);
        if (managedUser) {
          setActiveManagedUser(managedUser);
          navigate({to: '/curriculum'})
        }
      }}
    >
      <SelectTrigger className="w-full">
        {/* Requirements 2.4 — placeholder when no managedUser selected */}
        {/* Requirements 2.3 — show displayName when managedUser is selected */}
        <SelectValue placeholder="Select a managedUser">
          {activeManagedUser ? activeManagedUser.displayName : undefined}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {/* Deselect option — returns to parent view */}
        {activeManagedUser && (
          <SelectItem value="__my_view__">
            <span className="text-muted-foreground">← My view</span>
          </SelectItem>
        )}
        {/* Requirements 2.2 — render an option for each managedUser */}
        {managedUsers.map((managedUser) => (
          <SelectItem key={managedUser.managedUserId} value={managedUser.managedUserId}>
            {managedUser.displayName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
