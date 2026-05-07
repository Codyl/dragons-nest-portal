import ProfileServices from '@/api/services/profile.services';
import NewDeviceModal from '@/components/modals/new-device.modal';
import useLoggedInUser from '@/hooks/use-logged-in-user';
import { profileNeedsWelcome } from '@/lib/profile-needs-welcome';
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/(private)/_private/')({
  loader: async () => {
    const res = await ProfileServices.getProfile();

    if (profileNeedsWelcome(res.data ?? {})) {
      throw redirect({ to: '/account-setup', replace: true });
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
