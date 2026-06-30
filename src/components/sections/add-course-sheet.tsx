import { useMemo, useState } from 'react';
import type { Subject } from '@/api/services/subjects.services';
import SelectField, {
  type SelectFieldOption,
} from '@/components/fields/select-field';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { TooltipProvider } from '@/components/ui/tooltip';
import useAddTeachableSubject from '@/hooks/use-add-teachable-subject';
import {
  HOMESCHOOL_CURRICULUM_OPTIONS,
  HOMESCHOOL_GRADE_OPTIONS,
} from '@/lib/homeschool-options';
import {
  TEACHABLE_GRADE_OPTIONS_WITH_ANY,
  teachableGradeSelectStyles,
  teachableGradeSelectTheme,
  type TeachableGradeOption,
} from '@/lib/teachable-grade-react-select';
import {
  ANY_GRADE_VALUE,
  draftGradesToApiPayload,
  getMaxConsecutiveGradesForSubject,
  homeschoolGradeOptionsWithinSpanLimit,
  reconcileGradesAfterMultiSelect,
  rowGradeSpanViolationMessage,
  rowIsComplete,
  selectedGradesConsecutiveSpan,
  type TeachableCourseDraftLike,
} from '@/lib/teachable-course-validation';
import { cn } from '@/lib/utils';
import Select, { type MultiValue } from 'react-select';

type AddCourseSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjects: Subject[];
};

type FormState = Omit<TeachableCourseDraftLike, never>;

const emptyForm = (): FormState => ({
  className: '',
  subjectId: '',
  grades: [],
  curriculum: '',
  maxStudents: 1,
});

const beigeSelectClassName =
  'border-stone-200 bg-[#f5f1eb] h-9 w-full rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50';

const beigeInputClassName =
  'border-stone-200 bg-[#f5f1eb] h-9 text-sm shadow-xs md:text-sm';

const SHEET_FORM_ID = 'add-course-sheet-form';

const AddCourseSheet = ({
  open,
  onOpenChange,
  subjects,
}: AddCourseSheetProps) => {
  const [form, setForm] = useState<FormState>(emptyForm());
  const mutation = useAddTeachableSubject();

  const selectedSubject = subjects.find((s) => s._id === form.subjectId);
  const subjectResolved = Boolean(
    form.subjectId.trim().length > 0 && selectedSubject,
  );
  const allowAnyGrade = selectedSubject?.isEnrichment === true;
  const spanLimit = selectedSubject
    ? getMaxConsecutiveGradesForSubject({
        slug: selectedSubject.slug,
        name: selectedSubject.name,
        isEnrichment: selectedSubject.isEnrichment,
      })
    : null;

  const subjectSelectOptions = useMemo((): SelectFieldOption[] => {
    return subjects.map((s) => ({ value: s._id, label: s.name }));
  }, [subjects]);

  const gradeOptionsForSelect = useMemo((): TeachableGradeOption[] => {
    if (!subjectResolved) return [];

    if (allowAnyGrade) return TEACHABLE_GRADE_OPTIONS_WITH_ANY;

    const limited = homeschoolGradeOptionsWithinSpanLimit(
      form.grades,
      spanLimit,
    );
    const byValue = new Map(
      HOMESCHOOL_GRADE_OPTIONS.map((o) => [o.value, o] as const),
    );
    const out: TeachableGradeOption[] = [...limited];
    for (const g of form.grades) {
      if (g === ANY_GRADE_VALUE) continue;

      if (!out.some((o) => o.value === g)) {
        const o = byValue.get(g);
        if (o) out.push(o);
      }
    }

    return out;
  }, [subjectResolved, allowAnyGrade, form.grades, spanLimit]);

  const gradeValue: MultiValue<TeachableGradeOption> = useMemo(() => {
    return form.grades
      .map((v) => gradeOptionsForSelect.find((o) => o.value === v))
      .filter(Boolean) as TeachableGradeOption[];
  }, [form.grades, gradeOptionsForSelect]);

  const showAnyHint =
    allowAnyGrade &&
    form.grades.length === 1 &&
    form.grades[0] === ANY_GRADE_VALUE;

  const getSubject = (subjectId: string) => {
    const s = subjects.find((sub) => sub._id === subjectId);
    if (!s) return undefined;
    return { slug: s.slug, name: s.name, isEnrichment: s.isEnrichment };
  };

  const isFormValid = rowIsComplete(form, getSubject);
  const spanViolationMessage = rowGradeSpanViolationMessage(form, getSubject);

  const handleSubjectChange = (subjectId: string) => {
    setForm((prev) => {
      const subj = subjects.find((s) => s._id === subjectId);
      const allow = subj?.isEnrichment === true;
      let nextGrades = prev.grades;

      if (!allow && nextGrades.includes(ANY_GRADE_VALUE)) {
        nextGrades = nextGrades.filter((g) => g !== ANY_GRADE_VALUE);
      }

      if (subj && !subj.isEnrichment) {
        const lim = getMaxConsecutiveGradesForSubject({
          slug: subj.slug,
          name: subj.name,
          isEnrichment: subj.isEnrichment,
        });
        const sp = selectedGradesConsecutiveSpan(nextGrades);

        if (lim !== null && sp !== null && sp > lim) {
          nextGrades = [];
        }
      }

      return { ...prev, subjectId, grades: nextGrades };
    });
  };

  const handleGradeChange = (next: MultiValue<TeachableGradeOption>) => {
    const nextVals = (next ?? []).map((o) => o.value);

    const reconciled = reconcileGradesAfterMultiSelect(
      form.grades,
      nextVals,
      allowAnyGrade,
    );

    setForm((prev) => ({ ...prev, grades: reconciled }));
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setForm(emptyForm());
      mutation.reset();
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || mutation.isPending) return;

    const { matchesAllGrades, grades } = draftGradesToApiPayload(form.grades);

    mutation.mutate(
      {
        className: form.className,
        subjectId: form.subjectId,
        matchesAllGrades,
        grades,
        curriculum: form.curriculum,
        maxStudents: form.maxStudents,
      },
      {
        onSuccess: () => {
          setForm(emptyForm());
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <TooltipProvider>
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Add Course</SheetTitle>
            <SheetDescription>
              Fill in the details below to add a new teachable course to your
              profile.
            </SheetDescription>
          </SheetHeader>

          <form
            id={SHEET_FORM_ID}
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 px-4 overflow-y-auto flex-1"
          >
            <Field className="gap-1.5">
              <FieldLabel htmlFor="add-course-classname">Class name</FieldLabel>
              <Input
                id="add-course-classname"
                type="text"
                name="add-course-classname"
                data-testid="input-add-course-classname"
                value={form.className}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, className: e.target.value }))
                }
                placeholder="e.g. Algebra I"
                className={cn(beigeInputClassName)}
                autoComplete="off"
              />
            </Field>

            <SelectField
              label="Subject"
              id="add-course-subject"
              data-testid="add-course-subject"
              options={subjectSelectOptions}
              placeholder="Select subject"
              value={form.subjectId}
              onValueChange={handleSubjectChange}
              selectClassName={beigeSelectClassName}
              className="gap-1.5"
            />

            <Field className="gap-1.5">
              <FieldLabel htmlFor="add-course-grade-select">Grade</FieldLabel>
              <div data-testid="add-course-grade-select">
                <Select<TeachableGradeOption, true>
                  inputId="add-course-grade-select"
                  instanceId="add-course-grade-select"
                  isMulti
                  options={gradeOptionsForSelect}
                  value={gradeValue}
                  placeholder={
                    subjectResolved
                      ? 'Select grade(s)'
                      : 'Select a subject first'
                  }
                  isDisabled={!subjectResolved}
                  closeMenuOnSelect={false}
                  hideSelectedOptions={false}
                  classNamePrefix="teachable-grade"
                  theme={teachableGradeSelectTheme}
                  styles={teachableGradeSelectStyles}
                  onChange={handleGradeChange}
                />
              </div>
              {spanViolationMessage && (
                <p
                  className="text-destructive text-xs leading-snug"
                  data-testid="grade-span-warning-add-course"
                  role="alert"
                >
                  {spanViolationMessage}
                </p>
              )}
              {showAnyHint && (
                <p className="text-muted-foreground text-xs leading-snug">
                  Selecting &apos;Any&apos; will show your class to all students
                  regardless of age.
                </p>
              )}
              {gradeValue && (
                <p className="text-muted-foreground text-xs leading-snug">
                  There are currently 10 teachers offering to teach this subject
                  and grade at your zip code.
                </p>
              )}
            </Field>

            <Field className="gap-1.5">
              <FieldLabel htmlFor="add-course-maxstudents">
                Max students
              </FieldLabel>
              <Input
                id="add-course-maxstudents"
                type="number"
                name="add-course-maxstudents"
                inputMode="numeric"
                min={1}
                max={20}
                data-testid="input-add-course-maxstudents"
                value={String(
                  Number.isFinite(form.maxStudents) ? form.maxStudents : 1,
                )}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw === '') {
                    setForm((prev) => ({ ...prev, maxStudents: 1 }));
                    return;
                  }
                  const n = Number.parseInt(raw, 10);
                  if (!Number.isFinite(n)) return;
                  setForm((prev) => ({
                    ...prev,
                    maxStudents: Math.min(20, Math.max(1, n)),
                  }));
                }}
                className={cn(beigeInputClassName)}
                autoComplete="off"
              />
              <p className="text-muted-foreground text-xs leading-snug">
                Maximum concurrent students for this course (1–20).
              </p>
            </Field>

            <SelectField
              label="Curriculum"
              tooltip="The curriculum you select you will use for your class materials. You can access these for free using our portal."
              id="add-course-curriculum"
              data-testid="add-course-curriculum"
              options={HOMESCHOOL_CURRICULUM_OPTIONS}
              placeholder="Select curriculum"
              value={form.curriculum}
              onValueChange={(v) =>
                setForm((prev) => ({ ...prev, curriculum: v }))
              }
              selectClassName={beigeSelectClassName}
              className="gap-1.5"
            />
            <div className="text-muted-foreground text-xs leading-snug">
              Read more about these curriculum options{' '}
              <Button
                className="-mt-3 text-xs leading-snug"
                type="button"
                variant="link"
                onClick={() => {
                  window.open('https://www.google.com', '_blank');
                }}
              >
                here
              </Button>
              .
            </div>
          </form>

          <SheetFooter className="flex-col items-stretch gap-2">
            {mutation.isError && (
              <p
                className="text-sm text-destructive"
                role="alert"
                data-testid="add-course-mutation-error"
              >
                {mutation.error?.message ??
                  'An error occurred. Please try again.'}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={mutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form={SHEET_FORM_ID}
                disabled={!isFormValid || mutation.isPending}
                isPending={mutation.isPending}
              >
                Add Course
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </TooltipProvider>
  );
};

export default AddCourseSheet;
