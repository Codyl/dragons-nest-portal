import { createFileRoute } from '@tanstack/react-router';
import UserSettingsForm from '@/components/forms/user-settings.form';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import DeleteAccountModal from '@/components/modals/delete-account.modal';

export const Route = createFileRoute('/(private)/_private/settings/profile')({
  head: () => ({
    meta: [
      { title: 'Profile | Settings | Cody Lillywhite' },
      {
        name: 'description',
        content: 'Manage your profile and preferences.',
      },
    ],
  }),
  component: SettingsProfile,
});

function SettingsProfile() {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="mx-auto flex max-w-md flex-col">
      <h2 className="mb-4 text-2xl font-bold">Profile</h2>
      <UserSettingsForm />
      <Button
        variant="link"
        className="mt-2 w-min"
        onClick={() => setShowAdvanced(!showAdvanced)}
      >
        Advanced
      </Button>
      {showAdvanced && <DeleteAccountModal />}
    </div>
  );
}
