// @vitest-environment jsdom
import type { ReactElement } from 'react';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import AddStudentSheet from './add-student-sheet';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function renderWithQuery(ui: ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>,
  );
}

describe('AddStudentSheet', () => {
  it('submit is disabled when fields empty', () => {
    renderWithQuery(<AddStudentSheet open={true} onOpenChange={vi.fn()} />);
    const submit = screen.getByTestId(
      'add-student-submit',
    ) as HTMLButtonElement;
    expect(submit.disabled).toBe(true);
  });

  it('submit stays disabled when display name exceeds 100 characters', () => {
    renderWithQuery(<AddStudentSheet open={true} onOpenChange={vi.fn()} />);
    fireEvent.change(screen.getByTestId('add-student-display-name'), {
      target: { value: 'x'.repeat(101) },
    });
    const submit = screen.getByTestId(
      'add-student-submit',
    ) as HTMLButtonElement;
    expect(submit.disabled).toBe(true);
  });
});
