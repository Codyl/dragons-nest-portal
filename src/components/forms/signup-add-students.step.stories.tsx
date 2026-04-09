import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import SignupAddStudentsStep, {
  newStudentRow,
  type PendingStudentDraft,
} from './signup-add-students.step';

function SignupAddStudentsPlayground() {
  const [students, setStudents] = useState<PendingStudentDraft[]>([
    newStudentRow(),
  ]);
  return (
    <div className="mx-auto max-w-lg p-4">
      <SignupAddStudentsStep
        students={students}
        onChange={setStudents}
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
