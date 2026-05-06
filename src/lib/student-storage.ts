import type { HouseholdStudentProfile } from '@/api/services/user.services';

/**
 * Returns the first student whose `studentDraftId` matches `id`, or `null`.
 * Pure function — no side effects, no localStorage access.
 */
export function findStudentById(
  students: HouseholdStudentProfile[],
  id: string | null,
): HouseholdStudentProfile | null {
  if (!id) return null;

  return students.find((s) => s.studentDraftId === id) ?? null;
}

/**
 * Resolves the active student from a stored ID.
 * Returns `null` when `storedId` is falsy or has no match in `students`.
 * Pure function — no side effects, no localStorage access.
 */
export function resolveActiveStudent(
  students: HouseholdStudentProfile[],
  storedId: string | null,
): HouseholdStudentProfile | null {
  if (!storedId) return null;

  return findStudentById(students, storedId);
}
