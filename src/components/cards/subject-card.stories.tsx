import type { Meta, StoryObj } from '@storybook/react-vite';
import SubjectCard from './subject-card';

const meta = {
  title: 'Cards/SubjectCard',
  component: SubjectCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof SubjectCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    subject: {
      _id: 'subject-001',
      name: 'Mathematics',
      icon: '📐',
      color: '#4A90D9',
      slug: 'mathematics',
      isEnrichment: false,
    },
  },
};
