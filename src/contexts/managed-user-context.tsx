import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { ManagedUserProfile } from '@/api/services/profile.services';
import useLoggedInUser from '@/hooks/use-logged-in-user';
import { resolveActiveManagedUser } from '@/lib/managed-user-storage';

const STORAGE_KEY = 'activemanagedUserId'; // ponytail: localStorage key kept for user continuity

export interface ManagedUserContextValue {
  /** The currently selected managed user, or null if none is selected. */
  activeManagedUser: ManagedUserProfile | null;
  /** Update the active managed user. Pass null to deselect. */
  setActiveManagedUser: (user: ManagedUserProfile | null) => void;
  /** All managed users from the ['user', 'me'] query result. */
  managedUsers: ManagedUserProfile[];
  /** True while the ['user', 'me'] query is loading. */
  isLoading: boolean;
}

export const ManagedUserContext =
  React.createContext<ManagedUserContextValue | null>(null);

export function useManagedUser(): ManagedUserContextValue {
  const ctx = React.useContext(ManagedUserContext);
  if (!ctx)
    throw new Error('useManagedUser must be used within ManagedUserProvider');

  return ctx;
}

export function ManagedUserProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: userRes, isLoading } = useLoggedInUser();
  const managedUsers: ManagedUserProfile[] =
    userRes?.data?.managedUsers ?? [];

  const [activeManagedUser, setActiveManagedUserState] =
    React.useState<ManagedUserProfile | null>(null);

  // Restore from localStorage once managed users are available
  React.useEffect(() => {
    if (isLoading) return;
    
    let storedId: string | null = null;
    try {
      storedId = localStorage.getItem(STORAGE_KEY);
    } catch {
      // localStorage unavailable (e.g., private browsing restrictions)
    }

    if (!storedId) return;

    const match = resolveActiveManagedUser(managedUsers, storedId);

    if (match) {
      setActiveManagedUserState(match);
    } else {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // localStorage unavailable
      }
      setActiveManagedUserState(null);
    }
  }, [isLoading, managedUsers]);

  const queryClient = useQueryClient();

  const setActiveManagedUser = React.useCallback(
    (user: ManagedUserProfile | null) => {
      // Invalidate scoped queries for the previous managed user
      const previousId = activeManagedUser?.managedUserId;
      if (previousId && user?.managedUserId !== previousId) {
        void queryClient.invalidateQueries({
          queryKey: ['manageduser', previousId],
        });
      }

      setActiveManagedUserState(user);

      try {
        if (user) {
          localStorage.setItem(STORAGE_KEY, user.managedUserId);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch {
        // localStorage unavailable (e.g., private browsing restrictions)
      }
    },
    [activeManagedUser, queryClient],
  );

  const value = React.useMemo(
    () => ({
      activeManagedUser,
      setActiveManagedUser,
      managedUsers,
      isLoading,
    }),
    [activeManagedUser, setActiveManagedUser, managedUsers, isLoading],
  );

  return (
    <ManagedUserContext.Provider value={value}>
      {children}
    </ManagedUserContext.Provider>
  );
}
