import { createFileRoute } from '@tanstack/react-router';
import type { Subject } from '@/api/services/subjects.services';
import type {
  ProfileUserData,
  StudentEnrolledClass,
} from '@/api/services/profile.services';
import SubjectCard from '@/components/cards/subject-card';
import { useStudent } from '@/contexts/student-context';
import useStudentClasses from '@/hooks/use-student-classes';
import useSubjects from '@/hooks/use-subjects';
import useLoggedInUser from '@/hooks/use-logged-in-user';
import useComplianceLaws from '@/hooks/use-compliance-laws';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/(private)/_private/curriculum')({
  head: () => ({
    meta: [{ title: 'Curriculum | Cody Lillywhite' }],
  }),
  component: CurriculumRoute,
});

/**
 * Resolves the teacher name for a given subject.
 * If the active student's enrolled classes include a class for this subject
 * with an assigned teacher, returns that teacher's name.
 * Otherwise, returns the Adult_User's full name (given_name + family_name).
 */
export function resolveTeacherName(
  subjectId: string,
  enrolledClasses: StudentEnrolledClass[],
  profile: ProfileUserData,
): string {
  const enrolledClass = enrolledClasses.find((c) => c.subjectId === subjectId);
  if (
    enrolledClass &&
    'teacherName' in enrolledClass &&
    enrolledClass.teacherName
  ) {
    return enrolledClass.teacherName as string;
  }
  const parentName =
    `${profile.given_name ?? ''} ${profile.family_name ?? ''}`.trim();
  return parentName || 'Teacher';
}

export function CurriculumRoute() {
  const { activeStudent } = useStudent();

  const {
    data: userResult,
    isLoading: isUserLoading,
    error: userError,
    refetch: refetchUser,
  } = useLoggedInUser();

  const profile = userResult?.data;
  const state = profile?.address?.state ?? null;

  const {
    data: complianceLaws,
    isLoading: isComplianceLoading,
    error: complianceError,
    refetch: refetchCompliance,
  } = useComplianceLaws(state);

  const {
    data: subjects,
    isLoading: isSubjectsLoading,
    error: subjectsError,
    refetch: refetchSubjects,
  } = useSubjects();

  const {
    data: classesResult,
    isLoading: isClassesLoading,
    error: classesError,
    refetch: refetchClasses,
  } = useStudentClasses(activeStudent?.studentId);

  const isLoading =
    isUserLoading ||
    (!!state && isComplianceLoading) ||
    isSubjectsLoading ||
    (!!activeStudent?.studentId && isClassesLoading);

  const error = userError ?? complianceError ?? subjectsError ?? classesError;

  const enrolledClasses = classesResult?.data ?? [];

  // Derive required subjects by mapping compliance IDs to catalog entries
  const requiredSubjects: Subject[] = (() => {
    if (!complianceLaws || !subjects) return [];
    const subjectMap = new Map(subjects.map((s) => [s._id, s]));
    return complianceLaws.subjectsRequiredTopicIds
      .map((id) => subjectMap.get(id))
      .filter((s): s is Subject => s !== undefined);
  })();

  const handleRetry = () => {
    void refetchUser();
    void refetchCompliance();
    void refetchSubjects();
    void refetchClasses();
  };

  // Profile loaded but state is missing
  const isMissingState = !isUserLoading && profile && !state;
  // Compliance loaded but no required subjects
  const isEmpty =
    !isLoading &&
    !error &&
    !isMissingState &&
    complianceLaws &&
    subjects &&
    requiredSubjects.length === 0;

  return (
    <div className="space-y-4 p-2">
      <h2 className="text-2xl font-bold">Curriculum</h2>

      {activeStudent?.displayName && (
        <p className="text-muted-foreground" data-testid="active-student-label">
          Viewing curriculum for {activeStudent.displayName}
        </p>
      )}

      {isLoading && (
        <p data-testid="curriculum-loading">Loading curriculum...</p>
      )}

      {!isLoading && error && (
        <div
          className="rounded-md border border-destructive/40 bg-destructive/5 p-3"
          data-testid="curriculum-error"
          role="alert"
        >
          <p className="text-sm text-destructive">
            Unable to load curriculum right now.
          </p>
          <Button
            className="mt-2"
            onClick={handleRetry}
            size="sm"
            type="button"
          >
            Retry
          </Button>
        </div>
      )}

      {isMissingState && !error && (
        <p data-testid="curriculum-missing-state">
          Please complete your profile with a state selection to view your
          curriculum requirements.
        </p>
      )}

      {isEmpty && (
        <p data-testid="curriculum-empty">
          No required subjects are defined for your state.
        </p>
      )}

      {!isLoading &&
        !error &&
        !isMissingState &&
        requiredSubjects.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {requiredSubjects.map((subject) => (
              <SubjectCard
                key={subject._id}
                subjectId={subject._id}
                subjectName={subject.name}
                mascotUrl={subject.mascot}
                teacherName={resolveTeacherName(
                  subject._id,
                  enrolledClasses,
                  profile!,
                )}
              />
            ))}
          </div>
        )}
    </div>
  );
}
