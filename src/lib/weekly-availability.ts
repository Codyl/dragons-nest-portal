/** Lowercase weekday keys aligned with `User.availablity` in the API. */
export const WEEKDAY_KEYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

export type WeekdayKey = (typeof WEEKDAY_KEYS)[number];

export const WEEKDAY_LABELS: Record<WeekdayKey, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

export type AvailabilityPreset = 'anytime' | 'school_hours' | 'after_school';

export type AccountAvailabilityPreset = AvailabilityPreset | 'custom';

export type AvailabilityTimeSlotDraft = {
  id: string;
  start: string;
  end: string;
};

export type DayAvailabilityDraft = {
  day: WeekdayKey;
  slots: AvailabilityTimeSlotDraft[];
};

const PRESET_RANGES: Record<
  AvailabilityPreset,
  { start: string; end: string }
> = {
  anytime: { start: '08:00', end: '21:00' },
  school_hours: { start: '08:00', end: '16:00' },
  after_school: { start: '16:00', end: '21:00' },
};

export function newAvailabilitySlot(
  start = '08:00',
  end = '21:00',
): AvailabilityTimeSlotDraft {
  return { id: crypto.randomUUID(), start, end };
}

export function buildDefaultWeeklyAvailability(): DayAvailabilityDraft[] {
  return WEEKDAY_KEYS.map((day) => ({
    day,
    slots: [newAvailabilitySlot()],
  }));
}

export function applyAvailabilityPreset(
  preset: AvailabilityPreset,
): DayAvailabilityDraft[] {
  const { start, end } = PRESET_RANGES[preset];
  return WEEKDAY_KEYS.map((day) => ({
    day,
    slots: [newAvailabilitySlot(start, end)],
  }));
}

/** 30-minute steps from 6:00 through 22:00 (end times can include 22:00). */
export function buildTimeSelectOptions(): { value: string; label: string }[] {
  const out: { value: string; label: string }[] = [];
  for (let h = 6; h <= 22; h++) {
    for (const m of [0, 30] as const) {
      if (h === 22 && m === 30) break;
      const hh = String(h).padStart(2, '0');
      const mm = String(m).padStart(2, '0');
      out.push({
        value: `${hh}:${mm}`,
        label: formatTimeLabel12h(h, m),
      });
    }
  }
  return out;
}

function formatTimeLabel12h(h24: number, minutes: number): string {
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const ampm = h24 < 12 ? 'am' : 'pm';
  const mm = minutes === 0 ? '00' : '30';
  return `${h12}:${mm}${ampm}`;
}

function timeToMinutes(t: string): number | null {
  if (!/^\d{2}:\d{2}$/.test(t)) return null;
  const [h, m] = t.split(':').map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
}

/** Human-readable preset summary (timezone label is contextual in UI). */
export function presetSummaryLabel(preset: AvailabilityPreset): string {
  switch (preset) {
    case 'anytime':
      return '8am - 9pm';
    case 'school_hours':
      return '8am - 4pm';
    case 'after_school':
      return '4pm - 9pm';
  }
}

/**
 * Returns an error message when invalid; otherwise `null`.
 * Requires at least one slot somewhere in the week.
 */
export function validateWeeklyAvailabilityDraft(
  days: DayAvailabilityDraft[],
): string | null {
  if (days.length !== WEEKDAY_KEYS.length) {
    return 'Availability is incomplete';
  }

  let totalSlots = 0;
  for (const d of days) {
    for (const s of d.slots) {
      totalSlots += 1;
      const a = timeToMinutes(s.start);
      const b = timeToMinutes(s.end);
      if (a === null || b === null) {
        return 'Each time must be a valid selection';
      }

      if (a >= b) {
        return 'End time must be after start time for each range';
      }
    }
  }

  if (totalSlots < 1) {
    return 'Add at least one available time range';
  }

  return null;
}

/** Strip client ids for POST /profile/account-setup */
export function weeklyAvailabilityToApiPayload(
  days: DayAvailabilityDraft[],
): { day: WeekdayKey; slots: { start: string; end: string }[] }[] {
  return days.map((d) => ({
    day: d.day,
    slots: d.slots.map(({ start, end }) => ({ start, end })),
  }));
}
