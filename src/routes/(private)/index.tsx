import { Button } from "@/components/ui/button";
import useLogout from "@/hooks/use-logout";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { requireAuth } from "@/lib/route-auth";

export const Route = createFileRoute("/(private)/")({
  beforeLoad: ({ location }) => {
    console.log("beforeLoad in (private)/index is running", location);
    requireAuth({ location });
  },
  component: Index,
});

function Index() {
  const router = useRouter();

  const { mutate: logout } = useLogout();

  return (
    <div className="p-2">
      <h3>Welcome Home!</h3>
      <Button
        onClick={() => {
          logout(localStorage.getItem("AccessToken") || "", {
            onSuccess: () => {
              sessionStorage.removeItem("session");
              sessionStorage.removeItem("username");
              sessionStorage.removeItem("availableChallenges");
              router.navigate({ to: "/login" });
            },
          });
        }}
      >
        Logout
      </Button>
    </div>
  );
}
