import { useAccountSetupForm } from '@/components/forms/account-setup.form';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Sprout } from 'lucide-react';
import AccountSetupCard from '@/components/cards/account-setup-card';
import { INTEREST_OPTIONS } from '@/utils/constants/account-setup.constants';
import { FieldError } from '@/components/ui/field';
import useSubjects from '@/hooks/use-subjects';

const AccountSetupInterestsStep = ({
  onNext,
  onBack,
  isLastStep = false,
}: {
  onNext: () => void;
  onBack: () => void;
  /** When true, complete onboarding (submit) instead of advancing a step. */
  isLastStep?: boolean;
}) => {
  const { form, submitOnboarding } = useAccountSetupForm();
  const {
    data: subjects,
    isLoading: isLoadingSubjects,
    isError: isSubjectsError,
  } = useSubjects();
  const availableSubjects =
    subjects && subjects.length > 0
      ? subjects.map((subject) => ({
          id: subject.slug,
          label: subject.name,
          color: subject.color,
        }))
      : INTEREST_OPTIONS.map((opt) => ({
          id: opt.id,
          label: opt.label,
          color: '#e7e1d8',
        }));

  const tryContinue = async () => {
    await form.validateField('interests', 'change');
    form.setFieldMeta('interests', (prev) => ({ ...prev, isTouched: true }));
    const err = form.getFieldMeta('interests')?.errors?.length ?? 0;
    if (err !== 0) return;
    if (isLastStep) {
      await submitOnboarding();
    } else {
      onNext();
    }
  };

  return (
    <AccountSetupCard
      stepIcon={<Sprout className="mx-auto h-9 w-9" strokeWidth={1.5} />}
      title="What interests you?"
      subtitle="Select all subjects you'd like to explore"
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
            onClick={() => void tryContinue()}
          >
            {isLastStep ? 'Finish setup' : 'Continue'}
          </Button>
        </div>
      }
    >
      <form.Field
        name="interests"
        validators={{
          onChange: ({ value }) =>
            value.length === 0 ? 'Select at least one subject' : undefined,
        }}
      >
        {(field) => {
          const selected = new Set(field.state.value);

          const toggle = (id: string) => {
            const next = selected.has(id)
              ? field.state.value.filter((x: string) => x !== id)
              : [...field.state.value, id];
            field.handleChange(next);
            field.handleBlur();
          };

          return (
            <div className="space-y-2 text-left">
              {(isLoadingSubjects || isSubjectsError) && (
                <p className="text-muted-foreground text-xs">
                  {isLoadingSubjects
                    ? 'Loading subjects...'
                    : 'Could not load subjects, showing defaults.'}
                </p>
              )}
              <div className="grid grid-cols-2 gap-3">
                {availableSubjects.map((subject) => {
                  const isOn = selected.has(subject.id);
                  return (
                    <button
                      key={subject.id}
                      type="button"
                      data-testid={`interest-${subject.id}`}
                      aria-pressed={isOn}
                      className={cn(
                        'flex flex-col items-start gap-2 rounded-xl border-2 p-3 text-left transition-colors',
                        isOn
                          ? 'border-[#8b7355] bg-[#f9f6f1]'
                          : 'border-stone-200 bg-white hover:border-stone-300',
                      )}
                      onClick={() => toggle(subject.id)}
                    >
                      <div
                        className="flex size-9 items-center justify-center rounded-lg border text-xs font-semibold uppercase text-stone-800"
                        style={{
                          backgroundColor: subject.color || '#e7e1d8',
                        }}
                      >
                        {subject.label.slice(0, 1)}
                      </div>
                      <span className="text-sm font-medium leading-snug text-stone-900">
                        {subject.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              {field.state.meta.isTouched &&
                field.state.meta.errors.length > 0 && (
                  <FieldError
                    data-testid="error-message-interests"
                    errors={
                      field.state.meta.errors.map((e: unknown) =>
                        typeof e === 'string' ? { message: e } : e,
                      ) as { message?: string }[]
                    }
                  />
                )}
            </div>
          );
        }}
      </form.Field>
    </AccountSetupCard>
  );
};

export default AccountSetupInterestsStep;
