import { createFileRoute } from "@tanstack/react-router";
import UserSettingsForm from "@/components/forms/user-settings.form";

export const Route = createFileRoute("/(private)/users/me/settings")({
  component: UserSettings,
});

function UserSettings() {
  return (
    <div className="p-2">
      <div className="flex flex-col mx-auto max-w-md">
      <h2 className="text-2xl font-bold mb-4">User Settings</h2>
      <UserSettingsForm />
      </div>
    </div>
  );
}
