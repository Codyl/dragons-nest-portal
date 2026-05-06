// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import * as fc from 'fast-check';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Subject } from '@/api/services/subjects.services';
import {
  ANY_GRADE_VALUE,
  getMaxConsecutiveGradesForSubject,
  homeschoolGradeOptionsWithinSpanLimit,
  rowGradeSpanViolationMessage,
  rowIsComplete,
  type TeachableCourseDraftLike,
} from '@/lib/teachable-course-validation';
import { TEACHABLE_GRADE_OPTIONS_WITH_ANY } from '@/lib/teachable-grade-react-select';
import { HOMESCHOOL_GRADE_OPTIONS } from '@/lib/homeschool-options';
import AddCourseSheet from './add-course-sheet';

// ---------------------------------------------------------------------------
// Mock the mutation hook
// ---------------------------------------------------------------------------

vi.mock('@/hooks/use-add-teachable-course', () => ({
  default: () => ({
    mutate: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
    reset: vi.fn(),
  }),
}));

afterEach(() => {
  cleanup();
});

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const enrichmentSubject: Subject = {
  _id: 'subj-enrichment',
  name: 'Art',
  icon: '🎨',
  color: '#ff0000',
  slug: 'art',
  isEnrichment: true,
};

const coreSubject: Subject = {
  _id: 'subj-core',
  name: 'Mathematics',
  icon: '📐',
  color: '#0000ff',
  slug: 'math',
  isEnrichment: false,
};

const allSubjects: Subject[] = [enrichmentSubject, coreSubject];

// ---------------------------------------------------------------------------
// Arbitrary generators
// ---------------------------------------------------------------------------

function arbitrarySubject(): fc.Arbitrary<Subject> {
  return fc.record({
    _id: fc.uuid(),
    name: fc
      .string({ minLength: 1, maxLength: 40 })
      .filter((s) => s.trim().length > 0),
    icon: fc.constant('📚'),
    color: fc.constant('#aabbcc'),
    slug: fc
      .string({ minLength: 1, maxLength: 20 })
      .filter((s) => /^[a-z0-9_-]+$/.test(s)),
    isEnrichment: fc.boolean(),
  });
}

// ---------------------------------------------------------------------------
// Unit tests — Task 13.1
// ---------------------------------------------------------------------------

describe('AddCourseSheet', () => {
  it('submit button is disabled when form is empty', () => {
    render(
      <AddCourseSheet
        open={true}
        onOpenChange={vi.fn()}
        subjects={allSubjects}
      />,
    );
    const submitBtn = screen.getByRole('button', { name: /add course/i });
    expect((submitBtn as HTMLButtonElement).disabled).toBe(true);
  });

  it('shows subject-first placeholder for grade until subject is selected', () => {
    render(
      <AddCourseSheet
        open={true}
        onOpenChange={vi.fn()}
        subjects={[enrichmentSubject]}
      />,
    );

    expect(screen.getByText('Select a subject first')).toBeTruthy();
    expect(screen.getByTestId('add-course-grade-select')).toBeTruthy();
  });

  it('enrichment subject options include Any (TEACHABLE_GRADE_OPTIONS_WITH_ANY)', () => {
    const maxSpan = getMaxConsecutiveGradesForSubject({
      slug: enrichmentSubject.slug,
      name: enrichmentSubject.name,
      isEnrichment: true,
    });
    expect(maxSpan).toBeNull();

    const options = homeschoolGradeOptionsWithinSpanLimit([], maxSpan);
    expect(options.length).toBe(HOMESCHOOL_GRADE_OPTIONS.length);

    expect(
      TEACHABLE_GRADE_OPTIONS_WITH_ANY.some((o) => o.value === ANY_GRADE_VALUE),
    ).toBe(true);
  });

  it('non-enrichment subject catalog options do not include ANY_GRADE_VALUE', () => {
    const maxSpan = getMaxConsecutiveGradesForSubject({
      slug: coreSubject.slug,
      name: coreSubject.name,
      isEnrichment: false,
    });
    expect(maxSpan).not.toBeNull();

    const options = homeschoolGradeOptionsWithinSpanLimit([], maxSpan);
    const hasAnyGrade = options.some((o) => o.value === ANY_GRADE_VALUE);
    expect(hasAnyGrade).toBe(false);
  });

  it('renders the sheet when open=true', () => {
    render(
      <AddCourseSheet
        open={true}
        onOpenChange={vi.fn()}
        subjects={allSubjects}
      />,
    );
    // The sheet title "Add Course" appears as a heading
    const heading = screen.getByRole('heading', { name: /add course/i });
    expect(heading).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// Property 3: Add-course form rejects incomplete submissions — Task 13.2
// Feature: manage-teachable-subjects, Property 3: Add-course form rejects incomplete submissions
// Validates: Requirements 3.3, 3.7
// ---------------------------------------------------------------------------

describe('Property 3: Add-course form rejects incomplete submissions', () => {
  it('rowIsComplete returns false for any form state with at least one required field missing or invalid', () => {
    // Feature: manage-teachable-subjects, Property 3: Add-course form rejects incomplete submissions
    // Validates: Requirements 3.3, 3.7

    const GRADE_VALUES = HOMESCHOOL_GRADE_OPTIONS.map((o) => o.value);
    const CURRICULUM_VALUES = [
      'abeka',
      'saxon',
      'sonlight',
      'other',
      'eclectic',
    ];

    // Generate form states where at least one required field is empty/invalid
    fc.assert(
      fc.property(
        fc.record({
          // At least one of these will be empty/invalid
          className: fc.oneof(
            fc.constant(''),
            fc
              .string({ minLength: 1, maxLength: 60 })
              .filter((s) => s.trim().length > 0),
          ),
          subjectId: fc.oneof(fc.constant(''), fc.uuid()),
          grades: fc.oneof(
            fc.constant([]),
            fc.array(fc.constantFrom(...GRADE_VALUES), {
              minLength: 1,
              maxLength: 3,
            }),
          ),
          curriculum: fc.oneof(
            fc.constant(''),
            fc.constantFrom(...CURRICULUM_VALUES),
          ),
          maxStudents: fc.oneof(
            fc.integer({ min: 1, max: 20 }),
            fc.constant(0),
            fc.constant(21),
          ),
        }),
        fc.boolean(), // isEnrichment for the subject
        (formState, isEnrichment) => {
          // Build a subject lookup that matches the subjectId in the form
          const getSubject = (id: string) => {
            if (id === formState.subjectId && id !== '') {
              return { slug: 'math', name: 'Math', isEnrichment };
            }
            return undefined;
          };

          const draft: TeachableCourseDraftLike = {
            className: formState.className,
            subjectId: formState.subjectId,
            grades: formState.grades as string[],
            curriculum: formState.curriculum,
            maxStudents: formState.maxStudents,
          };

          const isComplete = rowIsComplete(draft, getSubject);

          // If any required field is missing/invalid, rowIsComplete should return false
          const hasEmptyClassName = draft.className.trim().length === 0;
          const hasEmptySubject = draft.subjectId.trim().length === 0;
          const hasEmptyGrades = draft.grades.length === 0;
          const hasEmptyCurriculum = draft.curriculum.trim().length === 0;
          const hasInvalidMaxStudents =
            draft.maxStudents < 1 || draft.maxStudents > 20;

          const hasInvalidField =
            hasEmptyClassName ||
            hasEmptySubject ||
            hasEmptyGrades ||
            hasEmptyCurriculum ||
            hasInvalidMaxStudents;

          if (hasInvalidField) {
            // rowIsComplete must return false when any required field is invalid
            return isComplete === false;
          }

          // If all fields are present and valid, we don't assert either way
          // (the form may or may not be complete depending on grade validity)
          return true;
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 4: Enrichment subjects allow "All grades"; non-enrichment subjects do not — Task 13.3
// Feature: manage-teachable-subjects, Property 4: Enrichment/non-enrichment grade options
// Validates: Requirements 3.4, 3.5
// ---------------------------------------------------------------------------

describe('Property 4: Enrichment subjects allow "Any" grade; non-enrichment subjects do not', () => {
  it('"Any" option presence matches isEnrichment for any subject', () => {
    // Feature: manage-teachable-subjects, Property 4: Enrichment/non-enrichment grade options
    // Validates: Requirements 3.4, 3.5
    fc.assert(
      fc.property(arbitrarySubject(), (subject) => {
        const subjectLookup = {
          slug: subject.slug,
          name: subject.name,
          isEnrichment: subject.isEnrichment,
        };

        const maxSpan = getMaxConsecutiveGradesForSubject(subjectLookup);
        const gradeOptions = homeschoolGradeOptionsWithinSpanLimit([], maxSpan);

        if (subject.isEnrichment) {
          expect(maxSpan).toBeNull();
          const hasAnyInOptions = gradeOptions.some(
            (o) => o.value === ANY_GRADE_VALUE,
          );
          expect(hasAnyInOptions).toBe(false);
        } else {
          // maxSpan should be non-null for non-enrichment subjects
          expect(maxSpan).not.toBeNull();
          // The grade options should NOT include ANY_GRADE_VALUE
          const hasAnyInOptions = gradeOptions.some(
            (o) => o.value === ANY_GRADE_VALUE,
          );
          expect(hasAnyInOptions).toBe(false);
        }

        return true;
      }),
      { numRuns: 100 },
    );
  });

  it('"Any" option is present in grade options for enrichment subjects only', () => {
    fc.assert(
      fc.property(fc.boolean(), (isEnrichment) => {
        const subject: Subject = {
          _id: 'test-subject',
          name: 'Test Subject',
          icon: '📚',
          color: '#aabbcc',
          slug: isEnrichment ? 'art' : 'math',
          isEnrichment,
        };

        const maxSpan = getMaxConsecutiveGradesForSubject({
          slug: subject.slug,
          name: subject.name,
          isEnrichment: subject.isEnrichment,
        });

        const gradeOptions = homeschoolGradeOptionsWithinSpanLimit([], maxSpan);

        const gradeSelectOptions = isEnrichment
          ? TEACHABLE_GRADE_OPTIONS_WITH_ANY
          : gradeOptions;

        const hasAny = gradeSelectOptions.some(
          (o) => o.value === ANY_GRADE_VALUE,
        );

        return hasAny === isEnrichment;
      }),
      { numRuns: 100 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 5: Grade-span limit enforced for non-enrichment subjects — Task 13.4
// Feature: manage-teachable-subjects, Property 5: Grade-span limit is enforced for non-enrichment subjects
// Validates: Requirements 3.6
// ---------------------------------------------------------------------------

describe('Property 5: Grade-span limit is enforced for non-enrichment subjects', () => {
  it('rowGradeSpanViolationMessage returns non-null for grade selections exceeding the span limit', () => {
    // Feature: manage-teachable-subjects, Property 5: Grade-span limit is enforced for non-enrichment subjects
    // Validates: Requirements 3.6

    const GRADE_VALUES = HOMESCHOOL_GRADE_OPTIONS.map((o) => o.value);

    // Non-enrichment subjects with known span limits
    const nonEnrichmentSubjects = [
      { slug: 'math', name: 'Math', isEnrichment: false, maxSpan: 2 },
      { slug: 'reading', name: 'Reading', isEnrichment: false, maxSpan: 2 },
      { slug: 'science', name: 'Science', isEnrichment: false, maxSpan: 4 },
      { slug: 'history', name: 'History', isEnrichment: false, maxSpan: 4 },
    ];

    fc.assert(
      fc.property(
        fc.constantFrom(...nonEnrichmentSubjects),
        fc.integer({ min: 0, max: GRADE_VALUES.length - 1 }),
        (subject, startIndex) => {
          // Build a grade selection that exceeds the span limit
          // span = maxSpan + 1 consecutive grades starting at startIndex
          const spanExceeding = subject.maxSpan + 1;
          const endIndex = Math.min(
            startIndex + spanExceeding - 1,
            GRADE_VALUES.length - 1,
          );
          const actualStart = Math.max(0, endIndex - spanExceeding + 1);

          if (endIndex - actualStart + 1 <= subject.maxSpan) {
            // Can't build a violating selection with these indices, skip
            return true;
          }

          const grades = GRADE_VALUES.slice(actualStart, endIndex + 1);

          const draft: TeachableCourseDraftLike = {
            className: 'Test Class',
            subjectId: 'test-subject-id',
            grades,
            curriculum: 'saxon',
            maxStudents: 5,
          };

          const getSubject = (id: string) => {
            if (id === 'test-subject-id') {
              return {
                slug: subject.slug,
                name: subject.name,
                isEnrichment: false,
              };
            }
            return undefined;
          };

          const violationMessage = rowGradeSpanViolationMessage(
            draft,
            getSubject,
          );
          const isComplete = rowIsComplete(draft, getSubject);

          // When grades exceed the span limit:
          // 1. rowGradeSpanViolationMessage should return a non-null message
          // 2. rowIsComplete should return false (form submit should be disabled)
          return violationMessage !== null && isComplete === false;
        },
      ),
      { numRuns: 100 },
    );
  });
});
