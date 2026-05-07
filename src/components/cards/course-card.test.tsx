// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as fc from 'fast-check';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Subject } from '@/api/services/subjects.services';
import type { TeachableCourseWithEnrollment } from '@/api/services/profile.services';
import { HOMESCHOOL_CURRICULUM_OPTIONS } from '@/lib/homeschool-options';
import CourseCard from './course-card';

afterEach(() => {
  cleanup();
});

// ---------------------------------------------------------------------------
// Arbitrary generators
// ---------------------------------------------------------------------------

const GRADE_VALUES = [
  'pre_k',
  'k',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12',
];

const CURRICULUM_VALUES = HOMESCHOOL_CURRICULUM_OPTIONS.map((o) => o.value);

function arbitrarySubject(): fc.Arbitrary<Subject> {
  return fc.record({
    _id: fc.uuid(),
    name: fc
      .string({ minLength: 1, maxLength: 40 })
      .filter((s) => s.trim().length > 0),
    icon: fc.constant('📚'),
    color: fc.string({ minLength: 6, maxLength: 6 }).map(() => '#aabbcc'),
    slug: fc
      .string({ minLength: 1, maxLength: 20 })
      .filter((s) => s.trim().length > 0),
    isEnrichment: fc.boolean(),
  });
}

function arbitraryTeachableCourseWithEnrollment(
  subjectId?: string,
): fc.Arbitrary<TeachableCourseWithEnrollment> {
  const subjectIdArb = subjectId ? fc.constant(subjectId) : fc.uuid();
  return fc
    .record({
      className: fc
        .string({ minLength: 1, maxLength: 60 })
        .filter((s) => s.trim().length > 0),
      subjectId: subjectIdArb,
      matchesAllGrades: fc.boolean(),
      grades: fc.array(fc.constantFrom(...GRADE_VALUES), {
        minLength: 1,
        maxLength: 5,
      }),
      curriculum: fc.constantFrom(...CURRICULUM_VALUES),
      maxStudents: fc.integer({ min: 1, max: 20 }),
      activeEnrollmentCount: fc.integer({ min: 0, max: 50 }),
    })
    .map((c) => ({
      ...c,
      // When matchesAllGrades is true, grades array is empty per API contract
      grades: c.matchesAllGrades ? [] : c.grades,
    }));
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const subjectFixture: Subject = {
  _id: 'subject-001',
  name: 'Mathematics',
  icon: '📐',
  color: '#4a90e2',
  slug: 'math',
  isEnrichment: false,
};

const courseFixture: TeachableCourseWithEnrollment = {
  className: 'Algebra I',
  subjectId: 'subject-001',
  matchesAllGrades: false,
  grades: ['9', '10'],
  curriculum: 'saxon',
  maxStudents: 8,
  activeEnrollmentCount: 0,
};

const allGradesCourseFixture: TeachableCourseWithEnrollment = {
  className: 'Music Appreciation',
  subjectId: 'subject-001',
  matchesAllGrades: true,
  grades: [],
  curriculum: 'other',
  maxStudents: 15,
  activeEnrollmentCount: 2,
};

// ---------------------------------------------------------------------------
// Unit tests — Task 10.1
// ---------------------------------------------------------------------------

describe('CourseCard', () => {
  it('renders subject name', () => {
    render(
      <CourseCard
        course={courseFixture}
        index={0}
        subjects={[subjectFixture]}
        onRemove={vi.fn()}
        isRemoving={false}
      />,
    );
    expect(screen.getByText('Mathematics')).toBeDefined();
  });

  it('renders className', () => {
    render(
      <CourseCard
        course={courseFixture}
        index={0}
        subjects={[subjectFixture]}
        onRemove={vi.fn()}
        isRemoving={false}
      />,
    );
    expect(screen.getByText('Algebra I')).toBeDefined();
  });

  it('renders grade display for specific grades', () => {
    render(
      <CourseCard
        course={courseFixture}
        index={0}
        subjects={[subjectFixture]}
        onRemove={vi.fn()}
        isRemoving={false}
      />,
    );
    expect(screen.getByText('9, 10')).toBeDefined();
  });

  it('renders "All grades" when matchesAllGrades is true', () => {
    render(
      <CourseCard
        course={allGradesCourseFixture}
        index={0}
        subjects={[subjectFixture]}
        onRemove={vi.fn()}
        isRemoving={false}
      />,
    );
    expect(screen.getByText('All grades')).toBeDefined();
  });

  it('renders curriculum label', () => {
    render(
      <CourseCard
        course={courseFixture}
        index={0}
        subjects={[subjectFixture]}
        onRemove={vi.fn()}
        isRemoving={false}
      />,
    );
    // 'saxon' maps to 'Saxon'
    expect(screen.getByText('Saxon')).toBeDefined();
  });

  it('renders maxStudents', () => {
    render(
      <CourseCard
        course={courseFixture}
        index={0}
        subjects={[subjectFixture]}
        onRemove={vi.fn()}
        isRemoving={false}
      />,
    );
    expect(screen.getByText('8')).toBeDefined();
  });

  it('Remove button is present', () => {
    render(
      <CourseCard
        course={courseFixture}
        index={0}
        subjects={[subjectFixture]}
        onRemove={vi.fn()}
        isRemoving={false}
      />,
    );
    const removeBtn = screen.getByRole('button', { name: /remove/i });
    expect(removeBtn).toBeDefined();
  });

  it('no edit button is present', () => {
    render(
      <CourseCard
        course={courseFixture}
        index={0}
        subjects={[subjectFixture]}
        onRemove={vi.fn()}
        isRemoving={false}
      />,
    );
    const editBtn = screen.queryByRole('button', { name: /edit/i });
    expect(editBtn).toBeNull();
  });

  it('Remove button is disabled when isRemoving=true', () => {
    render(
      <CourseCard
        course={courseFixture}
        index={0}
        subjects={[subjectFixture]}
        onRemove={vi.fn()}
        isRemoving={true}
      />,
    );
    const removeBtn = screen.getByRole('button', { name: /remove/i });
    expect((removeBtn as HTMLButtonElement).disabled).toBe(true);
  });

  it('Remove button is enabled when isRemoving=false', () => {
    render(
      <CourseCard
        course={courseFixture}
        index={0}
        subjects={[subjectFixture]}
        onRemove={vi.fn()}
        isRemoving={false}
      />,
    );
    const removeBtn = screen.getByRole('button', { name: /remove/i });
    expect((removeBtn as HTMLButtonElement).disabled).toBe(false);
  });

  it('calls onRemove with the correct index when Remove is clicked', async () => {
    const onRemove = vi.fn();
    render(
      <CourseCard
        course={courseFixture}
        index={3}
        subjects={[subjectFixture]}
        onRemove={onRemove}
        isRemoving={false}
      />,
    );
    const removeBtn = screen.getByRole('button', { name: /remove/i });
    await userEvent.click(removeBtn);
    expect(onRemove).toHaveBeenCalledWith(3);
  });

  it('renders contextual note text', () => {
    render(
      <CourseCard
        course={courseFixture}
        index={0}
        subjects={[subjectFixture]}
        onRemove={vi.fn()}
        isRemoving={false}
      />,
    );
    expect(
      screen.getByText(/to change this course, remove it and add a new one/i),
    ).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// Property 2: Course card displays all required fields — Task 10.2
// Feature: manage-teachable-subjects, Property 2: Course card displays all required fields
// ---------------------------------------------------------------------------

describe('Property 2: Course card displays all required fields', () => {
  it('rendered card contains subject name, className, grade display, curriculum label, and maxStudents', () => {
    // Feature: manage-teachable-subjects, Property 2: Course card displays all required fields
    // Validates: Requirements 2.3
    fc.assert(
      fc.property(
        arbitrarySubject(),
        fc.integer({ min: 0, max: 19 }),
        (subject, index) => {
          const course = fc.sample(
            arbitraryTeachableCourseWithEnrollment(subject._id),
            1,
          )[0];

          const { unmount, container } = render(
            <CourseCard
              course={course}
              index={index}
              subjects={[subject]}
              onRemove={() => { }}
              isRemoving={false}
            />,
          );

          const text = container.textContent ?? '';

          // Subject name must appear
          const subjectNameFound = text.includes(subject.name);

          // className must appear
          const classNameFound = text.includes(course.className);

          // Grade display
          const expectedGradeText = course.matchesAllGrades
            ? 'All grades'
            : course.grades.join(', ');
          const gradeFound = text.includes(expectedGradeText);

          // Curriculum label (resolved or raw value)
          const curriculumLabel =
            HOMESCHOOL_CURRICULUM_OPTIONS.find(
              (o) => o.value === course.curriculum,
            )?.label ?? course.curriculum;
          const curriculumFound = text.includes(curriculumLabel);

          // maxStudents
          const maxStudentsFound = text.includes(String(course.maxStudents));

          unmount();

          return (
            subjectNameFound &&
            classNameFound &&
            gradeFound &&
            curriculumFound &&
            maxStudentsFound
          );
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 6: Every course card has Remove and no Edit — Task 10.3
// Feature: manage-teachable-subjects, Property 6: Every course card has a Remove action and no Edit action
// ---------------------------------------------------------------------------

describe('Property 6: Every course card has a Remove action and no Edit action', () => {
  it('Remove button count equals course count; edit button count equals 0', () => {
    // Feature: manage-teachable-subjects, Property 6: Every course card has a Remove action and no Edit action
    // Validates: Requirements 4.1, 6.1
    fc.assert(
      fc.property(
        fc.array(arbitraryTeachableCourseWithEnrollment(), {
          minLength: 0,
          maxLength: 20,
        }),
        (courses) => {
          const subjects: Subject[] = [];

          const { unmount, container } = render(
            <div>
              {courses.map((course, i) => (
                <CourseCard
                  key={i}
                  course={course}
                  index={i}
                  subjects={subjects}
                  onRemove={() => { }}
                  isRemoving={false}
                />
              ))}
            </div>,
          );

          const removeButtons = container.querySelectorAll('button');
          // Count buttons whose text content matches "Remove" (case-insensitive)
          const removeCount = Array.from(removeButtons).filter((btn) =>
            /remove/i.test(btn.textContent ?? ''),
          ).length;

          const editCount = Array.from(removeButtons).filter((btn) =>
            /edit/i.test(btn.textContent ?? ''),
          ).length;

          unmount();

          return removeCount === courses.length && editCount === 0;
        },
      ),
      { numRuns: 100 },
    );
  });
});
