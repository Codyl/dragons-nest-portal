// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as fc from 'fast-check';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { HouseholdStudentDraftAll } from '@/api/services/profile.services';
import ChildAccountsPage from './child-accounts.page';

vi.mock('@/hooks/use-logged-in-user');
vi.mock('@/hooks/use-archive-household-student');
vi.mock('@/hooks/use-restore-household-student');
vi.mock('@/hooks/use-add-household-student', () => ({
  default: () => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    reset: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
  }),
}));

import useLoggedInUser from '@/hooks/use-logged-in-user';
import useArchiveHouseholdStudent from '@/hooks/use-archive-household-student';
import useRestoreHouseholdStudent from '@/hooks/use-restore-household-student';

const mockUseLoggedInUser = vi.mocked(useLoggedInUser);
const mockArchive = vi.mocked(useArchiveHouseholdStudent);
const mockRestore = vi.mocked(useRestoreHouseholdStudent);

function setupMocks(
  overrides: {
    isLoading?: boolean;
    isError?: boolean;
    error?: Error | null;
    drafts?: HouseholdStudentDraftAll[];
    archiveMutate?: ReturnType<typeof vi.fn>;
    archivePending?: boolean;
    archiveVariables?: string;
    restoreMutate?: ReturnType<typeof vi.fn>;
    restorePending?: boolean;
    restoreVariables?: string;
  } = {},
) {
  const {
    isLoading = false,
    isError = false,
    error = null,
    drafts = [],
    archiveMutate = vi.fn(),
    archivePending = false,
    archiveVariables,
    restoreMutate = vi.fn(),
    restorePending = false,
    restoreVariables,
  } = overrides;

  mockUseLoggedInUser.mockReturnValue({
    isLoading,
    isError,
    error: error as Error,
    data:
      isLoading || isError
        ? undefined
        : { message: 'ok', data: { householdStudentDraftsAll: drafts } },
    refetch: vi.fn(),
    isPending: isLoading,
    isFetching: isLoading,
    isSuccess: !isLoading && !isError,
    status: isLoading ? 'pending' : isError ? 'error' : 'success',
  } as unknown as ReturnType<typeof useLoggedInUser>);

  mockArchive.mockReturnValue({
    mutate: archiveMutate,
    isPending: archivePending,
    variables: archiveVariables,
    isError: false,
    isSuccess: false,
    error: null,
    reset: vi.fn(),
    mutateAsync: vi.fn(),
    status: archivePending ? 'pending' : 'idle',
  } as unknown as ReturnType<typeof useArchiveHouseholdStudent>);

  mockRestore.mockReturnValue({
    mutate: restoreMutate,
    isPending: restorePending,
    variables: restoreVariables,
    isError: false,
    isSuccess: false,
    error: null,
    reset: vi.fn(),
    mutateAsync: vi.fn(),
    status: restorePending ? 'pending' : 'idle',
  } as unknown as ReturnType<typeof useRestoreHouseholdStudent>);
}

function arbitraryDraft(): fc.Arbitrary<HouseholdStudentDraftAll> {
  return fc.tuple(fc.uuid(), fc.boolean()).chain(([id, archived]) =>
    fc.record({
      studentDraftId: fc.constant(id),
      displayName: fc.string({ minLength: 1, maxLength: 40 }),
      currentGrade: fc.integer({ min: 0, max: 13 }),
      lastPromotionYear: fc.integer({ min: 2020, max: 2030 }),
      archivedAt: archived
        ? fc
          .integer({
            min: Date.UTC(2020, 0, 1),
            max: Date.UTC(2030, 0, 1),
          })
          .map((ms) => new Date(ms).toISOString())
        : fc.constant(null as string | null),
    }),
  );
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('ChildAccountsPage', () => {
  it('shows loading skeleton while data is loading', () => {
    setupMocks({ isLoading: true });
    render(<ChildAccountsPage />);
    expect(screen.getByLabelText('Loading students')).toBeTruthy();
  });

  it('shows empty state when no active drafts', () => {
    setupMocks({ drafts: [] });
    render(<ChildAccountsPage />);
    expect(screen.getByText(/no students added yet/i)).toBeTruthy();
  });

  it('shows error banner with retry when profile fetch fails', () => {
    setupMocks({ isError: true, error: new Error('boom') });
    render(<ChildAccountsPage />);
    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.getByRole('button', { name: /retry/i })).toBeTruthy();
  });

  it('renders one student card per active draft', () => {
    setupMocks({
      drafts: [
        {
          studentDraftId: 'a',
          displayName: 'One',
          currentGrade: 1,
          lastPromotionYear: 2025,
        },
        {
          studentDraftId: 'b',
          displayName: 'Two',
          currentGrade: 2,
          lastPromotionYear: 2025,
        },
      ],
    });
    render(<ChildAccountsPage />);
    expect(screen.getAllByTestId('student-draft-card')).toHaveLength(2);
  });

  it('hides archived section when no archived drafts', () => {
    setupMocks({
      drafts: [
        {
          studentDraftId: 'a',
          displayName: 'One',
          currentGrade: 1,
          lastPromotionYear: 2025,
        },
      ],
    });
    render(<ChildAccountsPage />);
    expect(screen.queryByText(/archived students/i)).toBeNull();
  });

  it('shows archived section when archived drafts exist', () => {
    setupMocks({
      drafts: [
        {
          studentDraftId: 'a',
          displayName: 'Active',
          currentGrade: 1,
          lastPromotionYear: 2025,
        },
        {
          studentDraftId: 'b',
          displayName: 'Gone',
          currentGrade: 2,
          lastPromotionYear: 2024,
          archivedAt: '2024-01-01T00:00:00.000Z',
        },
      ],
    });
    render(<ChildAccountsPage />);
    expect(screen.getByText(/archived students/i)).toBeTruthy();
    expect(screen.getAllByTestId('student-draft-card')).toHaveLength(2);
  });
});

// Feature: child-accounts-settings, Property 1: Student list renders all drafts
describe('Property 1: Student list renders all drafts', () => {
  it('renders exactly one card per draft across active and archived sections', () => {
    fc.assert(
      fc.property(
        fc.array(arbitraryDraft(), { minLength: 1, maxLength: 15 }),
        (drafts) => {
          setupMocks({ drafts });

          const { unmount, container } = render(<ChildAccountsPage />);

          const cards = container.querySelectorAll(
            '[data-testid="student-draft-card"]',
          );
          const ok = cards.length === drafts.length;

          unmount();
          vi.clearAllMocks();

          return ok;
        },
      ),
      { numRuns: 100 },
    );
  });
});

// Feature: child-accounts-settings, Property 2: Active/archived split
describe('Property 2: Active/archived split', () => {
  it('active cards match non-archived count; archived section matches archived count', () => {
    fc.assert(
      fc.property(
        fc.array(arbitraryDraft(), { minLength: 0, maxLength: 12 }),
        (drafts) => {
          setupMocks({ drafts });

          const { unmount, container } = render(<ChildAccountsPage />);

          const activeCount = drafts.filter((d) => !d.archivedAt).length;
          const archivedCount = drafts.filter((d) => Boolean(d.archivedAt)).length;

          const activeSection = container
            .querySelector('#active-students-heading')
            ?.closest('section');
          const archivedSection = container
            .querySelector('#archived-students-heading')
            ?.closest('section');

          const activeCards = activeSection?.querySelectorAll(
            '[data-testid="student-draft-card"]',
          );
          const archivedCards = archivedSection?.querySelectorAll(
            '[data-testid="student-draft-card"]',
          );

          const ok =
            (activeCards?.length ?? 0) === activeCount &&
            (archivedCount === 0
              ? archivedSection == null
              : (archivedCards?.length ?? 0) === archivedCount);

          unmount();
          vi.clearAllMocks();

          return ok;
        },
      ),
      { numRuns: 100 },
    );
  });
});

describe('ChildAccountsPage archive flow', () => {
  it('opens archive confirmation when Archive is clicked', async () => {
    const archiveMutate = vi.fn();
    setupMocks({
      drafts: [
        {
          studentDraftId: 'x1',
          displayName: 'Kid',
          currentGrade: 3,
          lastPromotionYear: 2025,
        },
      ],
      archiveMutate,
    });

    render(<ChildAccountsPage />);

    await userEvent.click(screen.getByTestId('student-draft-archive'));

    expect(
      screen.getByText(/archive this student/i),
    ).toBeTruthy();

    const dialog = screen.getByRole('dialog');
    fireEvent.click(
      within(dialog).getByRole('button', { name: /^archive$/i }),
    );

    expect(archiveMutate).toHaveBeenCalled();
  });
});
