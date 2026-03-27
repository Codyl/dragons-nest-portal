import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import CreatePasswordForm from "@/components/forms/create-password.form";
import CommonCard from "@/components/cards/common-card";
import useLoggedInUser from "@/hooks/use-logged-in-user";

export const Route = createFileRoute("/(private)/_private/create-password")({
  head: () => ({
    meta: [
      { title: "Create Password | Cody Lillywhite" },
      {
        name: "description",
        content:
          "Set a password for your account so you can sign in without Google.",
      },
    ],
  }),
  component: CreatePasswordPage,
});

function CreatePasswordPage() {
  const { data, isLoading, isFetching, isError } = useLoggedInUser();
  const hasPassword = data?.data?.hasPassword ?? true;

  if (isLoading || isFetching) {
    return (
      <div className="flex flex-col mx-auto max-w-md">
        <p className="text-muted-foreground text-sm">Loading…</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col mx-auto max-w-md gap-2">
        <p className="text-destructive text-sm">Could not load your profile.</p>
        <Link to="/security-settings" className="text-primary text-sm underline">
          Back to security settings
        </Link>
      </div>
    );
  }

  if (hasPassword) {
    return <Navigate to="/security-settings" />;
  }

  return (
    <div className="flex flex-col mx-auto max-w-md">
      <CommonCard
        title="Create password"
        description="Choose a password that meets the requirements below. You can use it to sign in without Google or to disconnect Google from your account."
      >
        <CreatePasswordForm />
      </CommonCard>
    </div>
  );
}
