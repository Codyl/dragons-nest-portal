// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vite-plus/test';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import SubjectCard from './subject-card';

afterEach(() => {
  cleanup();
});

function renderWithRouter(ui: React.ReactElement) {
  const rootRoute = createRootRoute({
    component: () => ui,
  });
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
  });
  const curriculumRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/curriculum/$subjectId',
  });
  const routeTree = rootRoute.addChildren([indexRoute, curriculumRoute]);
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });
  return render(<RouterProvider router={router} />);
}

describe('SubjectCard', () => {
  it('renders subject name', async () => {
    renderWithRouter(
      <SubjectCard
        subjectId="subject-1"
        subjectName="Language Arts"
        mascotUrl="https://example.com/mascot.png"
        teacherName="Jane Doe"
      />,
    );
    await waitFor(() => {
      expect(screen.getByText('Language Arts')).toBeTruthy();
    });
  });

  it('renders teacher name', async () => {
    renderWithRouter(
      <SubjectCard
        subjectId="subject-1"
        subjectName="Language Arts"
        mascotUrl="https://example.com/mascot.png"
        teacherName="Jane Doe"
      />,
    );
    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeTruthy();
    });
  });

  it('renders mascot image with correct src and alt', async () => {
    renderWithRouter(
      <SubjectCard
        subjectId="subject-1"
        subjectName="Language Arts"
        mascotUrl="https://example.com/mascot.png"
        teacherName="Jane Doe"
      />,
    );
    await waitFor(() => {
      const img = screen.getByRole('img');
      expect(img.getAttribute('src')).toBe('https://example.com/mascot.png');
      expect(img.getAttribute('alt')).toBe('Language Arts mascot');
    });
  });

  it('renders placeholder when mascot is undefined', async () => {
    renderWithRouter(
      <SubjectCard
        subjectId="subject-1"
        subjectName="Language Arts"
        teacherName="Jane Doe"
      />,
    );
    await waitFor(() => {
      expect(screen.getByText('Language Arts')).toBeTruthy();
    });
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('does not render Add, Remove, or Edit controls', async () => {
    renderWithRouter(
      <SubjectCard
        subjectId="subject-1"
        subjectName="Language Arts"
        mascotUrl="https://example.com/mascot.png"
        teacherName="Jane Doe"
      />,
    );
    await waitFor(() => {
      expect(screen.getByText('Language Arts')).toBeTruthy();
    });
    expect(screen.queryByRole('button', { name: /add/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /remove/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /edit/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /configure/i })).toBeNull();
  });

  it('renders as a link to /curriculum/$subjectId', async () => {
    renderWithRouter(
      <SubjectCard
        subjectId="subject-1"
        subjectName="Language Arts"
        mascotUrl="https://example.com/mascot.png"
        teacherName="Jane Doe"
      />,
    );
    await waitFor(() => {
      const link = screen.getByRole('link');
      expect(link).toBeTruthy();
      expect(link.getAttribute('aria-label')).toBe('Language Arts curriculum');
    });
  });
});
