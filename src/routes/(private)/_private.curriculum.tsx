import { createFileRoute } from '@tanstack/react-router';
import type { Subject } from '@/api/services/subjects.services';
import SubjectCard from '@/components/cards/subject-card';
import { useStudent } from '@/contexts/student-context';
import useComplianceLaws from '@/hooks/use-compliance-laws';
import useLoggedInUser from '@/hooks/use-logged-in-user';
import useSubjects from '@/hooks/use-subjects';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/(private)/_private/curriculum')({
  head: () => ({
    meta: [{ title: 'Curriculum | Cody Lillywhite' }],
  }),
  component: CurriculumRoute,
});

export function deriveRequiredSubjects(
  subjects: Subject[],
  subjectsRequiredTopicIds: string[],
): Subject[] {
  return subjects.filter((subject) =>
    subjectsRequiredTopicIds.includes(subject._id),
  );
}

export function CurriculumRoute() {
  const { data: userResult, isLoading: isUserLoading, error: userError } =
    useLoggedInUser();
  const profileData = userResult?.data;

  const {
    data: complianceLaws,
    isLoading: isComplianceLoading,
    error: complianceError,
    refetch: refetchCompliance,
  } = useComplianceLaws(profileData?.address?.state);
  const {
    data: subjects = [],
    isLoading: isSubjectsLoading,
    error: subjectsError,
    refetch: refetchSubjects,
  } = useSubjects();
  const { activeStudent } = useStudent();

  const isLoading = isUserLoading || isComplianceLoading || isSubjectsLoading;
  const error = userError ?? complianceError ?? subjectsError;
  const requiredSubjectIds = complianceLaws?.subjectsRequiredTopicIds ?? [];
  const requiredSubjects = deriveRequiredSubjects(subjects, requiredSubjectIds);

  const handleRetry = () => {
    void refetchCompliance();
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

      {isLoading ? (
        <p data-testid="curriculum-loading">Loading curriculum...</p>
      ) : null}

      {!isLoading && error ? (
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

      {!isLoading && !error && !profileData?.address?.state ? (
        <p data-testid="curriculum-missing-state">
          Add your state in your profile to view required curriculum subjects.
        </p>
      ) : null}

      {!isLoading && !error && profileData?.address?.state && requiredSubjects.length === 0 ? (
        <p data-testid="curriculum-empty">
          No required subjects are currently defined for your state.
        </p>
      ) : null}

      {!isLoading && !error && requiredSubjects.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {requiredSubjects.map((subject) => (
            <SubjectCard key={subject._id} subject={subject} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
