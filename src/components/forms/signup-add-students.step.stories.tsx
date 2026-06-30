import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import SignupAddStudentsStep, {
  newManagedUserRow,
  type PendingManagedUserDraft,
} from './signup-add-students.step';

function SignupAddStudentsPlayground() {
  const [managedUsers, setManagedUsers] = useState<PendingManagedUserDraft[]>([
    newManagedUserRow(),
  ]);
  return (
    <div className="mx-auto max-w-lg p-4">
      <SignupAddStudentsStep
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
  title: 'Forms/SignupAddStudentsStep',
  component: SignupAddStudentsPlayground,
} satisfies Meta<typeof SignupAddStudentsPlayground>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Grade selector is aligned with backend ordinals 0–13 (Pre‑K … 12th). */
export const Default: Story = {};
