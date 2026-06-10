// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as fc from 'fast-check';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type {
  HouseholdStudentProfile,
  StudentEnrolledClass,
} from '@/api/services/profile.services';
import type { Subject } from '@/api/services/subjects.services';
import { StudentContext } from '@/contexts/student-context';
import useStudentClasses from '@/hooks/use-student-classes';
import useSubjects from '@/hooks/use-subjects';
import {
  CurriculumRoute,
  resolveEnrolledSubjects,
} from '../(private)/_private.curriculum';

vi.mock('@/hooks/use-student-classes', () => ({
  default: vi.fn(),
}));
vi.mock('@/hooks/use-subjects', () => ({
  default: vi.fn(),
}));

const useStudentClassesMock = vi.mocked(useStudentClasses);
const useSubjectsMock = vi.mocked(useSubjects);

const subjectFixture: Subject = {
  _id: 'subject-1',
  name: 'Math',
  icon: '📐',
  color: '#111111',
  slug: 'math',
  isEnrichment: false,
};

const classesFixture: StudentEnrolledClass[] = [
  { subjectId: 'subject-1', curriculumId: null, hoursCompleted: 0, createdAt: null },
];

const activeStudentFixture: HouseholdStudentProfile = {
  studentId: 'student-1',
  displayName: 'Taylor',
  currentGrade: 5,
  lastPromotionYear: 2025,
};

function renderRoute(activeStudent: HouseholdStudentProfile | null = activeStudentFixture) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <StudentContext.Provider
        value={{
          activeStudent,
          setActiveStudent: vi.fn(),
          students: [],
          isLoading: false,
        }}
      >
        <CurriculumRoute />
      </StudentContext.Provider>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();

  useStudentClassesMock.mockReturnValue({
    data: { message: 'ok', data: classesFixture },
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  } as never);

  useSubjectsMock.mockReturnValue({
    data: [subjectFixture],
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  } as never);
});

afterEach(() => {
  cleanup();
});

describe('CurriculumRoute', () => {
  it('shows no-student message when no active student is selected', () => {
    renderRoute(null);
    expect(screen.getByTestId('curriculum-no-student')).toBeTruthy();
  });

  it('shows loading indicator while classes query is loading', () => {
    useStudentClassesMock.mockReturnValueOnce({
      isLoading: true,
      error: null,
    } as never);
    renderRoute();
    expect(screen.getByTestId('curriculum-loading')).toBeTruthy();
  });

  it('shows loading indicator while subjects query is loading', () => {
    useSubjectsMock.mockReturnValueOnce({
      isLoading: true,
      error: null,
    } as never);
    renderRoute();
    expect(screen.getByTestId('curriculum-loading')).toBeTruthy();
  });

  it('shows error banner with retry when classes fetch fails', () => {
    useStudentClassesMock.mockReturnValueOnce({
      isLoading: false,
      error: new Error('classes failed'),
      refetch: vi.fn(),
    } as never);
    renderRoute();
    expect(screen.getByTestId('curriculum-error')).toBeTruthy();
    expect(screen.getByRole('button', { name: /retry/i })).toBeTruthy();
  });

  it('shows error banner with retry when subjects fetch fails', () => {
    useSubjectsMock.mockReturnValueOnce({
      isLoading: false,
      error: new Error('subjects failed'),
      refetch: vi.fn(),
    } as never);
    renderRoute();
    expect(screen.getByTestId('curriculum-error')).toBeTruthy();
  });

  it('shows empty-state message when student has no classes', () => {
    useStudentClassesMock.mockReturnValueOnce({
      data: { message: 'ok', data: [] },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    renderRoute();
    expect(screen.getByTestId('curriculum-empty')).toBeTruthy();
  });

  it('renders one SubjectCard per enrolled subject', () => {
    useSubjectsMock.mockReturnValueOnce({
      data: [
        subjectFixture,
        { ...subjectFixture, _id: 'subject-2', name: 'Science' },
      ],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    useStudentClassesMock.mockReturnValueOnce({
      data: {
        message: 'ok',
        data: [
          { subjectId: 'subject-1', curriculumId: null, hoursCompleted: 0, createdAt: null },
          { subjectId: 'subject-2', curriculumId: null, hoursCompleted: 0, createdAt: null },
        ],
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as never);

    renderRoute();
    expect(screen.getAllByTestId('subject-card')).toHaveLength(2);
  });

  it('shows active student label when activeStudent is set', () => {
    renderRoute(activeStudentFixture);
    expect(screen.getByTestId('active-student-label').textContent).toContain(
      'Viewing curriculum for Taylor',
    );
  });

  it('omits student label when activeStudent is null', () => {
    renderRoute(null);
    expect(screen.queryByTestId('active-student-label')).toBeNull();
  });

  it('retry action calls classes and subjects refetch', async () => {
    const classesRefetch = vi.fn();
    const subjectsRefetch = vi.fn();
    useStudentClassesMock.mockReturnValueOnce({
      isLoading: false,
      error: new Error('failed'),
      refetch: classesRefetch,
    } as never);
    useSubjectsMock.mockReturnValueOnce({
      isLoading: false,
      error: null,
      refetch: subjectsRefetch,
    } as never);

    renderRoute();
    await userEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(classesRefetch).toHaveBeenCalled();
    expect(subjectsRefetch).toHaveBeenCalled();
  });
});

function arbitrarySubject(): fc.Arbitrary<Subject> {
  return fc.record({
    _id: fc.string({ minLength: 1, maxLength: 20 }),
    name: fc.string({ minLength: 1, maxLength: 40 }),
    icon: fc.string({ minLength: 1, maxLength: 6 }),
    color: fc
      .tuple(
        fc.integer({ min: 0, max: 255 }),
        fc.integer({ min: 0, max: 255 }),
        fc.integer({ min: 0, max: 255 }),
      )
      .map(([r, g, b]) => `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`),
    slug: fc.string({ minLength: 1, maxLength: 20 }),
    isEnrichment: fc.boolean(),
  });
}

function arbitraryEnrolledClass(): fc.Arbitrary<StudentEnrolledClass> {
  return fc.record({
    subjectId: fc.oneof(fc.string({ minLength: 1, maxLength: 20 }), fc.constant(null)),
    curriculumId: fc.oneof(fc.string({ minLength: 1, maxLength: 24 }), fc.constant(null)),
    hoursCompleted: fc.nat({ max: 1000 }),
    createdAt: fc.oneof(fc.date().map((d) => d.toISOString()), fc.constant(null)),
  });
}

describe('Property 1: Enrolled subjects list matches addedClasses subjectIds', () => {
  it('only includes catalog subjects whose ids appear in addedClasses', () => {
    // Feature: curriculum-page, Property 1: Enrolled subjects list matches addedClasses subjectIds
    fc.assert(
      fc.property(
        fc.array(arbitraryEnrolledClass(), { maxLength: 20 }),
        fc.array(arbitrarySubject(), { maxLength: 30 }),
        (enrolledClasses, catalog) => {
          const enrolledSubjects = resolveEnrolledSubjects(catalog, enrolledClasses);
          const enrolledSubjectIds = new Set(
            enrolledClasses
              .map((c) => c.subjectId)
              .filter((id): id is string => id !== null),
          );
          const expectedCount = catalog.filter((subject) =>
            enrolledSubjectIds.has(subject._id),
          ).length;

          return (
            enrolledSubjects.length === expectedCount &&
            enrolledSubjects.every((subject) =>
              enrolledSubjectIds.has(subject._id),
            )
          );
        },
      ),
      { numRuns: 100 },
    );
  });
});
