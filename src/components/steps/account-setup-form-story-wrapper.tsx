import AccountSetupForm from '@/components/forms/account-setup.form';
import type { ExpectedBirthBand } from '@/lib/account-setup-flow';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import type { ReactNode } from 'react';

export type AccountSetupFormStoryWrapperProps = {
  children: ReactNode;
  stepIndex: number;
  totalSteps: number;
  signupRole?: 'adult' | 'student';
};

/**
 * Provides `AccountSetupForm` context (TanStack Form + router + query client) for step Storybook stories.
 */
export function AccountSetupFormStoryWrapper({
  children,
  stepIndex,
  totalSteps,
  signupRole = 'student',
}: AccountSetupFormStoryWrapperProps) {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('signupRole', signupRole);
  }

  const expectedBirthBand: ExpectedBirthBand =
    signupRole === 'adult' ? 'adult' : 'teen13to17';
  const initialFormAccountType = signupRole === 'adult' ? 'adult' : 'student';

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const rootRoute = createRootRoute({
    component: () => (
      <AccountSetupForm
        stepIndex={stepIndex}
        totalSteps={totalSteps}
        expectedBirthBand={expectedBirthBand}
        initialFormAccountType={initialFormAccountType}
      >
        {children}
      </AccountSetupForm>
    ),
  });
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
  });
  const welcomeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/welcome',
  });
  const routeTree = rootRoute.addChildren([indexRoute, welcomeRoute]);
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ['/'] }),
    defaultPendingMinMs: 0,
  });

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
