export type PendingStudentDraft = {
  id: string;
  studentId: string;
  displayName: string;
  currentGradeOrdinal: string;
};

export function newStudentRow(): PendingStudentDraft {
  return {
    id: crypto.randomUUID(),
    studentId: crypto.randomUUID(),
    displayName: '',
    currentGradeOrdinal: '',
  };
}
