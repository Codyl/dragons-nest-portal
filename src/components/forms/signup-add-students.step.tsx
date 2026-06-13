import { useCallback } from 'react';
import { Plus, X } from 'lucide-react';
import { useOptionalAccountSetupForm } from '@/components/forms/account-setup.form';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Field, FieldLabel } from '../ui/field';
import CheckboxField from '../fields/checkbox-field';
import SelectField from '../fields/select-field';
import { HOMESCHOOL_GRADE_ORDINAL_OPTIONS } from '@/lib/homeschool-options';
import {
  newStudentRow,
  type PendingStudentDraft,
} from '@/lib/pending-student-draft';

export type { PendingStudentDraft } from '@/lib/pending-student-draft';
export { newStudentRow } from '@/lib/pending-student-draft';

function nameInitial(displayName: string): string {
  const t = displayName.trim();
  if (!t) return '?';
  return t.charAt(0).toUpperCase();
}

const SignupAddStudentsStep = ({
  students,
  onChange,
  onFinish,
  onBack,
  isSubmitting,
  hideHeader = false,
  showAdultGuardianAttestation = false,
}: {
  students: PendingStudentDraft[];
  onChange: (next: PendingStudentDraft[]) => void;
  onFinish: () => void;
  onBack: () => void;
  isSubmitting: boolean;
  /** Label for the primary button (e.g. account onboarding vs legacy household signup). */
  primaryActionLabel?: string;
  /** When true, omit the title and intro (e.g. when wrapped in AccountSetupCard). */
  hideHeader?: boolean;
  /** Parent/guardian duty attestation (account-setup adult flow only; requires form context). */
  showAdultGuardianAttestation?: boolean;
}) => {
  const accountSetupCtx = useOptionalAccountSetupForm();
  const updateRow = useCallback(
    (id: string, patch: Partial<PendingStudentDraft>) => {
      onChange(students.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    },
    [students, onChange],
  );

  const removeRow = (id: string) => {
    if (students.length <= 1) return;
    onChange(students.filter((s) => s.id !== id));
  };

  const addRow = () => {
    onChange([...students, newStudentRow()]);
  };

  const allValid = students.every((s) => {
    const g = Number.parseInt(s.currentGradeOrdinal, 10);
    return (
      s.displayName.trim().length > 0 && Number.isFinite(g) && g >= 0 && g <= 13
    );
  });

  const GuardianDutyFormField =
    showAdultGuardianAttestation && accountSetupCtx
      ? accountSetupCtx.form.Field
      : null;

  return (
    <div className="space-y-4">
      {!hideHeader && (
        <>
          <h2 className="text-lg font-semibold tracking-tight">
            Add a Student
          </h2>
          <p className="text-muted-foreground text-sm">
            Add one or more student profiles for your household. You can update
            details later.
          </p>
        </>
      )}

      <div className="max-h-[min(28rem,70vh)] space-y-4 overflow-y-auto pr-1">
        {students.map((s) => (
          <div
            key={s.id}
            className="bg-card text-card-foreground relative rounded-xl border p-4 shadow-xs"
            data-testid={`student-card-${s.id}`}
          >
            {students.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="absolute top-2 right-2"
                aria-label="Remove student"
                data-testid={`remove-student-${s.id}`}
                onClick={() => removeRow(s.id)}
              >
                <X className="size-4" />
              </Button>
            )}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div
                className="bg-primary/15 text-primary border-border flex size-20 shrink-0 items-center justify-center rounded-full border text-lg font-semibold"
                data-testid={`student-initial-${s.id}`}
                aria-hidden
              >
                {nameInitial(s.displayName)}
              </div>

              <div className="min-w-0 flex-1 space-y-3">
                <Field>
                  <FieldLabel htmlFor={`name-${s.id}`}>
                    Student first name or nickname
                  </FieldLabel>
                  <Input
                    id={`name-${s.id}`}
                    data-testid={`student-name-${s.id}`}
                    value={s.displayName}
                    placeholder="Name"
                    onChange={(e) =>
                      updateRow(s.id, { displayName: e.target.value })
                    }
                  />
                </Field>
                <SelectField
                  label="Current grade"
                  id={`grade-${s.id}`}
                  data-testid={`student-grade-${s.id}`}
                  className="gap-1.5"
                  placeholder="Select grade"
                  options={HOMESCHOOL_GRADE_ORDINAL_OPTIONS}
                  field={{
                    name: `grade-${s.id}`,
                    state: {
                      value: s.currentGradeOrdinal,
                      meta: { errors: [], isTouched: false },
                    },
                    handleChange: (v: unknown) =>
                      updateRow(s.id, {
                        currentGradeOrdinal: String(v ?? ''),
                      }),
                    handleBlur: () => undefined,
                  }}
                />
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          data-testid="add-another-student"
          className="border-muted-foreground/40 hover:border-primary hover:bg-muted/50 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed py-8 text-sm font-medium transition-colors"
          onClick={addRow}
        >
          <Plus className="size-5" />
          Add another student
        </button>
      </div>

      {GuardianDutyFormField ? (
        <GuardianDutyFormField
          name="adultGuardianDutyConfirmed"
          validators={{
            onChange: ({ value }) =>
              !value
                ? 'Confirm guardian responsibility for this account'
                : undefined,
          }}
        >
          {(field) => (
            <CheckboxField
              field={field}
              id="adult-guardian"
              label="I verify that I am a Parent/Guardian and/or have permission to add these children and will manage this account."
              data-testid="checkbox-adult-guardian"
            />
          )}
        </GuardianDutyFormField>
      ) : null}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="h-11 shrink-0 rounded-xl border-stone-300 bg-white px-5 font-medium text-stone-900 hover:bg-stone-50"
          onClick={onBack}
          data-testid="add-students-back"
        >
          Back
        </Button>
        <Button
          type="button"
          data-testid="finish-household-setup"
          className="h-11 min-w-0 flex-1 rounded-xl bg-[#8b7355] text-base font-semibold text-white hover:bg-[#7a6549] disabled:opacity-60"
          onClick={onFinish}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default SignupAddStudentsStep;
