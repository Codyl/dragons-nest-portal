import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import UserServices from "@/api/services/user.services";

export const Route = createFileRoute("/(private)/users/me")({
  component: UserMe,
});

function UserMe() {
  const { data, error, isPending, refetch } = useQuery({
    queryKey: ["user", "me"],
    queryFn: UserServices.getUser,
  });

  return (
    <div className="p-2">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Current User</h2>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          disabled={isPending}
        >
          {isPending ? "Loading..." : "Refresh"}
        </button>
      </div>
      {isPending && (
        <div className="p-4 bg-gray-50 dark:bg-gray-900/20 rounded-md">
          <p>Loading user data...</p>
        </div>
      )}
      {data && (
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
  );
}
