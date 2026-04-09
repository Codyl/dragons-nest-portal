export type PendingStudentDraft = {
  id: string;
  studentDraftId: string;
  displayName: string;
  currentGradeOrdinal: string;
};

export function newStudentRow(): PendingStudentDraft {
  return {
    id: crypto.randomUUID(),
    studentDraftId: crypto.randomUUID(),
    displayName: '',
    currentGradeOrdinal: '',
  };
}
