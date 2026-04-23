import SelectField, {
  type SelectFieldOption,
} from '@/components/fields/select-field';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  HOMESCHOOL_CURRICULUM_OPTIONS,
  HOMESCHOOL_GRADE_OPTIONS,
} from '@/lib/homeschool-options';
import {
  ANY_GRADE_VALUE,
  getMaxConsecutiveGradesForSubject,
  homeschoolGradeOptionsWithinSpanLimit,
  reconcileGradesAfterMultiSelect,
  rowGradeSpanViolationMessage,
  selectedGradesConsecutiveSpan,
  type GetTeachableSubject,
  type TeachableCourseDraft,
} from '@/lib/teachable-course-validation';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { useMemo } from 'react';
import Select, {
  type MultiValue,
  type StylesConfig,
  type ThemeConfig,
} from 'react-select';

type GradeOption = { value: string; label: string };

const GRADE_OPTIONS_WITH_ANY: GradeOption[] = [
  ...HOMESCHOOL_GRADE_OPTIONS,
  { value: ANY_GRADE_VALUE, label: 'Any' },
];

const gradeSelectTheme: ThemeConfig = (theme) => ({
  ...theme,
  borderRadius: 6,
  colors: {
    ...theme.colors,
    primary: '#8b7355',
    primary25: '#ebe4d9',
    primary50: '#e7ddd0',
    neutral20: '#e7e5e4',
    neutral30: '#d6d3d1',
  },
});

const gradeSelectStyles: StylesConfig<GradeOption, true> = {
  control: (base, state) => ({
    ...base,
    minHeight: 36,
    backgroundColor: '#f5f1eb',
    borderColor: state.isFocused ? '#a89878' : '#e7e5e4',
    boxShadow: state.isFocused ? '0 0 0 3px rgba(139, 115, 85, 0.2)' : 'none',
    '&:hover': { borderColor: '#a89878' },
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: '#faf8f5',
    border: '1px solid #e7e5e4',
    boxShadow:
      '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.07)',
  }),
  option: (base, state) => ({
    ...base,
    cursor: 'pointer',
    backgroundColor: state.isSelected
      ? '#8b7355'
      : state.isFocused
        ? '#ebe4d9'
        : 'transparent',
    color: state.isSelected ? '#fff' : '#1c1917',
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: '#e7ddd0',
    borderRadius: 4,
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: '#44403c',
    fontSize: '0.875rem',
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: '#57534e',
    ':hover': { backgroundColor: '#d6d3d1', color: '#1c1917' },
  }),
  placeholder: (base) => ({ ...base, color: '#78716c', fontSize: '0.875rem' }),
  input: (base) => ({ ...base, fontSize: '0.875rem' }),
  singleValue: (base) => ({ ...base, fontSize: '0.875rem' }),
};

export type CourseFormRowProps = {
  row: TeachableCourseDraft;
  subjectOptions: SelectFieldOption[];
  getSubject: GetTeachableSubject;
  subjectsLoading?: boolean;
  beigeSelectClassName: string;
  onChangePatch: (patch: Partial<TeachableCourseDraft>) => void;
  showRemove: boolean;
  onRemove: () => void;
};

export default function CourseFormRow({
  row,
  subjectOptions,
  getSubject,
  subjectsLoading = false,
  beigeSelectClassName,
  onChangePatch,
  showRemove,
  onRemove,
}: CourseFormRowProps) {
  const selectedSubject = getSubject(row.subjectId);
  const allowAnyGrade = selectedSubject?.isEnrichment === true;
  const subjectResolved = Boolean(
    row.subjectId.trim().length > 0 && selectedSubject,
  );
  const spanLimit = selectedSubject
    ? getMaxConsecutiveGradesForSubject(selectedSubject)
    : null;

  const gradeOptions = useMemo((): GradeOption[] => {
    if (!subjectResolved) return [];

    if (allowAnyGrade) return GRADE_OPTIONS_WITH_ANY;

    const limited = homeschoolGradeOptionsWithinSpanLimit(row.grades, spanLimit);
    const byValue = new Map(
      HOMESCHOOL_GRADE_OPTIONS.map((o) => [o.value, o] as const),
    );
    const out: GradeOption[] = [...limited];
    for (const g of row.grades) {
      if (g === ANY_GRADE_VALUE) continue;

      if (!out.some((o) => o.value === g)) {
        const o = byValue.get(g);
        if (o) out.push(o);
      }
    }

    return out;
  }, [subjectResolved, allowAnyGrade, row.grades, spanLimit]);

  const gradeValue: MultiValue<GradeOption> = useMemo(() => {
    return row.grades
      .map((v) => gradeOptions.find((o) => o.value === v))
      .filter(Boolean) as GradeOption[];
  }, [row.grades, gradeOptions]);

  const showAnyHint =
    allowAnyGrade &&
    row.grades.length === 1 &&
    row.grades[0] === ANY_GRADE_VALUE;

  const gradeSpanWarning = rowGradeSpanViolationMessage(row, getSubject);

  const beigeInputClassName =
    'border-stone-200 bg-[#f5f1eb] h-9 text-sm shadow-xs md:text-sm';

  return (
    <div
      className={cn(
        'relative rounded-xl border border-stone-200 bg-white p-4 shadow-xs',
      )}
    >
      {showRemove && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute top-2 right-2"
          aria-label="Remove course"
          onClick={onRemove}
        >
          <X className="size-4" />
        </Button>
      )}

      <div className="grid gap-3 sm:grid-cols-1">
        <Field className="gap-1.5">
          <FieldLabel htmlFor={`class-name-${row.id}`}>Class name</FieldLabel>
          <Input
            id={`class-name-${row.id}`}
            name={`class-name-${row.id}`}
            data-testid={`class-name-${row.id}`}
            value={row.className}
            placeholder="e.g. Algebra I"
            className={cn(beigeInputClassName)}
            onChange={(e) => onChangePatch({ className: e.target.value })}
            disabled={subjectsLoading}
          />
        </Field>

        <SelectField
          label="Subject"
          id={`subj-${row.id}`}
          options={subjectOptions}
          placeholder="Select subject"
          value={row.subjectId}
          onValueChange={(v) => {
            const subj = getSubject(v);
            const allow = subj?.isEnrichment === true;
            let nextGrades = row.grades;
            if (!allow && nextGrades.includes(ANY_GRADE_VALUE)) {
              nextGrades = nextGrades.filter((g) => g !== ANY_GRADE_VALUE);
            }

            if (subj && !subj.isEnrichment) {
              const lim = getMaxConsecutiveGradesForSubject(subj);
              const sp = selectedGradesConsecutiveSpan(nextGrades);
              if (lim !== null && sp !== null && sp > lim) {
                nextGrades = [];
              }
            }

            onChangePatch({ subjectId: v, grades: nextGrades });
          }}
          selectClassName={beigeSelectClassName}
          className="gap-1.5"
          disabled={subjectsLoading}
        />

        <Field className="gap-1.5">
          <FieldLabel htmlFor={`grade-select-${row.id}`}>Grade</FieldLabel>
          <div data-testid={`select-grade-${row.id}`}>
            <Select<GradeOption, true>
              inputId={`grade-select-${row.id}`}
              instanceId={`grade-select-${row.id}`}
              isMulti
              options={gradeOptions}
              value={gradeValue}
              placeholder={
                subjectResolved ? 'Select grade(s)' : 'Select a subject first'
              }
              isDisabled={subjectsLoading || !subjectResolved}
              closeMenuOnSelect={false}
              hideSelectedOptions={false}
              classNamePrefix="teachable-grade"
              theme={gradeSelectTheme}
              styles={gradeSelectStyles}
              onChange={(next: MultiValue<GradeOption>) => {
                const nextVals = (next ?? []).map((o) => o.value);
                const reconciled = reconcileGradesAfterMultiSelect(
                  row.grades,
                  nextVals,
                  allowAnyGrade,
                );
                onChangePatch({ grades: reconciled });
              }}
              aria-invalid={undefined}
            />
          </div>
          {gradeSpanWarning && (
            <p
              className="text-destructive text-xs leading-snug"
              data-testid={`grade-span-warning-${row.id}`}
            >
              {gradeSpanWarning}
            </p>
          )}
          {showAnyHint && (
            <p className="text-muted-foreground text-xs leading-snug">
              Selecting &apos;Any&apos; will show your class to all students
              regardless of age.
            </p>
          )}
          {gradeValue && (
            // TODO: get the number of teachers covering this subject and grade from the API
            <p className="text-muted-foreground text-xs leading-snug">
              There are currently 10 teachers offering to teach this subject and grade at your zip code.
            </p>
          )}
        </Field>

        <Field className="gap-1.5">
          <FieldLabel htmlFor={`max-students-${row.id}`}>
            Max students
          </FieldLabel>
          <Input
            id={`max-students-${row.id}`}
            type="number"
            min={1}
            max={20}
            inputMode="numeric"
            data-testid={`max-students-${row.id}`}
            value={String(Number.isFinite(row.maxStudents) ? row.maxStudents : 1)}
            className={cn(beigeInputClassName)}
            onChange={(e) => {
              const raw = e.target.value;
              if (raw === '') {
                onChangePatch({ maxStudents: 1 });
                return;
              }
              const n = Number.parseInt(raw, 10);
              if (!Number.isFinite(n)) return;
              onChangePatch({
                maxStudents: Math.min(20, Math.max(1, n)),
              });
            }}
            disabled={subjectsLoading}
          />
          <p className="text-muted-foreground text-xs leading-snug">
            Maximum concurrent students for this course (1–20).
          </p>
        </Field>

        <SelectField
          label="Curriculum"
          tooltip="The curriculum you select you will use for your class materials. You can access these for free using our portal."
          id={`curr-${row.id}`}
          options={HOMESCHOOL_CURRICULUM_OPTIONS}
          placeholder="Select curriculum"
          value={row.curriculum}
          onValueChange={(v) => onChangePatch({ curriculum: v })}
          selectClassName={beigeSelectClassName}
          className="gap-1.5"
          disabled={subjectsLoading}
        />
        <div className="text-xs leading-snug text-muted-foreground">Read more about these curriculum options <Button className="text-xs leading-snug -mt-3" variant="link" onClick={() => {
          window.open('https://www.google.com', '_blank');
        }}>here</Button>.</div>
      </div>
    </div >
  );
}
