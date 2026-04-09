import { HOMESCHOOL_GRADE_OPTIONS } from '@/lib/homeschool-options';

export const ANY_GRADE_VALUE = 'ANY' as const;

const HOMESCHOOL_GRADE_VALUES = new Set(
  HOMESCHOOL_GRADE_OPTIONS.map((o) => o.value),
);

export type TeachableCourseDraft = {
  id: string;
  className: string;
  subjectId: string;
  /** Homeschool grade values from `HOMESCHOOL_GRADE_OPTIONS`, or exclusively `['ANY']`. */
  grades: string[];
  curriculum: string;
};

export function newCourseRow(): TeachableCourseDraft {
  return {
    id: crypto.randomUUID(),
    className: '',
    subjectId: '',
    grades: [],
    curriculum: '',
  };
}

export type TeachableCourseDraftLike = Omit<TeachableCourseDraft, 'id'>;

export function rowHasAnyFieldStarted(row: TeachableCourseDraftLike): boolean {
  return (
    row.className.trim().length > 0 ||
    row.subjectId.trim().length > 0 ||
    row.grades.length > 0 ||
    row.curriculum.trim().length > 0
  );
}

export function gradesSelectionIsValid(grades: string[]): boolean {
  if (grades.length === 0) return false;

  if (grades.length === 1 && grades[0] === ANY_GRADE_VALUE) return true;

  if (grades.includes(ANY_GRADE_VALUE)) return false;

  return grades.every((g) => HOMESCHOOL_GRADE_VALUES.has(g));
}

export function rowIsComplete(row: TeachableCourseDraftLike): boolean {
  if (!rowHasAnyFieldStarted(row)) return false;

  return (
    row.className.trim().length > 0 &&
    row.subjectId.trim().length > 0 &&
    row.curriculum.trim().length > 0 &&
    gradesSelectionIsValid(row.grades)
  );
}

export function teachableCoursesFormIsSubmittable(
  rows: Pick<TeachableCourseDraft, 'className' | 'subjectId' | 'grades' | 'curriculum'>[],
): boolean {
  const hasAtLeastOneComplete = rows.some((r) => rowIsComplete(r));
  const noPartialRows = rows.every(
    (r) => !rowHasAnyFieldStarted(r) || rowIsComplete(r),
  );
  return hasAtLeastOneComplete && noPartialRows;
}

/** Mutual exclusivity: Any vs specific grades (react-select multi). */
export function reconcileGradesAfterMultiSelect(
  prev: string[],
  next: string[],
): string[] {
  const hadOnlyAny = prev.length === 1 && prev[0] === ANY_GRADE_VALUE;
  const hasAny = next.includes(ANY_GRADE_VALUE);
  const withoutAny = next.filter((v) => v !== ANY_GRADE_VALUE);

  if (!hasAny) return withoutAny;

  if (withoutAny.length === 0) return [ANY_GRADE_VALUE];

  if (hadOnlyAny) return withoutAny;

  return [ANY_GRADE_VALUE];
}

/** Map draft grades to API fields for POST /profile/account-setup */
export function draftGradesToApiPayload(grades: string[]): {
  matchesAllGrades: boolean;
  grades: string[];
} {
  if (grades.length === 1 && grades[0] === ANY_GRADE_VALUE) {
    return { matchesAllGrades: true, grades: [] };
  }

  return { matchesAllGrades: false, grades: [...grades] };
}
