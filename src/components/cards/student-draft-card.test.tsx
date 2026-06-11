// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import StudentDraftCard from './student-draft-card';

afterEach(() => {
  cleanup();
});

describe('StudentDraftCard', () => {
  it('renders display name, grade label, and promotion year', () => {
    render(
      <StudentDraftCard
        draft={{
          studentId: 'a',
          displayName: 'Taylor',
          currentGrade: 5,
          lastPromotionYear: 2025,
        }}
        onArchive={vi.fn()}
      />,
    );
    expect(screen.getByText('Taylor')).toBeTruthy();
    expect(screen.getByText('5th Grade')).toBeTruthy();
    expect(screen.getByText('2025')).toBeTruthy();
  });

  it('active draft shows Archive, not Restore', () => {
    render(
      <StudentDraftCard
        draft={{
          studentId: 'a',
          displayName: 'Taylor',
          currentGrade: 5,
          lastPromotionYear: 2025,
        }}
        onArchive={vi.fn()}
      />,
    );
    expect(screen.getByTestId('student-draft-archive')).toBeTruthy();
    expect(screen.queryByTestId('student-draft-restore')).toBeNull();
  });

  it('archived draft shows Restore, not Archive', () => {
    render(
      <StudentDraftCard
        draft={{
          studentId: 'a',
          displayName: 'Taylor',
          currentGrade: 5,
          lastPromotionYear: 2025,
          archivedAt: '2024-06-01T00:00:00.000Z',
        }}
        onRestore={vi.fn()}
      />,
    );
    expect(screen.getByTestId('student-draft-restore')).toBeTruthy();
    expect(screen.queryByTestId('student-draft-archive')).toBeNull();
  });

  it('disables Archive when isArchiving', () => {
    render(
      <StudentDraftCard
        draft={{
          studentId: 'a',
          displayName: 'Taylor',
          currentGrade: 5,
          lastPromotionYear: 2025,
        }}
        onArchive={vi.fn()}
        isArchiving
      />,
    );
    const archiveBtn = screen.getByTestId(
      'student-draft-archive',
    ) as HTMLButtonElement;
    expect(archiveBtn.disabled).toBe(true);
  });

  it('disables Restore when isRestoring', () => {
    render(
      <StudentDraftCard
        draft={{
          studentId: 'a',
          displayName: 'Taylor',
          currentGrade: 5,
          lastPromotionYear: 2025,
          archivedAt: '2024-06-01T00:00:00.000Z',
        }}
        onRestore={vi.fn()}
        isRestoring
      />,
    );
    const restoreBtn = screen.getByTestId(
      'student-draft-restore',
    ) as HTMLButtonElement;
    expect(restoreBtn.disabled).toBe(true);
  });

  it('calls onArchive with student id', async () => {
    const onArchive = vi.fn();
    render(
      <StudentDraftCard
        draft={{
          studentId: 'sid-1',
          displayName: 'Taylor',
          currentGrade: 5,
          lastPromotionYear: 2025,
        }}
        onArchive={onArchive}
      />,
    );
    await userEvent.click(screen.getByTestId('student-draft-archive'));
    expect(onArchive).toHaveBeenCalledWith('sid-1');
  });
});
