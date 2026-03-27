import { createFileRoute } from '@tanstack/react-router';
import UserSettingsForm from '@/components/forms/user-settings.form';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import DeleteAccountModal from '@/components/modals/delete-account.modal';

export const Route = createFileRoute('/(private)/_private/account-settings')({
  head: () => ({
    meta: [
      { title: 'Account Settings | Cody Lillywhite' },
      {
        name: 'description',
        content: 'Manage your profile and account preferences.',
      },
    ],
  }),
  component: AccountSettings,
});

function AccountSettings() {
  const [showAdvanced, setShowAdvanced] = useState(false);
  return (
    <div className="flex flex-col mx-auto max-w-md">
      <h2 className="text-2xl font-bold mb-4">Account Settings</h2>
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
