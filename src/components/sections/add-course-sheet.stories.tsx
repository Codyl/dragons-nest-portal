import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { useState, type ComponentProps } from 'react';

import type { Subject } from '@/api/services/subjects.services';

import AddCourseSheet from './add-course-sheet';

export const enrichmentArt: Subject = {
  _id: 'subj-enrichment-art',
  name: 'Art',
  icon: '🎨',
  color: '#ff0000',
  slug: 'art',
  isEnrichment: true,
};

export const coreMath: Subject = {
  _id: 'subj-core-math',
  name: 'Mathematics',
  icon: '📐',
  color: '#0000ff',
  slug: 'math',
  isEnrichment: false,
};

export const defaultAddCourseSheetSubjects: Subject[] = [
  enrichmentArt,
  coreMath,
];

/** Open-state wrapper for Storybook interaction tests and Cypress `composeStories`. */
export function AddCourseSheetHarness({
  defaultOpen = true,
  subjects = defaultAddCourseSheetSubjects,
  ...rest
}: Omit<
  ComponentProps<typeof AddCourseSheet>,
  'open' | 'onOpenChange' | 'subjects'
> & {
  defaultOpen?: boolean;
  subjects?: Subject[];
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <AddCourseSheet
      {...rest}
      open={open}
      onOpenChange={setOpen}
      subjects={subjects}
    />
  );
}

const meta = {
  title: 'Sections/AddCourseSheet',
  component: AddCourseSheetHarness,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Sheet form for adding a teachable course, aligned with `CourseFormRow` (grades via react-select, beige fields, curriculum tooltip).',
      },
    },
  },
  decorators: [
    (Story) => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      });

      const rootRoute = createRootRoute({
        component: () => <Story />,
      });

      const routeTree = rootRoute.addChildren([
        createRoute({ getParentRoute: () => rootRoute, path: '/' }),
      ]);

      const router = createRouter({
        routeTree,
        history: createMemoryHistory(),
        defaultPendingMinMs: 0,
      });

      return (
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      );
    },
  ],
  args: {
    subjects: defaultAddCourseSheetSubjects,
  },
} satisfies Meta<typeof AddCourseSheetHarness>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Default subjects (math core + enrichment art); supports full add-course flow in MSW-backed environments. */
export const Default: Story = {
  args: {
    subjects: defaultAddCourseSheetSubjects,
  },
};

/** Only enrichment — fastest path to pick “Any” for grades when exercising the react-select grade control. */
export const EnrichmentSubjectsOnly: Story = {
  args: {
    subjects: [enrichmentArt],
  },
};
