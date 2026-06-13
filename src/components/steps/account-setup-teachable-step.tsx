import { useAccountSetupForm } from '@/components/forms/account-setup.form';
import AccountSetupCard from '@/components/cards/account-setup-card';
import CourseFormRow from '@/components/steps/course-form-row';
import { Button } from '@/components/ui/button';
import useSubjects from '@/hooks/use-subjects';
import {
  newCourseRow,
  teachableCoursesFormIsSubmittable,
  type GetTeachableSubject,
  type TeachableCourseDraft,
} from '@/lib/teachable-course-validation';
import { BookOpen, Plus } from 'lucide-react';
import { useMemo } from 'react';

const AccountSetupTeachableStep = ({ onBack }: { onBack: () => void }) => {
  const { form, submitOnboarding } = useAccountSetupForm();
  const { data: subjects = [], isLoading } = useSubjects();

  const getSubject = useMemo((): GetTeachableSubject => {
    const byId = new Map(subjects.map((s) => [s._id, s]));
    return (subjectId: string) => {
      const s = byId.get(subjectId);
      if (!s) return undefined;

      return {
        slug: s.slug,
        name: s.name,
        isEnrichment: s.isEnrichment,
      };
    };
  }, [subjects]);

  const beigeSelectClassName =
    'border-stone-200 bg-[#f5f1eb] h-9 w-full rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50';

  const subjectOptions = subjects.map((s) => ({
    value: s._id,
    label: s.name,
  }));

  return (
    <form.Field name="teachableCourses">
      {(field) => {
        const rows = (field.state.value as
          | TeachableCourseDraft[]
          | undefined) ?? [newCourseRow()];

        const setRows = (next: TeachableCourseDraft[]) => {
          field.handleChange(next);
        };

        const updateRow = (
          id: string,
          patch: Partial<TeachableCourseDraft>,
        ) => {
          setRows(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
        };

        const removeRow = (id: string) => {
          if (rows.length <= 1) return;

          setRows(rows.filter((r) => r.id !== id));
        };

        const addRow = () => {
          setRows([...rows, newCourseRow()]);
        };

        const canFinish = teachableCoursesFormIsSubmittable(rows, getSubject);

        const tryFinish = () => {
          if (!canFinish) return;

          void form.validateField('teachableCourses', 'change');

          void submitOnboarding();
        };

        return (
          <AccountSetupCard
            stepIcon={
              <BookOpen className="mx-auto h-9 w-9" strokeWidth={1.5} />
            }
            title="Courses you can teach"
            subtitle="Add each subject you are willing to teach to get a 10% discount on your subscription. You can edit this later."
            footer={
              <div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 shrink-0 rounded-xl border-stone-300 bg-white px-5 font-medium text-stone-900 hover:bg-stone-50"
                    onClick={onBack}
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    className="h-11 min-w-0 flex-1 rounded-xl bg-[#8b7355] text-base font-semibold text-white hover:bg-[#7a6549] disabled:opacity-60"
                    onClick={tryFinish}
                    disabled={!canFinish}
                    data-testid="account-setup-teachable-continue"
                  >
                    Next
                  </Button>
                </div>
                {!canFinish && (
                  <div className="text-xs leading-snug text-destructive mt-2">
                    You have at least one course that is incomplete. Remove the
                    course or finish adding the required information to
                    continue.
                  </div>
                )}
              </div>
            }
          >
            <div className="space-y-4 text-left">
              {isLoading && (
                <p className="text-muted-foreground text-sm">
                  Loading subjects…
                </p>
              )}
              {rows.map((r) => (
                <CourseFormRow
                  key={r.id}
                  row={r}
                  subjectOptions={subjectOptions}
                  getSubject={getSubject}
                  subjectsLoading={isLoading}
                  beigeSelectClassName={beigeSelectClassName}
                  onChangePatch={(patch) => updateRow(r.id, patch)}
                  showRemove={rows.length > 1}
                  onRemove={() => removeRow(r.id)}
                />
              ))}
              <button
                type="button"
                className="border-muted-foreground/40 hover:border-primary hover:bg-muted/50 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed py-6 text-sm font-medium transition-colors"
                onClick={addRow}
              >
                <Plus className="size-5" />
                Add another course
              </button>
            </div>
          </AccountSetupCard>
        );
      }}
    </form.Field>
  );
};

export default AccountSetupTeachableStep;
