// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as fc from 'fast-check';
import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import RemoveWarningDialog from './remove-warning-dialog';

afterEach(() => {
  cleanup();
});

describe('RemoveWarningDialog', () => {
  it('displays enrollment count in dialog text', () => {
    render(
      <RemoveWarningDialog
        open={true}
        enrollmentCount={5}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        isPending={false}
      />,
    );
    expect(screen.getByText(/5/)).toBeDefined();
  });

  it('renders notification warning text about parents being notified', () => {
    render(
      <RemoveWarningDialog
        open={true}
        enrollmentCount={3}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        isPending={false}
      />,
    );
    expect(
      screen.getByText(/notify the parents of all affected enrolled managedusers/i),
    ).toBeDefined();
    expect(screen.getByText(/no longer available/i)).toBeDefined();
  });

  it('calls onConfirm when the Remove button is clicked', async () => {
    const onConfirm = vi.fn();
    render(
      <RemoveWarningDialog
        open={true}
        enrollmentCount={2}
        onConfirm={onConfirm}
        onCancel={vi.fn()}
        isPending={false}
      />,
    );
    const removeBtn = screen.getByRole('button', { name: /^remove$/i });
    await userEvent.click(removeBtn);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when the Cancel button is clicked', async () => {
    const onCancel = vi.fn();
    render(
      <RemoveWarningDialog
        open={true}
        enrollmentCount={2}
        onConfirm={vi.fn()}
        onCancel={onCancel}
        isPending={false}
      />,
    );
    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    await userEvent.click(cancelBtn);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('Remove button is disabled when isPending=true', () => {
    render(
      <RemoveWarningDialog
        open={true}
        enrollmentCount={1}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        isPending={true}
      />,
    );
    const removeBtn = screen.getByRole('button', { name: /^remove$/i });
    expect((removeBtn as HTMLButtonElement).disabled).toBe(true);
  });

  it('Remove button is enabled when isPending=false', () => {
    render(
      <RemoveWarningDialog
        open={true}
        enrollmentCount={1}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        isPending={false}
      />,
    );
    const removeBtn = screen.getByRole('button', { name: /^remove$/i });
    expect((removeBtn as HTMLButtonElement).disabled).toBe(false);
  });
});

// Feature: manage-teachable-subjects, Property 8: Warning dialog displays the correct enrollment count
// Validates: Requirements 5.3
describe('Property 8: Warning dialog displays the correct enrollment count', () => {
  it('dialog text contains the exact enrollment count for any valid count', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 100 }), (enrollmentCount) => {
        cleanup();
        render(
          <RemoveWarningDialog
            open={true}
            enrollmentCount={enrollmentCount}
            onConfirm={vi.fn()}
            onCancel={vi.fn()}
            isPending={false}
          />,
        );
        const countText = screen.getByText(new RegExp(String(enrollmentCount)));
        expect(countText).toBeDefined();
        cleanup();
      }),
      { numRuns: 100 },
    );
  });
});
