import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import AuthServices from "@/api/services/auth.services";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/logout")({
  component: Logout,
});

function Logout() {
  const {
    mutate: logout,
    data,
    error,
    isPending,
  } = useMutation({
    mutationFn: AuthServices.logout,
    onSuccess: (data) => {
      sessionStorage.removeItem("session");
      sessionStorage.removeItem("username");
      sessionStorage.removeItem("password");
      localStorage.removeItem("AccessToken");
      localStorage.removeItem("RefreshToken");
      localStorage.removeItem("IdToken");
    },
  });

  return (
    <div className="p-2">
      <h2 className="text-2xl font-bold mb-4">Logout</h2>
      <div className="flex flex-col gap-4">
        <Button
          type="button"
          disabled={isPending}
          onClick={() => logout(localStorage.getItem("AccessToken") || "")}
        >
          {isPending ? "Logging out..." : "Logout"}
        </Button>
        {data !== undefined && data !== null && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-md">
            <pre className="text-xs overflow-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-md">
            <p className="text-red-600 dark:text-red-400">
              Error: {error instanceof Error ? error.message : "Unknown error"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
