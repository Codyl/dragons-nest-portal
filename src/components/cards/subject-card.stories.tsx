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
    subjectId: 'subject-001',
    subjectName: 'Mathematics',
    mascotUrl: 'https://example.com/math-mascot.png',
    teacherName: 'John Smith',
  },
};

export const WithoutMascot: Story = {
  args: {
    subjectId: 'subject-002',
    subjectName: 'Language Arts',
    teacherName: 'Jane Doe',
  },
};
