import { createFileRoute } from '@tanstack/react-router'
import LoginMethodSettingsSection from '@/components/sections/login-method-settings.section';
import UserDeviceSettingsSection from '@/components/sections/device-settings.section';
import UserMFAOptionsSettingsSection from '@/components/sections/mfa-options-settings.section';

export const Route = createFileRoute('/(private)/_private/security-settings')({
  component: SecuritySettings,
  head: () => ({
    meta: [
      { title: "Security Settings | Cody Lillywhite" },
      { name: "description", content: "Manage your login methods, trusted devices, and multi-factor authentication." },
    ],
  }),
})

function SecuritySettings() {
  return (
    <>
      <div className="flex flex-col mx-auto max-w-md">
        <h2 className="text-2xl font-bold mb-4">Security Settings</h2>
        <LoginMethodSettingsSection />
        <UserDeviceSettingsSection className="mt-4" />
        <UserMFAOptionsSettingsSection className="mt-4" />
      </div>
    </>
  );
}
