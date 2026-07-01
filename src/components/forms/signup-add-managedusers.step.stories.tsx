import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import SignupAddManagedUsersStep, {
  newManagedUserRow,
  type PendingManagedUserDraft,
} from './signup-add-managedusers.step';

function SignupAddManagedUsersPlayground() {
  const [managedUsers, setManagedUsers] = useState<PendingManagedUserDraft[]>([
    newManagedUserRow(),
  ]);
  return (
    <div className="mx-auto max-w-lg p-4">
      <SignupAddManagedUsersStep
        managedUsers={managedUsers}
        onChange={setManagedUsers}
        onFinish={() => undefined}
        onBack={() => undefined}
        isSubmitting={false}
      />
    </div>
  );
}

const meta = {
  title: 'Forms/SignupAddManagedUsersStep',
  component: SignupAddManagedUsersPlayground,
} satisfies Meta<typeof SignupAddManagedUsersPlayground>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Grade selector is aligned with backend ordinals 0–13 (Pre‑K … 12th). */
export const Default: Story = {};
