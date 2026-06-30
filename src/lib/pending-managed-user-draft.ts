export type PendingManagedUserDraft = {
  id: string;
  studentId: string; // ponytail: wire name kept for API compat
  displayName: string;
  currentGradeOrdinal: string;
};

export function newManagedUserRow(): PendingManagedUserDraft {
  return {
    id: crypto.randomUUID(),
    studentId: crypto.randomUUID(),
    displayName: '',
    currentGradeOrdinal: '',
  };
}
