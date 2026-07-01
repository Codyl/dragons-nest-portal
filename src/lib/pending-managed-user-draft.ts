export type PendingManagedUserDraft = {
  id: string;
  managedUserId: string; // ponytail: wire name kept for API compat
  displayName: string;
  currentGradeOrdinal: string;
};

export function newManagedUserRow(): PendingManagedUserDraft {
  return {
    id: crypto.randomUUID(),
    managedUserId: crypto.randomUUID(),
    displayName: '',
    currentGradeOrdinal: '',
  };
}
