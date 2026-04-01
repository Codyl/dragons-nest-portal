import { useAccountSetupForm } from '@/components/forms/account-setup.form';
import InputField from '@/components/fields/input-field';
import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import { cn } from '@/lib/utils';
import { Crown } from 'lucide-react';
import AccountSetupCard from '@/components/cards/account-setup-card';
import { AVATAR_OPTIONS } from '@/utils/constants/account-setup.constants';
import { FieldError } from '@/components/ui/field';

const AccountSetupProfileStep = ({ onNext }: { onNext: () => void }) => {
  const { form } = useAccountSetupForm();

  const tryContinue = async () => {
    await Promise.all([
      form.validateField('name', 'change'),
      form.validateField('age', 'change'),
      form.validateField('avatar', 'change'),
    ]);
    const names = ['name', 'age', 'avatar'] as const;

    for (const n of names) {
      form.setFieldMeta(n, (prev) => ({ ...prev, isTouched: true }));
    }

    const hasError = names.some(
      (n) => (form.getFieldMeta(n)?.errors?.length ?? 0) > 0,
    );
    if (!hasError) onNext();
  };

  const beigeInput =
    'border-stone-200 bg-[#f5f1eb] placeholder:text-stone-400 focus-visible:bg-white';

  return (
    <AccountSetupCard
      stepIcon={<Crown className="mx-auto h-9 w-9" strokeWidth={1.5} />}
      title="Create Your Profile"
      subtitle="Tell us a bit about yourself"
      footer={
        <Button
          type="button"
          className="h-11 w-full rounded-xl bg-[#8b7355] text-base font-semibold text-white hover:bg-[#7a6549] sm:h-12"
          onClick={tryContinue}
        >
          Continue
        </Button>
      }
    >
      <FieldGroup className="gap-5 text-left">
        <form.Field
          name="name"
          validators={{
            onChange: ({ value }) =>
              String(value).trim().length === 0 ? 'Name is required' : undefined,
          }}
        >
          {(field) => (
            <InputField
              field={field}
              label="What's your name?"
              placeholder="Enter your name"
              required
              inputClassName={beigeInput}
              className="gap-1.5"
            />
          )}
        </form.Field>
        <form.Field
          name="age"
          validators={{
            onChange: ({ value }) => {
              const v = String(value);
              if (v.length === 0) return 'Age is required';

              if (!/^\d+$/.test(v) || Number(v) <= 0) {
                return 'Enter a valid age';
              }

              return undefined;
            },
          }}
        >
          {(field) => (
            <InputField
              field={field}
              label="How old are you?"
              placeholder="Enter your age"
              inputMode="numeric"
              required
              inputClassName={beigeInput}
              className="gap-1.5"
            />
          )}
        </form.Field>
        <form.Field
          name="avatar"
          validators={{
            onChange: ({ value }) =>
              !value || String(value).length === 0
                ? 'Choose an avatar'
                : undefined,
          }}
        >
          {(field) => (
            <div className="space-y-2">
              <p className="text-sm font-medium text-stone-900">
                Choose your avatar
              </p>
              <div
                className="flex flex-wrap gap-2 sm:flex-nowrap sm:justify-between"
                role="listbox"
                aria-label="Avatar choices"
              >
                {AVATAR_OPTIONS.map((opt) => {
                  const selected = field.state.value === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      data-testid={`avatar-${opt.id}`}
                      className={cn(
                        'flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border-2 text-2xl transition-colors sm:h-16 sm:w-16',
                        selected
                          ? 'border-[#8b7355] bg-[#ebe6dc]'
                          : 'border-stone-200 bg-white hover:border-stone-300',
                      )}
                      onClick={() => {
                        field.handleChange(opt.id);
                        field.handleBlur();
                      }}
                    >
                      <span className="sr-only">{opt.label}</span>
                      {opt.emoji}
                    </button>
                  );
                })}
              </div>
              {field.state.meta.isTouched &&
                field.state.meta.errors.length > 0 && (
                  <FieldError
                    data-testid="error-message-avatar"
                    errors={field.state.meta.errors.map((e: unknown) =>
                      typeof e === 'string' ? { message: e } : e,
                    )}
                  />
                )}
            </div>
          )}
        </form.Field>
      </FieldGroup>
    </AccountSetupCard>
  );
};

export default AccountSetupProfileStep;
