import { createFileRoute } from '@tanstack/react-router';
import type { Subject } from '@/api/services/subjects.services';
import type {
  ProfileUserData,
  ManagedUserEnrolledSubject,
} from '@/api/services/profile.services';
import SubjectCard from '@/components/cards/subject-card';
import AddSubjectSheet from '@/components/sheets/add-subject-sheet';
import RecordActivitySheet from '@/components/sheets/record-activity-sheet';
import { useManagedUser } from '@/contexts/managed-user-context';
import useManagedUserSubjects from '@/hooks/use-managed-user-subjects';
import useSubjects from '@/hooks/use-subjects';
import useLoggedInUser from '@/hooks/use-logged-in-user';
import useComplianceLaws from '@/hooks/use-compliance-laws';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/(private)/_private/curriculum/')({
  head: () => ({
    meta: [{ title: 'Curriculum | Cody Lillywhite' }],
  }),
  component: CurriculumRoute,
});

/**
 * Resolves catalog subjects that appear in the manageduser's enrolled classes.
 */
export function resolveEnrolledSubjects(
  catalog: Subject[],
  enrolledClasses: ManagedUserEnrolledSubject[],
): Subject[] {
  const enrolledSubjectIds = new Set(
    enrolledClasses
      .map((c) => c.subjectId)
      .filter((id): id is string => id !== null),
  );
  return catalog.filter((subject) => enrolledSubjectIds.has(subject._id));
}

/**
 * Resolves the teacher name for a given subject.
 * If the active manageduser's enrolled classes include a class for this subject
 * with an assigned teacher, returns that teacher's name.
 * Otherwise, returns the Adult_User's full name (given_name + family_name).
 */
export function resolveTeacherName(
  subjectId: string,
  enrolledClasses: ManagedUserEnrolledSubject[],
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
  const { activeManagedUser } = useManagedUser();

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
  } = useManagedUserSubjects(activeManagedUser?.managedUserId);

  const isLoading =
    isUserLoading ||
    (!!state && isComplianceLoading) ||
    isSubjectsLoading ||
    (!!activeManagedUser?.managedUserId && isClassesLoading);

  const error = userError ?? complianceError ?? subjectsError ?? classesError;

  const enrolledClasses = classesResult?.data ?? [];
  // Derive required subjects by mapping compliance IDs to catalog entries
  const requiredSubjects: Subject[] = (() => {
    if (!complianceLaws || !subjects) return [];
    const subjectMap = new Map(subjects.map((s) => [s._id, s]));
    return complianceLaws.requiredTopicIds
      .map((id) => subjectMap.get(id))
      .filter((s): s is Subject => s !== undefined);
  })();

  // ponytail: derive manually added subjects — set difference of enrolled vs required, filtered by catalog
  const manualSubjects: Subject[] = (() => {
    if (!subjects || enrolledClasses.length === 0) return [];
    const subjectMap = new Map(subjects.map((s) => [s._id, s]));
    const requiredIds = new Set(
      complianceLaws?.requiredTopicIds ?? [],
    );
    return enrolledClasses
      .map((c) => c.subjectId)
      .filter((id): id is string => id !== null)
      .filter((id) => !requiredIds.has(id))
      .map((id) => subjectMap.get(id))
      .filter((s): s is Subject => s !== undefined);
  })();

  const enrolledSubjectIds = enrolledClasses
    .map((c) => c.subjectId)
    .filter((id): id is string => id !== null);

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
      <div className="flex justify-between">
        <div>
      <h2 className="text-2xl font-bold">Curriculum</h2>

      {activeManagedUser?.displayName && (
        <p className="text-muted-foreground" data-testid="active-manageduser-label">
          Viewing curriculum for {activeManagedUser.displayName}
        </p>
      )}
        </div>
        <div>
          {!isLoading && !error && activeManagedUser && (
        <AddSubjectSheet
          managedUserId={activeManagedUser.managedUserId}
          manageduserName={activeManagedUser.displayName ?? ''}
          enrolledSubjectIds={enrolledSubjectIds}
        />
      )}
          {!isLoading && !error && activeManagedUser && (
            <div className="mt-2 flex justify-end">
              <RecordActivitySheet enrolledSubjectIds={enrolledSubjectIds} />
            </div>
          )}
        </div>
      </div>

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

      {!isLoading && !error && manualSubjects.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {manualSubjects.map((subject) => (
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
