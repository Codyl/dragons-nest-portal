import { createFileRoute } from '@tanstack/react-router';
import LoginMethodSettingsSection from '@/components/sections/login-method-settings.section';
import PasskeySettingsSection from '@/components/sections/passkey-settings.section';
import UserDeviceSettingsSection from '@/components/sections/device-settings.section';
import UserMFAOptionsSettingsSection from '@/components/sections/mfa-options-settings.section';

export const Route = createFileRoute('/(private)/_private/settings/security')({
  component: SettingsSecurity,
  head: () => ({
    meta: [
      { title: 'Security | Settings | Cody Lillywhite' },
      {
        name: 'description',
        content:
          'Manage your login methods, passkeys, trusted devices, and multi-factor authentication.',
      },
    ],
  }),
});

function SettingsSecurity() {
  return (
    <>
      <div className="mx-auto flex max-w-md flex-col tablet:max-w-full">
        <h2 className="mb-4 text-2xl font-bold">Security</h2>
        <div className="grid gap-y-5 gap-x-8 tablet:grid-cols-2 desktop:gap-x-16">
          <LoginMethodSettingsSection />
          <UserMFAOptionsSettingsSection />
          <UserDeviceSettingsSection />
          <PasskeySettingsSection />
        </div>
      </div>
    </>
  );
}
