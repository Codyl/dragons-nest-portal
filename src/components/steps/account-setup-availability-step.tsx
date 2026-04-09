import { useAccountSetupForm } from '@/components/forms/account-setup.form';
import AccountSetupCard from '@/components/cards/account-setup-card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  applyAvailabilityPreset,
  buildTimeSelectOptions,
  newAvailabilitySlot,
  presetSummaryLabel,
  validateWeeklyAvailabilityDraft,
  type AccountAvailabilityPreset,
  type AvailabilityPreset,
  type DayAvailabilityDraft,
  WEEKDAY_KEYS,
  WEEKDAY_LABELS,
} from '@/lib/weekly-availability';
import { BusFront, CalendarClock, CloudSun, Plus, School, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

const TIME_OPTIONS = buildTimeSelectOptions();

const PRESETS: {
  id: AvailabilityPreset;
  label: string;
  icon: typeof CloudSun;
}[] = [
    { id: 'anytime', label: 'Anytime', icon: CloudSun },
    { id: 'school_hours', label: 'School hours', icon: School },
    { id: 'after_school', label: 'After school', icon: BusFront },
  ];

function setWeeklyAvailability(
  prev: DayAvailabilityDraft[],
  day: (typeof WEEKDAY_KEYS)[number],
  updater: (slots: DayAvailabilityDraft['slots']) => DayAvailabilityDraft['slots'],
): DayAvailabilityDraft[] {
  return prev.map((row) =>
    row.day === day ? { ...row, slots: updater(row.slots) } : row,
  );
}

const AccountSetupAvailabilityStep = ({
  variant,
  onBack,
  onNext,
  isLastStep,
}: {
  variant: 'parent' | 'teen';
  onBack: () => void;
  onNext: () => void;
  isLastStep: boolean;
}) => {
  const { form, submitOnboarding } = useAccountSetupForm();
  const [localError, setLocalError] = useState<string | null>(null);

  const title =
    variant === 'parent'
      ? 'Contact availability'
      : 'Class availability';
  const subtitle =
    variant === 'parent'
      ? 'When teachers or students can reach you. You can change this later in settings.'
      : 'When you are typically available for classes. You can change this later in settings.';

  const tryContinue = async () => {
    setLocalError(null);
    const days = form.getFieldValue('weeklyAvailability');
    const msg = validateWeeklyAvailabilityDraft(days);
    if (msg) {
      setLocalError(msg);
      return;
    }

    await form.validateField('weeklyAvailability', 'change');
    const errs = form.getFieldMeta('weeklyAvailability')?.errors?.length ?? 0;
    if (errs !== 0) return;

    if (isLastStep) {
      await submitOnboarding();
    } else {
      onNext();
    }
  };

  const applyPreset = (preset: AvailabilityPreset) => {
    setLocalError(null);
    form.setFieldValue('availabilityPreset', preset);
    form.setFieldValue('weeklyAvailability', applyAvailabilityPreset(preset));
  };

  const markCustom = () => {
    form.setFieldValue('availabilityPreset', 'custom');
  };

  const tzLabel = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone ?? '';
    } catch {
      return '';
    }
  }, []);

  return (
    <AccountSetupCard
      stepIcon={
        <CalendarClock
          className="mx-auto h-9 w-9"
          strokeWidth={1.5}
        />
      }
      title={title}
      subtitle={subtitle}
      footer={
        <div className="space-y-2">
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
              data-testid="account-setup-availability-continue"
              className="h-11 min-w-0 flex-1 rounded-xl bg-[#8b7355] text-base font-semibold text-white hover:bg-[#7a6549] disabled:opacity-60"
              onClick={() => void tryContinue()}
            >
              {isLastStep ? 'Finish setup' : 'Next'}
            </Button>
          </div>
          {localError && (
            <p
              className="text-destructive text-xs leading-snug"
              data-testid="error-message-weekly-availability"
            >
              {localError}
            </p>
          )}
        </div>
      }
    >
      <form.Field name="availabilityPreset">
        {(presetField) => (
          <form.Field name="weeklyAvailability">
            {(field) => {
              const days = field.state.value as DayAvailabilityDraft[];
              const preset = presetField.state
                .value as AccountAvailabilityPreset;

              return (
                <div className="space-y-6 text-left">
                  <div>
                    <p className="mb-2 text-xs font-medium text-stone-600">
                      Quick presets
                      {tzLabel ? (
                        <span className="text-muted-foreground font-normal">
                          {' '}
                          · {tzLabel}
                        </span>
                      ) : null}
                    </p>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                      {PRESETS.map((p) => {
                        const Icon = p.icon;
                        const selected = preset === p.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            data-testid={`availability-preset-${p.id}`}
                            aria-pressed={selected}
                            className={cn(
                              'flex flex-col items-start gap-1 rounded-xl border-2 p-3 text-left transition-colors',
                              selected
                                ? 'border-[#4B00D1] bg-violet-50 text-[#4B00D1]'
                                : 'border-stone-200 bg-white hover:border-stone-300',
                            )}
                            onClick={() => applyPreset(p.id)}
                          >
                            <Icon
                              className="size-6 shrink-0"
                              strokeWidth={1.5}
                            />
                            <span className="text-sm font-semibold">
                              {p.label}
                            </span>
                            <span
                              className={cn(
                                'text-xs',
                                selected ? 'text-violet-800' : 'text-stone-500',
                              )}
                            >
                              {presetSummaryLabel(p.id)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-medium text-stone-600">
                      Weekly schedule
                    </p>
                    {WEEKDAY_KEYS.map((dayKey) => {
                      const row = days.find((d) => d.day === dayKey);
                      const slots = row?.slots ?? [];

                      return (
                        <div
                          key={dayKey}
                          className="rounded-xl border border-stone-200 bg-white p-3 shadow-xs"
                          data-testid={`availability-day-${dayKey}`}
                        >
                          {slots.length === 0 ? (
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <span className="text-sm font-semibold text-stone-900">
                                {WEEKDAY_LABELS[dayKey]}
                              </span>
                              <span
                                className="text-sm text-stone-700 sm:flex-1"
                                data-testid={`availability-unavailable-${dayKey}`}
                              >
                                Unavailable
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                className="shrink-0 text-[#4B00D1]"
                                aria-label={`Add hours on ${WEEKDAY_LABELS[dayKey]}`}
                                data-testid={`availability-add-${dayKey}`}
                                onClick={() => {
                                  markCustom();
                                  field.handleChange(
                                    setWeeklyAvailability(
                                      days,
                                      dayKey,
                                      () => [newAvailabilitySlot()],
                                    ),
                                  );
                                }}
                              >
                                <Plus className="size-4" />
                              </Button>
                            </div>
                          ) : (
                            <>
                              <p className="mb-2 text-sm font-semibold text-stone-900">
                                {WEEKDAY_LABELS[dayKey]}
                              </p>
                              <div className="space-y-2">
                                {slots.map((slot, slotIdx) => (
                                  <div
                                    key={slot.id}
                                    className="flex flex-wrap items-center gap-2"
                                  >
                                    <select
                                      aria-label={`${WEEKDAY_LABELS[dayKey]} start ${slotIdx + 1}`}
                                      data-testid={`availability-start-${dayKey}-${slotIdx}`}
                                      className="border-stone-200 bg-[#f5f1eb] h-9 min-w-[7rem] flex-1 rounded-md border px-2 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:flex-none sm:min-w-[8.5rem]"
                                      value={slot.start}
                                      onChange={(e) => {
                                        markCustom();
                                        const v = e.target.value;
                                        field.handleChange(
                                          setWeeklyAvailability(
                                            days,
                                            dayKey,
                                            (s) =>
                                              s.map((x, i) =>
                                                i === slotIdx
                                                  ? { ...x, start: v }
                                                  : x,
                                              ),
                                          ),
                                        );
                                      }}
                                    >
                                      {TIME_OPTIONS.map((o) => (
                                        <option
                                          key={o.value}
                                          value={o.value}
                                        >
                                          {o.label}
                                        </option>
                                      ))}
                                    </select>
                                    <span className="text-stone-400">–</span>
                                    <select
                                      aria-label={`${WEEKDAY_LABELS[dayKey]} end ${slotIdx + 1}`}
                                      data-testid={`availability-end-${dayKey}-${slotIdx}`}
                                      className="border-stone-200 bg-[#f5f1eb] h-9 min-w-[7rem] flex-1 rounded-md border px-2 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:flex-none sm:min-w-[8.5rem]"
                                      value={slot.end}
                                      onChange={(e) => {
                                        markCustom();
                                        const v = e.target.value;
                                        field.handleChange(
                                          setWeeklyAvailability(
                                            days,
                                            dayKey,
                                            (s) =>
                                              s.map((x, i) =>
                                                i === slotIdx
                                                  ? { ...x, end: v }
                                                  : x,
                                              ),
                                          ),
                                        );
                                      }}
                                    >
                                      {TIME_OPTIONS.map((o) => (
                                        <option
                                          key={o.value}
                                          value={o.value}
                                        >
                                          {o.label}
                                        </option>
                                      ))}
                                    </select>
                                    <div className="ml-auto flex gap-1">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon-sm"
                                        className="text-stone-500"
                                        aria-label={`Remove time range on ${WEEKDAY_LABELS[dayKey]}`}
                                        data-testid={`availability-remove-${dayKey}-${slotIdx}`}
                                        onClick={() => {
                                          markCustom();
                                          field.handleChange(
                                            setWeeklyAvailability(
                                              days,
                                              dayKey,
                                              (s) =>
                                                s.filter((_, i) => i !== slotIdx),
                                            ),
                                          );
                                        }}
                                      >
                                        <Trash2 className="size-4" />
                                      </Button>
                                      {slotIdx === slots.length - 1 && (
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon-sm"
                                          className="text-[#8b7355]"
                                          aria-label={`Add time range on ${WEEKDAY_LABELS[dayKey]}`}
                                          data-testid={`availability-add-${dayKey}`}
                                          onClick={() => {
                                            markCustom();
                                            field.handleChange(
                                              setWeeklyAvailability(
                                                days,
                                                dayKey,
                                                (s) => [
                                                  ...s,
                                                  newAvailabilitySlot(
                                                    slot.start,
                                                    slot.end,
                                                  ),
                                                ],
                                              ),
                                            );
                                          }}
                                        >
                                          <Plus className="size-4" />
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }}
          </form.Field>
        )}
      </form.Field>
    </AccountSetupCard>
  );
};

export default AccountSetupAvailabilityStep;
