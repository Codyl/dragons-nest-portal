import { useAccountSetupForm } from '@/components/forms/account-setup.form';
import InputField from '@/components/fields/input-field';
import SelectField from '@/components/fields/select-field';
import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import { cn } from '@/lib/utils';
import { MapPin } from 'lucide-react';
import AccountSetupCard from '@/components/cards/account-setup-card';
import { AVATAR_OPTIONS } from '@/utils/constants/account-setup.constants';
import { FieldError } from '@/components/ui/field';
import { US_STATE_OPTIONS } from '@/lib/us-state-options';
import { ageFromBirthMonthYear } from '@/lib/signup-age';
import { readSignupBirthFromSession } from '@/utils/constants/signup.constants';
import { useEffect, useMemo } from 'react';
const AccountSetupComplianceStep = ({ onNext }: { onNext: () => void }) => {
  const { form } = useAccountSetupForm();

  const suggestedAge = useMemo(() => {
    const { month, year } = readSignupBirthFromSession();
    if (month == null || year == null) return '';
    const a = ageFromBirthMonthYear(month, year);
    return Number.isFinite(a) ? String(a) : '';
  }, []);

  useEffect(() => {
    if (suggestedAge && !String(form.getFieldValue('age') ?? '').trim()) {
      form.setFieldValue('age', suggestedAge);
    }
  }, [form, suggestedAge]);

  const beigeInput =
    'border-stone-200 bg-[#f5f1eb] placeholder:text-stone-400 focus-visible:bg-white';

  const tryContinue = async () => {
    const fields = [
      'name',
      'age',
      'state',
      'zipCode',
      'phoneNumber',
      'avatar',
    ] as const;
    await Promise.all(fields.map((f) => form.validateField(f, 'change')));
    for (const n of fields) {
      form.setFieldMeta(n, (prev) => ({ ...prev, isTouched: true }));
    }
    const hasError = fields.some(
      (n) => (form.getFieldMeta(n)?.errors?.length ?? 0) > 0,
    );
    if (!hasError) onNext();
  };

  return (
    <AccountSetupCard
      stepIcon={
        <MapPin
          className="mx-auto h-9 w-9"
          strokeWidth={1.5}
        />
      }
      title="Location & account security"
      subtitle="We use this for state rules, to find instructors near you, and to add a phone number for account recovery."
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
              String(value).trim().length === 0
                ? 'Name is required'
                : undefined,
          }}
        >
          {(field) => (
            <InputField
              field={field}
              label="Preferred name"
              placeholder="How should we address you?"
              required
              inputClassName={beigeInput}
              className="gap-1.5"
              data-testid="input-name"
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
              label="Age"
              placeholder="Your age in years"
              inputMode="numeric"
              required
              inputClassName={beigeInput}
              className="gap-1.5"
              data-testid="input-age"
            />
          )}
        </form.Field>
        <form.Field
          name="state"
          validators={{
            onChange: ({ value }) =>
              String(value).trim().length === 0
                ? 'Select your state'
                : undefined,
          }}
        >
          {(field) => (
            <div className="space-y-1.5">
              <SelectField
                field={field}
                label="State"
                id="account-setup-state"
                options={US_STATE_OPTIONS}
                placeholder="Select state"
                selectClassName={cn(
                  'h-9 w-full rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
                  beigeInput,
                )}
                labelClassName="text-sm font-medium text-stone-900"
                data-testid="input-state"
                className="gap-1.5"
              />
              {field.state.value && <Button variant="link" onClick={() => window.open(`https://hslda.org/legal/${US_STATE_OPTIONS.find(s => s.value === field.state.value)?.label.toLowerCase().replace(' ', '-')}`, '_blank')}>Learn more about the homeschool laws in {US_STATE_OPTIONS.find(s => s.value === field.state.value)?.label}</Button>}
            </div>
          )}
        </form.Field>
        <form.Field
          name="zipCode"
          validators={{
            onChange: ({ value }) => {
              const v = String(value).trim();
              if (v.length === 0) return 'ZIP code is required';
              if (!/^\d{5}$/.test(v)) return 'Enter a valid 5-digit ZIP';
              return undefined;
            },
          }}
        >
          {(field) => (
            <InputField
              field={field}
              label="ZIP code"
              placeholder="12345"
              inputMode="numeric"
              maxLength={5}
              required
              inputClassName={beigeInput}
              className="gap-1.5"
              data-testid="input-zip"
            />
          )}
        </form.Field>
        <form.Field
          name="phoneNumber"
          validators={{
            onChange: ({ value }) => {
              const v = String(value).trim();
              if (v.length === 0) return 'Phone number is required';
              const digits = v.replace(/\D/g, '');
              if (digits.length < 10) return 'Enter a valid US phone number';
              return undefined;
            },
          }}
        >
          {(field) => (
            <InputField
              field={field}
              label="Mobile phone"
              placeholder="(555) 555-5555"
              inputMode="tel"
              autoComplete="tel"
              required
              inputClassName={beigeInput}
              className="gap-1.5"
              data-testid="input-phone"
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

export default AccountSetupComplianceStep;
