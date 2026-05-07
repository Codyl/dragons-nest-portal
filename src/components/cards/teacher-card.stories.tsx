import type { Meta, StoryObj } from '@storybook/react-vite';

import type { User } from '@/api/services/user.services';

import TeacherCard from './teacher-card';

const baseUser = (): User => ({
  _id: '507f1f77bcf86cd799439011',
  email: 'alex.rivera@example.com',
  givenName: 'Alex',
  familyName: 'Rivera',
  avatar: null,
  teachableCourses: [
    {
      _id: 'course-1',
      className: 'Algebra I',
      grades: ['9', '10'],
      subjectId: '69cd8d3af25d5f9fc7d339da',
      matchesAllGrades: false,
      curriculum: 'secular',
      maxStudents: 6,
    },
  ],
});

const meta = {
  title: 'Cards/TeacherCard',
  component: TeacherCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof TeacherCard>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Mon–Fri same hours → single `M–F …` line. */
export const WeekdaysIdentical: Story = {
  args: {
    user: {
      ...baseUser(),
      availability: (() => {
        const slot = { start: '9:00am', end: '3:00pm' };
        return ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].map(
          (day) => ({ day, slots: [slot] }),
        );
      })(),
    },
  },
};

export const WeekdaysAndWeekend: Story = {
  args: {
    user: {
      ...baseUser(),
      availability: [
        ...['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].map(
          (day) => ({
            day,
            slots: [{ start: '9:00am', end: '12:00pm' }],
          }),
        ),
        {
          day: 'saturday',
          slots: [{ start: '10:00am', end: '2:00pm' }],
        },
        {
          day: 'sunday',
          slots: [{ start: '10:00am', end: '2:00pm' }],
        },
      ],
    },
  },
};

export const NoAvailability: Story = {
  args: {
    user: {
      ...baseUser(),
      availability: [],
    },
  },
};

/**
 * Cypress: `src/components/cards/teacher-card.cy.tsx`.
 * Reference: `student-draft-card.cy.tsx` (composeStories, mounting patterns).
 */
