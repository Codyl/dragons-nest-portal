import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  redirect,
  isRedirect,
} from '@tanstack/react-router';
import { runHealthCheck } from '@/hooks/use-health-check';
import { Toaster } from '@/components/ui/sonner';

function GlobalError({ error }: { error: Error }) {
  return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-red-600">
          Something went wrong
        </h1>
        <p className="mt-2 text-gray-600">{error.message}</p>
      </div>
    </div>
  );
}

const RootLayout = () => {
  return (
    <>
      <HeadContent />
      <div className="min-h-screen w-full">
        <Outlet />
        <Toaster />
      </div>
      {/* <TanStackRouterDevtools /> */}
    </>
  );
};

export const Route = createRootRouteWithContext<Record<string, never>>()({
  beforeLoad: async ({ location }) => {
    if (location.pathname === '/maintenance') return;

    try {
      await runHealthCheck();
    } catch (error) {
      if (isRedirect(error)) throw error;

      throw redirect({ to: '/maintenance', replace: true });
    }
  },
  component: RootLayout,
  errorComponent: GlobalError,
  head: () => ({
    meta: [
      { title: 'Cody Lillywhite' },
      {
        name: 'keywords',
        content: 'Cody Lillywhite',
      },
      {
        name: 'author',
        content: 'Cody Lillywhite',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1.0',
      },
      {
        name: 'charset',
        content: 'UTF-8',
      },
    ],
  }),
});
