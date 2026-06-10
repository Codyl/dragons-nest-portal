import { createFileRoute } from '@tanstack/react-router';
import type { Subject } from '@/api/services/subjects.services';
import type { StudentEnrolledClass } from '@/api/services/profile.services';
import SubjectCard from '@/components/cards/subject-card';
import { useStudent } from '@/contexts/student-context';
import useStudentClasses from '@/hooks/use-student-classes';
import useSubjects from '@/hooks/use-subjects';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/(private)/_private/curriculum')({
  head: () => ({
    meta: [{ title: 'Curriculum | Cody Lillywhite' }],
  }),
  component: CurriculumRoute,
});

/**
 * Given the student's enrolled classes and the full subjects catalog,
 * returns the Subject objects that match the enrolled class subjectIds.
 */
export function resolveEnrolledSubjects(
  subjects: Subject[],
  enrolledClasses: StudentEnrolledClass[],
): Subject[] {
  const enrolledSubjectIds = new Set(
    enrolledClasses
      .map((c) => c.subjectId)
      .filter((id): id is string => id !== null),
  );
  return subjects.filter((subject) => enrolledSubjectIds.has(subject._id));
}

export function CurriculumRoute() {
  const { activeStudent } = useStudent();

  const {
    data: classesResult,
    isLoading: isClassesLoading,
    error: classesError,
    refetch: refetchClasses,
  } = useStudentClasses(activeStudent?.studentId);

  const {
    data: subjects = [],
    isLoading: isSubjectsLoading,
    error: subjectsError,
    refetch: refetchSubjects,
  } = useSubjects();

  const isLoading = isClassesLoading || isSubjectsLoading;
  const error = classesError ?? subjectsError;
  const enrolledClasses = classesResult?.data ?? [];
  const enrolledSubjects = resolveEnrolledSubjects(subjects, enrolledClasses);

  const handleRetry = () => {
    void refetchClasses();
    void refetchSubjects();
  };

  return (
    <div className="space-y-4 p-2">
      <h2 className="text-2xl font-bold">Curriculum</h2>
      {activeStudent && (
        <p className="text-muted-foreground" data-testid="active-student-label">
          Viewing curriculum for {activeStudent.displayName}
        </p>
      )}

      {!activeStudent ? (
        <p data-testid="curriculum-no-student">
          Select a student to view their curriculum.
        </p>
      ) : null}

      {activeStudent && isLoading ? (
        <p data-testid="curriculum-loading">Loading curriculum...</p>
      ) : null}

      {activeStudent && !isLoading && error ? (
        <div
          className="rounded-md border border-destructive/40 bg-destructive/5 p-3"
          data-testid="curriculum-error"
          role="alert"
        >
          <p className="text-sm text-destructive">
            Unable to load curriculum right now.
          </p>
          <Button className="mt-2" onClick={handleRetry} size="sm" type="button">
            Retry
          </Button>
        </div>
      ) : null}

      {activeStudent && !isLoading && !error && enrolledSubjects.length === 0 ? (
        <p data-testid="curriculum-empty">
          No classes have been added for this student yet.
        </p>
      ) : null}

      {activeStudent && !isLoading && !error && enrolledSubjects.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {enrolledSubjects.map((subject) => (
            <SubjectCard key={subject._id} subject={subject} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
