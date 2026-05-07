import { createFileRoute, redirect, isRedirect } from '@tanstack/react-router';
import TeachingSubjectsPage from '@/components/pages/teaching-subjects.page';
import ProfileServices from '@/api/services/profile.services';

export const Route = createFileRoute(
  '/(private)/_private/settings/teaching-subjects',
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
      // Re-throw redirects so the router handles them
      if (isRedirect(err)) throw err;
      // For any other fetch error, let the page component handle it
    }
  },
  head: () => ({
    meta: [{ title: 'Teaching Subjects | Settings' }],
  }),
  component: TeachingSubjectsPage,
});
