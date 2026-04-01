import { useAccountSetupForm } from '@/components/forms/account-setup.form';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Target } from 'lucide-react';
import AccountSetupCard from '@/components/cards/account-setup-card';
import { LEARNING_STYLE_OPTIONS } from '@/utils/constants/account-setup.constants';

const AccountSetupGoalsStep = ({
  onBack,
}: {
  onBack: () => void;
}) => {
  const { form } = useAccountSetupForm();

  return (
    <AccountSetupCard
      stepIcon={<Target className="mx-auto h-9 w-9" strokeWidth={1.5} />}
      title="What are your goals?"
      subtitle="Help us guide your learning journey"
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
            type="submit"
            className="h-11 min-w-0 flex-1 rounded-xl bg-[#8b7355] text-base font-semibold text-white hover:bg-[#7a6549]"
          >
            Continue
          </Button>
        </div>
      }
    >
      <FieldGroup className="gap-6 text-left">
        <form.Field name="shortTermGoal">
          {(field) => (
            <Field className="gap-1.5">
              <FieldLabel htmlFor={field.name}>
                Short-term goal (optional)
              </FieldLabel>
              <FieldDescription>
                Something you&apos;d like to achieve soon
              </FieldDescription>
              <Input
                id={field.name}
                data-testid={`input-${field.name}`}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="e.g., Learn basic biology concepts"
                autoComplete="off"
                className={cn(
                  'h-10 rounded-lg border-stone-200 bg-[#f5f1eb] text-base placeholder:text-stone-400 focus-visible:bg-white md:text-sm',
                )}
              />
            </Field>
          )}
        </form.Field>

        <form.Field name="longTermGoal">
          {(field) => (
            <Field className="gap-1.5">
              <FieldLabel htmlFor={field.name}>
                Long-term goal (optional)
              </FieldLabel>
              <FieldDescription>
                Where you want to be in the future
              </FieldDescription>
              <Input
                id={field.name}
                data-testid={`input-${field.name}`}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="e.g., Become a scientist or explore nature careers"
                autoComplete="off"
                className={cn(
                  'h-10 rounded-lg border-stone-200 bg-[#f5f1eb] text-base placeholder:text-stone-400 focus-visible:bg-white md:text-sm',
                )}
              />
            </Field>
          )}
        </form.Field>

        <form.Field name="learningStyles">
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
              <Field className="gap-2">
                <FieldLabel>How do you like to learn? (optional)</FieldLabel>
                <FieldDescription>
                  We&apos;ll suggest paths that match your style
                </FieldDescription>
                <div className="grid grid-cols-2 gap-3">
                  {LEARNING_STYLE_OPTIONS.map((opt) => {
                    const isOn = selected.has(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        data-testid={`learning-${opt.id}`}
                        className={cn(
                          'rounded-xl border-2 px-3 py-3 text-left text-sm font-medium transition-colors',
                          isOn
                            ? 'border-[#8b7355] bg-[#f9f6f1] text-stone-900'
                            : 'border-stone-200 bg-white text-stone-800 hover:border-stone-300',
                        )}
                        onClick={() => toggle(opt.id)}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </Field>
            );
          }}
        </form.Field>
      </FieldGroup>
    </AccountSetupCard>
  );
};

export default AccountSetupGoalsStep;
