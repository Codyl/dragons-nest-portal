import type { RouterContext } from '@/App';
import WelcomePage from '@/components/pages/welcome-page';
import UserServices from '@/api/services/user.services';
import { profileNeedsWelcome } from '@/lib/profile-needs-welcome';
import {
  createFileRoute,
  redirect,
  useRouter,
} from '@tanstack/react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const Route = createFileRoute('/welcome')({
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

    if (!profileNeedsWelcome(res.data ?? {})) {
      throw redirect({ to: '/', replace: true });
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
    mutationFn: () => UserServices.recordFirstLogin(),
    onSuccess: () => {
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
