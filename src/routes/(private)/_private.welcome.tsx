import WelcomePage from '@/components/pages/welcome-page';
import ProfileServices from '@/api/services/profile.services';
import { ACCOUNT_SETUP_SESSION_KEY } from '@/constants/account-setup-session';
import { profileNeedsWelcome } from '@/lib/profile-needs-welcome';
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const Route = createFileRoute('/(private)/_private/welcome')({
  loader: async () => {
    const res = await ProfileServices.getProfile();

    if (!profileNeedsWelcome(res.data ?? {})) {
      throw redirect({ to: '/', replace: true });
    }

    const hasFinishedAccountSetup =
      typeof window !== 'undefined' &&
      sessionStorage.getItem(ACCOUNT_SETUP_SESSION_KEY) === '1';

    if (!hasFinishedAccountSetup) {
      throw redirect({ to: '/account-setup', replace: true });
    }

    const { given_name, email } = res.data ?? {};
    const displayName =
      given_name?.trim() ||
      (email?.includes('@') ? email.split('@')[0] : email) ||
      '';

    return { displayName };
  },
  head: () => ({
    meta: [
      { title: 'Welcome | Cody Lillywhite' },
      {
        name: 'description',
        content: 'Get started with your new account.',
      },
    ],
  }),
  component: WelcomeRoute,
});

function WelcomeRoute() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { displayName } = Route.useLoaderData();

  const { mutate: completeWelcome, isPending } = useMutation({
    mutationFn: () => ProfileServices.recordFirstLogin(),
    onSuccess: () => {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(ACCOUNT_SETUP_SESSION_KEY);
      }

      void queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
      void router.navigate({ to: '/', replace: true });
    },
  });

  return (
    <WelcomePage
      displayName={displayName}
      onContinue={() => completeWelcome()}
      continueDisabled={isPending}
    />
  );
}
