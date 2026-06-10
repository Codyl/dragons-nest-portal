// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import RemoveConfirmDialog from './remove-confirm-dialog';

afterEach(() => {
  cleanup();
});

describe('RemoveConfirmDialog', () => {
  it('renders the dialog with title when open', () => {
    render(
      <RemoveConfirmDialog
        open={true}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        isPending={false}
      />,
    );
    expect(screen.getByText(/remove course/i)).toBeDefined();
  });

  it('calls onConfirm when the Remove button is clicked', async () => {
    const onConfirm = vi.fn();
    render(
      <RemoveConfirmDialog
        open={true}
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
      <RemoveConfirmDialog
        open={true}
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
      <RemoveConfirmDialog
        open={true}
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
      <RemoveConfirmDialog
        open={true}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        isPending={false}
      />,
    );
    const removeBtn = screen.getByRole('button', { name: /^remove$/i });
    expect((removeBtn as HTMLButtonElement).disabled).toBe(false);
  });

  it('Cancel button is disabled when isPending=true', () => {
    render(
      <RemoveConfirmDialog
        open={true}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        isPending={true}
      />,
    );
    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    expect((cancelBtn as HTMLButtonElement).disabled).toBe(true);
  });

  it('does not render dialog content when open=false', () => {
    render(
      <RemoveConfirmDialog
        open={false}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        isPending={false}
      />,
    );
    expect(screen.queryByText(/remove course/i)).toBeNull();
  });
});
