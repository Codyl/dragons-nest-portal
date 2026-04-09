import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import CourseFormRow from '@/components/steps/course-form-row';
import {
  newCourseRow,
  type TeachableCourseDraft,
  type GetTeachableSubject,
} from '@/lib/teachable-course-validation';

const subjectOptions = [
  { value: 'topic-math', label: 'Math' },
  { value: 'topic-reading', label: 'Reading' },
  { value: 'topic-music', label: 'Music' },
];

const getSubject: GetTeachableSubject = (id) => {
  if (id === 'topic-math')
    return { slug: 'math', name: 'Math', isEnrichment: false };

  if (id === 'topic-reading')
    return { slug: 'reading', name: 'Reading', isEnrichment: false };

  if (id === 'topic-music')
    return { slug: 'music', name: 'Music', isEnrichment: true };

  return undefined;
};

const beigeSelectClassName =
  'border-stone-200 bg-[#f5f1eb] h-9 w-full rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50';

function StatefulRow(props: { initial: TeachableCourseDraft }) {
  const [row, setRow] = useState(props.initial);
  return (
    <CourseFormRow
      row={row}
      subjectOptions={subjectOptions}
      getSubject={getSubject}
      beigeSelectClassName={beigeSelectClassName}
      onChangePatch={(patch) => setRow((r) => ({ ...r, ...patch }))}
      showRemove={false}
      onRemove={() => {}}
    />
  );
}

const meta = {
  title: 'Steps/CourseFormRow',
  component: CourseFormRow,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof CourseFormRow>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Reference for Cypress: `account-setup-teachable-step.cy.tsx`. */
export const SingleRow: Story = {
  render: () => <StatefulRow initial={newCourseRow()} />,
};
