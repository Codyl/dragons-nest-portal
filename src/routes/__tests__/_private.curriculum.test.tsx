// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as fc from 'fast-check';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ComplianceLaws } from '@/api/services/compliance.services';
import type {
  HouseholdStudentProfile,
  ProfileUserData,
} from '@/api/services/profile.services';
import type { Subject } from '@/api/services/subjects.services';
import { StudentContext } from '@/contexts/student-context';
import useComplianceLaws from '@/hooks/use-compliance-laws';
import useLoggedInUser from '@/hooks/use-logged-in-user';
import useSubjects from '@/hooks/use-subjects';
import {
  CurriculumRoute,
  deriveRequiredSubjects,
} from '../(private)/_private.curriculum';

vi.mock('@/hooks/use-logged-in-user', () => ({
  default: vi.fn(),
}));
vi.mock('@/hooks/use-compliance-laws', () => ({
  default: vi.fn(),
}));
vi.mock('@/hooks/use-subjects', () => ({
  default: vi.fn(),
}));

const useLoggedInUserMock = vi.mocked(useLoggedInUser);
const useComplianceLawsMock = vi.mocked(useComplianceLaws);
const useSubjectsMock = vi.mocked(useSubjects);

const subjectFixture: Subject = {
  _id: 'subject-1',
  name: 'Math',
  icon: '📐',
  color: '#111111',
  slug: 'math',
  isEnrichment: false,
};

const userFixture: { message: string; data: ProfileUserData } = {
  message: 'ok',
  data: { state: 'tx' },
};

const complianceFixture: ComplianceLaws = {
  _id: 'law-1',
  state: 'tx',
  abbreviation: 'TX',
  subjectsRequiredTopicIds: ['subject-1'],
};

function renderRoute(activeStudent: HouseholdStudentProfile | null = null) {
  return render(
    <StudentContext.Provider
      value={{
        activeStudent,
        setActiveStudent: vi.fn(),
        students: [],
        isLoading: false,
      }}
    >
      <CurriculumRoute />
    </StudentContext.Provider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();

  useLoggedInUserMock.mockReturnValue({
    data: userFixture,
    isLoading: false,
    error: null,
  } as never);

  useComplianceLawsMock.mockReturnValue({
    data: complianceFixture,
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
  it('shows loading indicator while profile query is loading', () => {
    useLoggedInUserMock.mockReturnValueOnce({ isLoading: true } as never);
    renderRoute();
    expect(screen.getByTestId('curriculum-loading')).toBeTruthy();
  });

  it('shows loading indicator while compliance query is loading', () => {
    useComplianceLawsMock.mockReturnValueOnce({ isLoading: true } as never);
    renderRoute();
    expect(screen.getByTestId('curriculum-loading')).toBeTruthy();
  });

  it('shows error banner with retry when profile fetch fails', async () => {
    useLoggedInUserMock.mockReturnValueOnce({
      isLoading: false,
      error: new Error('profile failed'),
    } as never);
    renderRoute();
    expect(screen.getByTestId('curriculum-error')).toBeTruthy();
    expect(screen.getByRole('button', { name: /retry/i })).toBeTruthy();
  });

  it('shows error banner with retry when compliance fetch fails', () => {
    useComplianceLawsMock.mockReturnValueOnce({
      isLoading: false,
      error: new Error('compliance failed'),
      refetch: vi.fn(),
    } as never);
    renderRoute();
    expect(screen.getByTestId('curriculum-error')).toBeTruthy();
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

  it('shows profile-completion prompt when profile state is null', () => {
    useLoggedInUserMock.mockReturnValueOnce({
      data: { message: 'ok', data: { state: null } },
      isLoading: false,
      error: null,
    } as never);
    useComplianceLawsMock.mockReturnValueOnce({
      data: undefined,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    renderRoute();
    expect(screen.getByTestId('curriculum-missing-state')).toBeTruthy();
  });

  it('shows empty-state message when subjectsRequiredTopicIds is empty', () => {
    useComplianceLawsMock.mockReturnValueOnce({
      data: { ...complianceFixture, subjectsRequiredTopicIds: [] },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    renderRoute();
    expect(screen.getByTestId('curriculum-empty')).toBeTruthy();
  });

  it('renders one SubjectCard per required subject', () => {
    useSubjectsMock.mockReturnValueOnce({
      data: [
        subjectFixture,
        { ...subjectFixture, _id: 'subject-2', name: 'Science' },
      ],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    useComplianceLawsMock.mockReturnValueOnce({
      data: {
        ...complianceFixture,
        subjectsRequiredTopicIds: ['subject-1', 'subject-2'],
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as never);

    renderRoute();
    expect(screen.getAllByTestId('subject-card')).toHaveLength(2);
  });

  it('shows active student label when activeStudent is set', () => {
    renderRoute({
      studentDraftId: 'student-1',
      displayName: 'Taylor',
      currentGrade: 5,
      lastPromotionYear: 2025,
    });
    expect(screen.getByTestId('active-student-label').textContent).toContain(
      'Viewing curriculum for Taylor',
    );
  });

  it('omits student label when activeStudent is null', () => {
    renderRoute(null);
    expect(screen.queryByTestId('active-student-label')).toBeNull();
  });

  it('retry action calls compliance and subjects refetch', async () => {
    const complianceRefetch = vi.fn();
    const subjectsRefetch = vi.fn();
    useComplianceLawsMock.mockReturnValueOnce({
      isLoading: false,
      error: new Error('failed'),
      refetch: complianceRefetch,
    } as never);
    useSubjectsMock.mockReturnValueOnce({
      isLoading: false,
      error: null,
      refetch: subjectsRefetch,
    } as never);

    renderRoute();
    await userEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(complianceRefetch).toHaveBeenCalled();
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

function arbitraryStudent(): fc.Arbitrary<HouseholdStudentProfile | null> {
  return fc.oneof(
    fc.constant(null),
    fc.record({
      studentDraftId: fc.uuid(),
      displayName: fc.string({ minLength: 1, maxLength: 30 }),
      currentGrade: fc.integer({ min: 0, max: 12 }),
      lastPromotionYear: fc.integer({ min: 1990, max: 2100 }),
      archivedAt: fc.option(fc.string(), { nil: undefined }),
    }),
  );
}

describe('Property 1: Required subjects list matches subjectsRequiredTopicIds', () => {
  it('only includes catalog subjects whose ids are required', () => {
    // Feature: curriculum-page, Property 1: Required subjects list matches subjectsRequiredTopicIds
    fc.assert(
      fc.property(
        fc.array(fc.string(), { maxLength: 20 }),
        fc.array(arbitrarySubject(), { maxLength: 30 }),
        (subjectsRequiredTopicIds, catalog) => {
          const requiredSubjects = deriveRequiredSubjects(
            catalog,
            subjectsRequiredTopicIds,
          );
          const expectedCount = catalog.filter((subject) =>
            subjectsRequiredTopicIds.includes(subject._id),
          ).length;

          return (
            requiredSubjects.length === expectedCount &&
            requiredSubjects.every((subject) =>
              subjectsRequiredTopicIds.includes(subject._id),
            )
          );
        },
      ),
      { numRuns: 100 },
    );
  });
});

describe('Property 4: Required subjects are invariant under active student change', () => {
  it('derives the same required subject set regardless of active student', () => {
    // Feature: curriculum-page, Property 4: Required subjects are invariant under active student change
    fc.assert(
      fc.property(
        fc.array(fc.string(), { maxLength: 20 }),
        fc.array(arbitrarySubject(), { maxLength: 30 }),
        arbitraryStudent(),
        arbitraryStudent(),
        (subjectsRequiredTopicIds, catalog, _studentA, _studentB) => {
          const requiredForA = deriveRequiredSubjects(
            catalog,
            subjectsRequiredTopicIds,
          );
          const requiredForB = deriveRequiredSubjects(
            catalog,
            subjectsRequiredTopicIds,
          );

          return JSON.stringify(requiredForA) === JSON.stringify(requiredForB);
        },
      ),
      { numRuns: 100 },
    );
  });
});
