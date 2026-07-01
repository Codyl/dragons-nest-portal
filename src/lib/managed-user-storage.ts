import type { ManagedUserProfile } from '@/api/services/profile.services';

/**
 * Returns the first managed user whose `managedUserId` matches `id`, or `null`.
 * Pure function — no side effects, no localStorage access.
 */
export function findManagedUserById(
  managedUsers: ManagedUserProfile[],
  id: string | null,
): ManagedUserProfile | null {
  if (!id) return null;

  return managedUsers.find((u) => u.managedUserId === id) ?? null;
}

/**
 * Resolves the active managed user from a stored ID.
 * Returns `null` when `storedId` is falsy or has no match in `managedUsers`.
 * Pure function — no side effects, no localStorage access.
 */
export function resolveActiveManagedUser(
  managedUsers: ManagedUserProfile[],
  storedId: string | null,
): ManagedUserProfile | null {
  if (!storedId) return null;

  return findManagedUserById(managedUsers, storedId);
}
