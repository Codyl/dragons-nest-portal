import type { RouterContext } from "@/App";
import { Button } from "@/components/ui/button";
import useLogout from "@/hooks/use-logout";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Home | Cody Lillywhite" },
      { name: "description", content: "Your account dashboard" },
    ],
  }),
  beforeLoad: async ({ context, location }) => {
    const authContext = context as RouterContext;
    const isAuthenticated = await authContext.checkAuth();

    if (!isAuthenticated) {
      throw redirect({
        to: "/verify-username",
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: Index,
});

function Index() {
  const { mutate: logout } = useLogout();

  return (
    <div className="p-2">
      <h3>Welcome Home!</h3>
      <Button
        onClick={() => logout()}
      >
        Logout
      </Button>
    </div>
  );
}
