import type { RouterContext } from '@/App';
import NewDeviceModal from '@/components/modals/new-device.modal';
import useLoggedInUser from '@/hooks/use-logged-in-user';
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'Home | Cody Lillywhite' },
      { name: 'description', content: 'Your account dashboard' },
    ],
  }),
  beforeLoad: async ({ context, location }) => {
    const authContext = context as RouterContext;
    const isAuthenticated = await authContext.checkAuth();

    if (!isAuthenticated) {
      throw redirect({
        to: '/verify-username',
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: Index,
});

function Index() {
  const { data: userData } = useLoggedInUser();
  const hasPassword = userData?.data?.hasPassword !== false;

  return (
    <div className="p-2">
      <h3>Welcome Home!</h3>
      {hasPassword && <NewDeviceModal />}
    </div>
  );
}
