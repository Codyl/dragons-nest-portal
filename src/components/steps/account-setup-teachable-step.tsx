import { useAccountSetupForm } from '@/components/forms/account-setup.form';
import SelectField from '@/components/fields/select-field';
import { Button } from '@/components/ui/button';
import {
  HOMESCHOOL_CURRICULUM_OPTIONS,
  HOMESCHOOL_GRADE_OPTIONS,
} from '@/lib/homeschool-options';
import useSubjects from '@/hooks/use-subjects';
import { BookOpen, Plus, X } from 'lucide-react';
import AccountSetupCard from '@/components/cards/account-setup-card';

export type TeachableCourseDraft = {
  id: string;
  subjectId: string;
  grade: string;
  curriculum: string;
};

export function newCourseRow(): TeachableCourseDraft {
  return {
    id: crypto.randomUUID(),
    subjectId: '',
    grade: '',
    curriculum: '',
  };
}

const AccountSetupTeachableStep = ({ onBack }: { onBack: () => void }) => {
  const { form, submitOnboarding } = useAccountSetupForm();
  const { data: subjects = [], isLoading } = useSubjects();

  const rows = (form.getFieldValue('teachableCourses') as
    | TeachableCourseDraft[]
    | undefined) ?? [newCourseRow()];

  const setRows = (next: TeachableCourseDraft[]) => {
    form.setFieldValue('teachableCourses', next);
  };

  const updateRow = (id: string, patch: Partial<TeachableCourseDraft>) => {
    setRows(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const removeRow = (id: string) => {
    if (rows.length <= 1) return;
    setRows(rows.filter((r) => r.id !== id));
  };

  const addRow = () => {
    setRows([...rows, newCourseRow()]);
  };

  const allValid = rows.every(
    (r) =>
      r.subjectId.trim().length > 0 &&
      r.grade.trim().length > 0 &&
      r.curriculum.trim().length > 0,
  );

  const tryFinish = () => {
    if (!allValid) return;
    void form.validateField('teachableCourses', 'change');
    void submitOnboarding();
  };

  const beigeSelectClassName =
    'border-stone-200 bg-[#f5f1eb] h-9 w-full rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50';

  const subjectOptions = subjects.map((s) => ({
    value: s._id,
    label: s.name,
  }));

  return (
    <AccountSetupCard
      stepIcon={
        <BookOpen
          className="mx-auto h-9 w-9"
          strokeWidth={1.5}
        />
      }
      title="Courses you can teach"
      subtitle="Add each subject you offer, with grade band and curriculum. You can edit this later."
      footer={
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
            className="h-11 min-w-0 flex-1 rounded-xl bg-[#8b7355] text-base font-semibold text-white hover:bg-[#7a6549]"
            onClick={tryFinish}
            data-testid="account-setup-teachable-continue"
          >
            Finish setup
          </Button>
        </div>
      }
    >
      <div className="space-y-4 text-left">
        {isLoading && (
          <p className="text-muted-foreground text-sm">Loading subjects…</p>
        )}
        {rows.map((r) => (
          <div
            key={r.id}
            className="relative rounded-xl border border-stone-200 bg-white p-4 shadow-xs"
          >
            {rows.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="absolute top-2 right-2"
                aria-label="Remove course"
                onClick={() => removeRow(r.id)}
              >
                <X className="size-4" />
              </Button>
            )}
            <div className="grid gap-3 sm:grid-cols-1">
              <SelectField
                label="Subject"
                id={`subj-${r.id}`}
                options={subjectOptions}
                placeholder="Select subject"
                value={r.subjectId}
                onValueChange={(v) => updateRow(r.id, { subjectId: v })}
                selectClassName={beigeSelectClassName}
                className="gap-1.5"
              />
              <SelectField
                label="Grade"
                id={`grade-${r.id}`}
                options={HOMESCHOOL_GRADE_OPTIONS}
                placeholder="Select grade"
                value={r.grade}
                onValueChange={(v) => updateRow(r.id, { grade: v })}
                selectClassName={beigeSelectClassName}
                className="gap-1.5"
              />
              <SelectField
                label="Curriculum"
                id={`curr-${r.id}`}
                options={HOMESCHOOL_CURRICULUM_OPTIONS}
                placeholder="Select curriculum"
                value={r.curriculum}
                onValueChange={(v) => updateRow(r.id, { curriculum: v })}
                selectClassName={beigeSelectClassName}
                className="gap-1.5"
              />
            </div>
          </div>
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
};

export default AccountSetupTeachableStep;
