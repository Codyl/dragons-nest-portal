import type { RouterContext } from '@/App';
import UserServices from '@/api/services/user.services';
import NewDeviceModal from '@/components/modals/new-device.modal';
import useLoggedInUser from '@/hooks/use-logged-in-user';
import { profileNeedsWelcome } from '@/lib/profile-needs-welcome';
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
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
  loader: async () => {
    const res = await UserServices.getUser();
    if (profileNeedsWelcome(res.data ?? {})) {
      throw redirect({ to: '/welcome', replace: true });
    }
    return null;
  },
  head: () => ({
    meta: [
      { title: 'Home | Cody Lillywhite' },
      { name: 'description', content: 'Your account dashboard' },
    ],
  }),
  component: Index,
});

function Index() {
  const { data: userData } = useLoggedInUser();
  const hasPassword = userData?.data?.hasPassword !== false;

  return (
    <div className="p-2">
      <h3>Welcome Home</h3>
      {hasPassword && <NewDeviceModal />}
    </div>
  );
}
