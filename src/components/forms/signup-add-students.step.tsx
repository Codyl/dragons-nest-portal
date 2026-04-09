import { useCallback } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Field, FieldLabel } from '../ui/field';

export type PendingStudentDraft = {
  id: string;
  displayName: string;
  age: string;
};

function nameInitial(displayName: string): string {
  const t = displayName.trim();
  if (!t) return '?';
  return t.charAt(0).toUpperCase();
}

function newStudentRow(): PendingStudentDraft {
  return {
    id: crypto.randomUUID(),
    displayName: '',
    age: '',
  };
}

const SignupAddStudentsStep = ({
  students,
  onChange,
  onFinish,
  onBack,
  isSubmitting,
  hideHeader = false,
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
}) => {
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
    const ageNum = Number.parseInt(s.age, 10);
    return (
      s.displayName.trim().length > 0 &&
      Number.isFinite(ageNum) &&
      ageNum >= 1 &&
      ageNum <= 120
    );
  });

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
                <Field>
                  <FieldLabel htmlFor={`age-${s.id}`}>Student age</FieldLabel>
                  <Input
                    id={`age-${s.id}`}
                    data-testid={`student-age-${s.id}`}
                    type="number"
                    min={1}
                    max={120}
                    inputMode="numeric"
                    value={s.age}
                    placeholder="Age"
                    onChange={(e) => updateRow(s.id, { age: e.target.value })}
                  />
                </Field>
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

      <Button
        type="button"
        className="w-full"
        size="lg"
        disabled={!allValid || isSubmitting}
        data-testid="finish-household-setup"
        onClick={onFinish}
      >
        Continue
      </Button>
      <button
        type="button"
        className="text-muted-foreground hover:text-foreground w-full text-center text-sm underline-offset-4 hover:underline"
        data-testid="add-students-back"
        onClick={onBack}
      >
        Back
      </button>
    </div>
  );
};

export { newStudentRow };
export default SignupAddStudentsStep;
