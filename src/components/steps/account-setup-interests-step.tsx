import { useAccountSetupForm } from '@/components/forms/account-setup.form';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Sprout } from 'lucide-react';
import AccountSetupCard from '@/components/cards/account-setup-card';
import { INTEREST_OPTIONS } from '@/utils/constants/account-setup.constants';
import { FieldError } from '@/components/ui/field';

const AccountSetupInterestsStep = ({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) => {
  const { form } = useAccountSetupForm();

  const tryContinue = async () => {
    await form.validateField('interests', 'change');
    form.setFieldMeta('interests', (prev) => ({ ...prev, isTouched: true }));
    const err = form.getFieldMeta('interests')?.errors?.length ?? 0;
    if (err === 0) onNext();
  };

  return (
    <AccountSetupCard
      stepIcon={<Sprout className="mx-auto h-9 w-9" strokeWidth={1.5} />}
      title="What interests you?"
      subtitle="Select all topics you'd like to explore"
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
            onClick={tryContinue}
          >
            Continue
          </Button>
        </div>
      }
    >
      <form.Field
        name="interests"
        validators={{
          onChange: ({ value }) =>
            value.length === 0 ? 'Select at least one topic' : undefined,
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
              <div className="grid grid-cols-2 gap-3">
                {INTEREST_OPTIONS.map((opt) => {
                  const isOn = selected.has(opt.id);
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      data-testid={`interest-${opt.id}`}
                      aria-pressed={isOn}
                      className={cn(
                        'flex flex-col items-start gap-2 rounded-xl border-2 p-3 text-left transition-colors',
                        isOn
                          ? 'border-[#8b7355] bg-[#f9f6f1]'
                          : 'border-stone-200 bg-white hover:border-stone-300',
                      )}
                      onClick={() => toggle(opt.id)}
                    >
                      <div
                        className={cn(
                          'flex size-9 items-center justify-center rounded-lg',
                          opt.swatchClass,
                        )}
                      >
                        <Icon className="size-4" strokeWidth={2} />
                      </div>
                      <span className="text-sm font-medium leading-snug text-stone-900">
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              {field.state.meta.isTouched &&
                field.state.meta.errors.length > 0 && (
                  <FieldError
                    data-testid="error-message-interests"
                    errors={field.state.meta.errors.map((e: unknown) =>
                      typeof e === 'string' ? { message: e } : e,
                    )}
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
