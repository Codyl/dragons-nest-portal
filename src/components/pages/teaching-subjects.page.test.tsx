// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as fc from 'fast-check';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Subject } from '@/api/services/subjects.services';
import type { TeachableCourseWithEnrollment } from '@/api/services/user.services';
import { HOMESCHOOL_CURRICULUM_OPTIONS } from '@/lib/homeschool-options';
import TeachingSubjectsPage from './teaching-subjects.page';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('@/hooks/use-logged-in-user');
vi.mock('@/hooks/use-subjects');
vi.mock('@/hooks/use-remove-teachable-course');

// Also mock the add-course hook used inside AddCourseSheet
vi.mock('@/hooks/use-add-teachable-course', () => ({
  default: () => ({
    mutate: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
    reset: vi.fn(),
  }),
}));

import useLoggedInUser from '@/hooks/use-logged-in-user';
import useSubjects from '@/hooks/use-subjects';
import useRemoveTeachableCourse from '@/hooks/use-remove-teachable-course';

const mockUseLoggedInUser = vi.mocked(useLoggedInUser);
const mockUseSubjects = vi.mocked(useSubjects);
const mockUseRemoveTeachableCourse = vi.mocked(useRemoveTeachableCourse);

// ---------------------------------------------------------------------------
// Arbitrary generators (shared with course-card.test.tsx pattern)
// ---------------------------------------------------------------------------

const GRADE_VALUES = [
  'pre_k',
  'k',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12',
];

const CURRICULUM_VALUES = HOMESCHOOL_CURRICULUM_OPTIONS.map((o) => o.value);

function arbitraryTeachableCourseWithEnrollment(
  opts: { minEnrollment?: number; maxEnrollment?: number } = {},
): fc.Arbitrary<TeachableCourseWithEnrollment> {
  const { minEnrollment = 0, maxEnrollment = 50 } = opts;
  return fc
    .record({
      className: fc
        .string({ minLength: 1, maxLength: 60 })
        .filter((s) => s.trim().length > 0),
      subjectId: fc.uuid(),
      matchesAllGrades: fc.boolean(),
      grades: fc.array(fc.constantFrom(...GRADE_VALUES), {
        minLength: 1,
        maxLength: 5,
      }),
      curriculum: fc.constantFrom(...CURRICULUM_VALUES),
      maxStudents: fc.integer({ min: 1, max: 20 }),
      activeEnrollmentCount: fc.integer({
        min: minEnrollment,
        max: maxEnrollment,
      }),
    })
    .map((c) => ({
      ...c,
      grades: c.matchesAllGrades ? [] : c.grades,
    }));
}

// ---------------------------------------------------------------------------
// Default mock setup helpers
// ---------------------------------------------------------------------------

function setupDefaultMocks(
  overrides: {
    isLoading?: boolean;
    isError?: boolean;
    error?: Error | null;
    courses?: TeachableCourseWithEnrollment[];
    subjects?: Subject[];
    removeMutate?: ReturnType<typeof vi.fn>;
    removeIsPending?: boolean;
  } = {},
) {
  const {
    isLoading = false,
    isError = false,
    error = null,
    courses = [],
    subjects = [],
    removeMutate = vi.fn(),
    removeIsPending = false,
  } = overrides;

  mockUseLoggedInUser.mockReturnValue({
    isLoading,
    isError,
    error: error as Error,
    data:
      isLoading || isError
        ? undefined
        : { message: 'ok', data: { teachableCourses: courses } },
    refetch: vi.fn(),
    isPending: isLoading,
    isFetching: isLoading,
    isSuccess: !isLoading && !isError,
    status: isLoading ? 'pending' : isError ? 'error' : 'success',
  } as unknown as ReturnType<typeof useLoggedInUser>);

  mockUseSubjects.mockReturnValue({
    isLoading: false,
    isError: false,
    error: null,
    data: subjects,
    refetch: vi.fn(),
    isPending: false,
    isFetching: false,
    isSuccess: true,
    status: 'success',
  } as unknown as ReturnType<typeof useSubjects>);

  mockUseRemoveTeachableCourse.mockReturnValue({
    mutate: removeMutate,
    isPending: removeIsPending,
    isError: false,
    isSuccess: false,
    error: null,
    reset: vi.fn(),
    mutateAsync: vi.fn(),
    data: undefined,
    variables: undefined,
    context: undefined,
    failureCount: 0,
    failureReason: null,
    isIdle: !removeIsPending,
    isPaused: false,
    status: removeIsPending ? 'pending' : 'idle',
    submittedAt: 0,
  } as ReturnType<typeof useRemoveTeachableCourse>);
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Unit tests — Task 15.1
// ---------------------------------------------------------------------------

describe('TeachingSubjectsPage', () => {
  it('shows loading skeleton while data is loading', () => {
    setupDefaultMocks({ isLoading: true });

    render(<TeachingSubjectsPage />);

    const skeleton = screen.getByLabelText('Loading courses');
    expect(skeleton).toBeDefined();
  });

  it('shows empty state when teachableCourses is empty', () => {
    setupDefaultMocks({ courses: [] });

    render(<TeachingSubjectsPage />);

    expect(screen.getByText(/no teaching subjects added yet/i)).toBeDefined();
  });

  it('shows error banner with retry when profile fetch fails', () => {
    setupDefaultMocks({
      isError: true,
      error: new Error('Network error'),
    });

    render(<TeachingSubjectsPage />);

    // Error message should be visible
    expect(screen.getByRole('alert')).toBeDefined();
    // Retry button should be present
    const retryBtn = screen.getByRole('button', { name: /retry/i });
    expect(retryBtn).toBeDefined();
  });

  it('renders one CourseCard per course in the list', () => {
    const courses: TeachableCourseWithEnrollment[] = [
      {
        className: 'Algebra I',
        subjectId: 'subj-1',
        matchesAllGrades: false,
        grades: ['9', '10'],
        curriculum: 'saxon',
        maxStudents: 8,
        activeEnrollmentCount: 0,
      },
      {
        className: 'Art Basics',
        subjectId: 'subj-2',
        matchesAllGrades: true,
        grades: [],
        curriculum: 'other',
        maxStudents: 12,
        activeEnrollmentCount: 2,
      },
      {
        className: 'Biology',
        subjectId: 'subj-3',
        matchesAllGrades: false,
        grades: ['10', '11'],
        curriculum: 'abeka',
        maxStudents: 6,
        activeEnrollmentCount: 0,
      },
    ];

    setupDefaultMocks({ courses });

    render(<TeachingSubjectsPage />);

    // Each course should have a Remove button
    const removeButtons = screen.getAllByRole('button', { name: /remove/i });
    expect(removeButtons.length).toBe(3);

    // Each className should appear
    expect(screen.getByText('Algebra I')).toBeDefined();
    expect(screen.getByText('Art Basics')).toBeDefined();
    expect(screen.getByText('Biology')).toBeDefined();
  });

  it('renders the Add Subject button', () => {
    setupDefaultMocks();

    render(<TeachingSubjectsPage />);

    const addBtn = screen.getByRole('button', { name: /add subject/i });
    expect(addBtn).toBeDefined();
  });

  it('opens RemoveConfirmDialog when Remove is clicked for a course with no active enrollments', async () => {
    const courses: TeachableCourseWithEnrollment[] = [
      {
        className: 'Algebra I',
        subjectId: 'subj-1',
        matchesAllGrades: false,
        grades: ['9'],
        curriculum: 'saxon',
        maxStudents: 5,
        activeEnrollmentCount: 0,
      },
    ];

    setupDefaultMocks({ courses });

    render(<TeachingSubjectsPage />);

    const removeBtn = screen.getByRole('button', { name: /remove/i });
    await userEvent.click(removeBtn);

    // RemoveConfirmDialog should be open — it shows "Are you sure"
    expect(
      screen.getByText(/are you sure you want to remove this course/i),
    ).toBeDefined();
  });

  it('opens RemoveWarningDialog when Remove is clicked for a course with active enrollments', async () => {
    const courses: TeachableCourseWithEnrollment[] = [
      {
        className: 'Art Basics',
        subjectId: 'subj-2',
        matchesAllGrades: true,
        grades: [],
        curriculum: 'other',
        maxStudents: 10,
        activeEnrollmentCount: 3,
      },
    ];

    setupDefaultMocks({ courses });

    render(<TeachingSubjectsPage />);

    const removeBtn = screen.getByRole('button', { name: /remove/i });
    await userEvent.click(removeBtn);

    // RemoveWarningDialog should be open — it mentions notifying parents
    expect(
      screen.getByText(/notify the parents of all affected enrolled students/i),
    ).toBeDefined();
  });

  it('does not show course list when loading', () => {
    setupDefaultMocks({ isLoading: true });

    render(<TeachingSubjectsPage />);

    // No Remove buttons should be visible during loading
    const removeButtons = screen.queryAllByRole('button', { name: /remove/i });
    expect(removeButtons.length).toBe(0);
  });

  it('does not show course list when there is an error', () => {
    setupDefaultMocks({ isError: true, error: new Error('Server error') });

    render(<TeachingSubjectsPage />);

    // No Remove buttons should be visible during error state
    const removeButtons = screen.queryAllByRole('button', { name: /remove/i });
    expect(removeButtons.length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Property 1: Course list renders all courses — Task 15.2
// Feature: manage-teachable-subjects, Property 1: Course list renders all courses
// Validates: Requirements 2.1
// ---------------------------------------------------------------------------

describe('Property 1: Course list renders all courses', () => {
  it('rendered output contains exactly courses.length course cards with no omissions or duplicates', () => {
    // Feature: manage-teachable-subjects, Property 1: Course list renders all courses
    // Validates: Requirements 2.1
    fc.assert(
      fc.property(
        fc.array(arbitraryTeachableCourseWithEnrollment(), {
          minLength: 1,
          maxLength: 20,
        }),
        (courses) => {
          setupDefaultMocks({ courses });

          const { unmount, container } = render(<TeachingSubjectsPage />);

          // Count Remove buttons — one per CourseCard
          const removeButtons = Array.from(
            container.querySelectorAll('button'),
          ).filter((btn) => /remove/i.test(btn.textContent ?? ''));

          const result = removeButtons.length === courses.length;

          unmount();
          vi.clearAllMocks();

          return result;
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 7: Warning dialog shown for courses with active enrollments — Task 15.3
// Feature: manage-teachable-subjects, Property 7: Warning dialog is shown for courses with active enrollments
// Validates: Requirements 5.1, 8.3
// ---------------------------------------------------------------------------

describe('Property 7: Warning dialog is shown for courses with active enrollments', () => {
  it(
    'clicking Remove opens RemoveWarningDialog (not RemoveConfirmDialog) for courses with activeEnrollmentCount > 0',
    { timeout: 30000 },
    () => {
      // Feature: manage-teachable-subjects, Property 7: Warning dialog is shown for courses with active enrollments
      // Validates: Requirements 5.1, 8.3
      fc.assert(
        fc.property(
          arbitraryTeachableCourseWithEnrollment({
            minEnrollment: 1,
            maxEnrollment: 50,
          }),
          (course) => {
            setupDefaultMocks({ courses: [course] });

            const { unmount } = render(<TeachingSubjectsPage />);

            // Find and click the Remove button
            const removeButtons = screen
              .getAllByRole('button')
              .filter((btn) => /remove/i.test(btn.textContent ?? ''));

            if (removeButtons.length === 0) {
              unmount();
              vi.clearAllMocks();
              return false;
            }

            // Use fireEvent for synchronous click in property test
            fireEvent.click(removeButtons[0]);

            // RemoveWarningDialog should be open (mentions notifying parents)
            const warningText = document.body.textContent ?? '';
            const warningDialogOpen =
              warningText.includes('notify the parents') ||
              warningText.includes('no longer available');

            // RemoveConfirmDialog should NOT be open (its text is "Are you sure")
            const confirmDialogOpen = warningText.includes(
              'Are you sure you want to remove this course',
            );

            unmount();
            vi.clearAllMocks();

            return warningDialogOpen && !confirmDialogOpen;
          },
        ),
        { numRuns: 100 },
      );
    },
  );
});
