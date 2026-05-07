import { createFileRoute, redirect, isRedirect } from '@tanstack/react-router';
import ChildAccountsPage from '@/components/pages/child-accounts.page';
import ProfileServices from '@/api/services/profile.services';

export const Route = createFileRoute(
  '/(private)/_private/settings/child-accounts',
)({
  beforeLoad: async () => {
    try {
      const response = await ProfileServices.getProfile();
      const { accountType, ageBandAtRegistration } = response.data;

      if (
        accountType !== 'adult' ||
        ageBandAtRegistration !== 'ADULT_18_PLUS'
      ) {
        throw redirect({ to: '/settings/profile' });
      }
    } catch (err) {
      if (isRedirect(err)) throw err;
    }
  },
  head: () => ({
    meta: [{ title: 'Child Accounts | Settings' }],
  }),
  component: ChildAccountsPage,
});
