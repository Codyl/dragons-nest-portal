import type { Meta, StoryObj } from '@storybook/react-vite';

import StudentDraftCard from './student-draft-card';

const meta = {
  title: 'Cards/StudentDraftCard',
  component: StudentDraftCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof StudentDraftCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Active: Story = {
  args: {
    draft: {
      studentDraftId: 'draft-1',
      displayName: 'Jordan',
      currentGrade: 7,
      lastPromotionYear: 2025,
    },
    onArchive: () => {},
  },
};

export const Archived: Story = {
  args: {
    draft: {
      studentDraftId: 'draft-2',
      displayName: 'River',
      currentGrade: 10,
      lastPromotionYear: 2024,
      archivedAt: '2024-06-01T12:00:00.000Z',
    },
    onRestore: () => {},
  },
};
