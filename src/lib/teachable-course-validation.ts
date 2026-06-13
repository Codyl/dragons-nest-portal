import { HOMESCHOOL_GRADE_OPTIONS } from '@/lib/homeschool-options';

export const ANY_GRADE_VALUE = 'ANY' as const;

const HOMESCHOOL_GRADE_VALUES = new Set(
  HOMESCHOOL_GRADE_OPTIONS.map((o) => o.value),
);

/** Max consecutive grade span (max ordinal − min ordinal + 1) for non-enrichment subjects by catalog slug. Unlisted core subjects default to 2. */
const CORE_MAX_CONSECUTIVE_GRADES_BY_SLUG: Record<string, number> = {
  math: 2,
  reading: 2,
  science: 4,
  history: 4,
  life_skills: 6,
  'life-skills': 6,
};

const DEFAULT_CORE_MAX_CONSECUTIVE_GRADES = 2;

export type TeachableSubjectLookup = {
  slug: string;
  name: string;
  isEnrichment: boolean;
};

export type GetTeachableSubject = (
  subjectId: string,
) => TeachableSubjectLookup | undefined;

export type TeachableCourseDraft = {
  id: string;
  className: string;
  subjectId: string;
  /** Homeschool grade values from `HOMESCHOOL_GRADE_OPTIONS`, or exclusively `['ANY']` when subject is enrichment. */
  grades: string[];
  curriculum: string;
  /** Cap 20 per product rules */
  maxStudents: number;
};

export function newCourseRow(): TeachableCourseDraft {
  return {
    id: crypto.randomUUID(),
    className: '',
    subjectId: '',
    grades: [],
    curriculum: '',
    maxStudents: 1,
  };
}

export type TeachableCourseDraftLike = Omit<TeachableCourseDraft, 'id'>;

export function getMaxConsecutiveGradesForSubject(
  subject: TeachableSubjectLookup | undefined,
): number | null {
  if (!subject || subject.isEnrichment) return null;

  return (
    CORE_MAX_CONSECUTIVE_GRADES_BY_SLUG[subject.slug] ??
    DEFAULT_CORE_MAX_CONSECUTIVE_GRADES
  );
}

function gradeValueToOrdinal(value: string): number | null {
  const i = HOMESCHOOL_GRADE_OPTIONS.findIndex((o) => o.value === value);
  return i >= 0 ? i : null;
}

/**
 * Grade band span per Campfire rules: max(ordinal) − min(ordinal) + 1.
 * Returns null for empty, ANY-only, mixed ANY with grades, or non-catalog values.
 */
export function selectedGradesConsecutiveSpan(grades: string[]): number | null {
  if (grades.length === 0) return null;

  if (grades.length === 1 && grades[0] === ANY_GRADE_VALUE) return null;

  if (grades.includes(ANY_GRADE_VALUE)) return null;

  const ordinals: number[] = [];
  for (const g of grades) {
    const o = gradeValueToOrdinal(g);
    if (o === null) return null;

    ordinals.push(o);
  }

  return Math.max(...ordinals) - Math.min(...ordinals) + 1;
}

/**
 * Homeschool grade dropdown options for a core subject: every catalog grade either
 * already selected or addable without extending the band beyond `maxSpan`.
 * When `maxSpan` is null (enrichment / unlimited), returns the full catalog.
 */
export function homeschoolGradeOptionsWithinSpanLimit(
  selectedGrades: string[],
  maxSpan: number | null,
): { value: string; label: string }[] {
  if (maxSpan === null) {
    return [...HOMESCHOOL_GRADE_OPTIONS];
  }

  const specific = selectedGrades.filter((g) => g !== ANY_GRADE_VALUE);
  if (specific.length === 0) {
    return [...HOMESCHOOL_GRADE_OPTIONS];
  }

  const ordinals: number[] = [];
  for (const g of specific) {
    const o = gradeValueToOrdinal(g);
    if (o === null) {
      return [...HOMESCHOOL_GRADE_OPTIONS];
    }

    ordinals.push(o);
  }

  const minO = Math.min(...ordinals);
  const maxO = Math.max(...ordinals);

  return HOMESCHOOL_GRADE_OPTIONS.filter((opt) => {
    if (specific.includes(opt.value)) return true;

    const o = gradeValueToOrdinal(opt.value);
    if (o === null) return false;

    const newMin = Math.min(minO, o);
    const newMax = Math.max(maxO, o);

    return newMax - newMin + 1 <= maxSpan;
  });
}

export function rowHasAnyFieldStarted(row: TeachableCourseDraftLike): boolean {
  return (
    row.className.trim().length > 0 ||
    row.subjectId.trim().length > 0 ||
    row.grades.length > 0 ||
    row.curriculum.trim().length > 0
  );
}

export function gradesSelectionIsValid(
  grades: string[],
  allowAny: boolean,
): boolean {
  if (grades.length === 0) return false;

  if (grades.length === 1 && grades[0] === ANY_GRADE_VALUE) return allowAny;

  if (grades.includes(ANY_GRADE_VALUE)) return false;

  return grades.every((g) => HOMESCHOOL_GRADE_VALUES.has(g));
}

export function rowIsComplete(
  row: TeachableCourseDraftLike,
  getSubject: GetTeachableSubject,
): boolean {
  if (!rowHasAnyFieldStarted(row)) return false;

  if (
    row.className.trim().length === 0 ||
    row.subjectId.trim().length === 0 ||
    row.curriculum.trim().length === 0
  ) {
    return false;
  }

  if (
    !Number.isFinite(row.maxStudents) ||
    row.maxStudents < 1 ||
    row.maxStudents > 20
  ) {
    return false;
  }

  const subject = getSubject(row.subjectId);
  if (!subject) return false;

  const allowAny = subject.isEnrichment;
  if (!gradesSelectionIsValid(row.grades, allowAny)) return false;

  const limit = getMaxConsecutiveGradesForSubject(subject);
  if (limit === null) return true;

  const span = selectedGradesConsecutiveSpan(row.grades);
  if (span === null) return false;

  return span <= limit;
}

export function teachableCoursesFormIsSubmittable(
  rows: Pick<
    TeachableCourseDraft,
    'className' | 'subjectId' | 'grades' | 'curriculum' | 'maxStudents'
  >[],
  getSubject: GetTeachableSubject,
): boolean {
  const allRowsEmpty = rows.every((r) => !rowHasAnyFieldStarted(r));
  if (allRowsEmpty) return true;

  const hasAtLeastOneComplete = rows.some((r) => rowIsComplete(r, getSubject));
  const noPartialRows = rows.every(
    (r) => !rowHasAnyFieldStarted(r) || rowIsComplete(r, getSubject),
  );
  return hasAtLeastOneComplete && noPartialRows;
}

/** Inline warning under grade control; null when no span violation. */
export function rowGradeSpanViolationMessage(
  row: TeachableCourseDraftLike,
  getSubject: GetTeachableSubject,
): string | null {
  const subject = getSubject(row.subjectId);
  if (!subject) return null;

  const limit = getMaxConsecutiveGradesForSubject(subject);
  if (limit === null) return null;

  const span = selectedGradesConsecutiveSpan(row.grades);
  if (span === null || span <= limit) return null;

  return `No more than ${limit} consecutive grades can be covered for ${subject.name} under one course. If desired create a separate course for the additional grade levels.`;
}

/** Mutual exclusivity: Any vs specific grades (react-select multi). */
export function reconcileGradesAfterMultiSelect(
  prev: string[],
  next: string[],
  allowAnyOption: boolean,
): string[] {
  const hadOnlyAny = prev.length === 1 && prev[0] === ANY_GRADE_VALUE;
  const hasAny = next.includes(ANY_GRADE_VALUE);
  const withoutAny = next.filter((v) => v !== ANY_GRADE_VALUE);

  if (!allowAnyOption) return withoutAny;

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
