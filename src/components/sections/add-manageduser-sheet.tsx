import { useEffect, useMemo, useState } from 'react';
import useAddManagedUser from '@/hooks/use-add-managed-user';
import SelectField from '@/components/fields/select-field';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { GRADE_OPTIONS } from '@/lib/grade-label';

export type AddManagedUserSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const FORM_ID = 'add-manageduser-sheet-form';

const gradeSelectOptions = GRADE_OPTIONS.map((o) => ({
  value: String(o.value),
  label: o.label,
}));

function AddManagedUserSheet({ open, onOpenChange }: AddManagedUserSheetProps) {
  const [displayName, setDisplayName] = useState('');
  const [gradeValue, setGradeValue] = useState('');

  const mutation = useAddManagedUser();

  useEffect(() => {
    if (!open) return;
    setDisplayName('');
    setGradeValue('');
    mutation.reset();
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- only when sheet opens
  }, [open]);

  const trimmedName = displayName.trim();
  const nameTooLong = displayName.length > 100;

  const gradeNum = useMemo(() => {
    if (gradeValue === '') return null;
    const n = Number.parseInt(gradeValue, 10);
    return Number.isFinite(n) ? n : null;
  }, [gradeValue]);

  const submitDisabled =
    mutation.isPending ||
    trimmedName.length === 0 ||
    nameTooLong ||
    gradeValue === '' ||
    gradeNum === null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameTooLong || trimmedName.length === 0 || gradeNum === null) {
      return;
    }

    mutation.mutate(
      { displayName: trimmedName, currentGrade: gradeNum },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col gap-4 sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Add ManagedUser</SheetTitle>
          <SheetDescription>
            Create a household manageduser profile. You can archive it later without
            losing data.
          </SheetDescription>
        </SheetHeader>

        <form
          id={FORM_ID}
          className="flex flex-1 flex-col gap-4 mx-4"
          onSubmit={handleSubmit}
        >
          <Field>
            <FieldLabel htmlFor="add-manageduser-display-name">
              Display name
            </FieldLabel>
            <Input
              id="add-manageduser-display-name"
              data-testid="add-manageduser-display-name"
              value={displayName}
              maxLength={100}
              onChange={(e) => setDisplayName(e.target.value)}
              aria-invalid={
                trimmedName.length === 0 && displayName.length > 0
                  ? true
                  : nameTooLong
                    ? true
                    : undefined
              }
            />
            {trimmedName.length === 0 && displayName.length > 0 && (
              <p className="text-sm text-destructive">
                Display name is required
              </p>
            )}
            {nameTooLong && (
              <p className="text-sm text-destructive">
                Display name must be at most 100 characters
              </p>
            )}
          </Field>

          <SelectField
            id="add-manageduser-grade"
            name="currentGrade"
            label="Grade"
            required
            placeholder="Select grade"
            data-testid="add-manageduser-grade"
            value={gradeValue}
            onValueChange={setGradeValue}
            options={gradeSelectOptions}
          />

          {mutation.isError && (
            <p role="alert" className="text-sm text-destructive">
              {mutation.error.message ||
                'Could not add manageduser. Please try again.'}
            </p>
          )}
        </form>

        <SheetFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form={FORM_ID}
            disabled={submitDisabled}
            data-testid="add-manageduser-submit"
          >
            {mutation.isPending ? 'Adding…' : 'Add ManagedUser'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default AddManagedUserSheet;
