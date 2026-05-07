/** One weekday slot from profile / API (`DayAvailability` in user schema). */
export type DaySlot = { start: string; end: string };

export type DayAvailabilityRow = { day: string; slots: DaySlot[] };

const ORDER = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

type Weekday = (typeof ORDER)[number];

const SHORT_LABEL: Record<Weekday, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
};

const WEEKDAYS: Weekday[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
];

function isWeekday(d: string): d is Weekday {
  return (ORDER as readonly string[]).includes(d);
}

/** Stable key for comparing slot sets (order-insensitive). */
export function slotsKey(slots: DaySlot[]): string {
  return JSON.stringify(
    [...slots].sort((a, b) => a.start.localeCompare(b.start)),
  );
}

/** Renders slots as `start–end`, multiple blocks separated by `; `. */
export function formatSlotLine(slots: DaySlot[]): string {
  if (!slots.length) {
    return '';
  }

  return slots.map((s) => `${s.start}–${s.end}`).join('; ');
}

function rangeLabel(start: Weekday, end: Weekday): string {
  if (start === end) {
    return SHORT_LABEL[start];
  }

  if (start === 'monday' && end === 'friday') {
    return 'M–F';
  }

  if (start === 'saturday' && end === 'sunday') {
    return 'Sa–Su';
  }

  return `${SHORT_LABEL[start]}–${SHORT_LABEL[end]}`;
}

type Entry = { day: Weekday; slots: DaySlot[] };

/**
 * Short human-readable availability lines, e.g. `M–F 9:00am–3:00pm` when
 * Monday–Friday share identical slots.
 */
export function formatTeacherAvailabilitySummary(
  availability: DayAvailabilityRow[] | undefined | null,
): string[] {
  if (!availability?.length) {
    return [];
  }

  const map = new Map<Weekday, DaySlot[]>();
  for (const row of availability) {
    const key = row.day.trim().toLowerCase();
    if (!isWeekday(key)) {
      continue;
    }

    map.set(key, row.slots ?? []);
  }

  if (map.size === 0) {
    return [];
  }

  const lines: string[] = [];

  const mfPresent = WEEKDAYS.every((d) => map.has(d));
  const mfKey = mfPresent ? slotsKey(map.get('monday')!) : null;
  const mfUniform =
    mfPresent &&
    mfKey != null &&
    WEEKDAYS.every((d) => slotsKey(map.get(d)!) === mfKey);

  if (mfUniform) {
    const slots = map.get('monday')!;
    const slotText = formatSlotLine(slots);
    lines.push(slotText ? `M–F ${slotText}` : 'M–F');
    for (const d of WEEKDAYS) {
      map.delete(d);
    }
  }

  const entries: Entry[] = ORDER.filter((d) => map.has(d)).map((d) => ({
    day: d,
    slots: map.get(d)!,
  }));

  let i = 0;
  while (i < entries.length) {
    const key = slotsKey(entries[i].slots);
    let j = i;
    while (
      j + 1 < entries.length &&
      slotsKey(entries[j + 1].slots) === key &&
      ORDER.indexOf(entries[j + 1].day) === ORDER.indexOf(entries[j].day) + 1
    ) {
      j += 1;
    }

    const start = entries[i].day;
    const end = entries[j].day;
    const slots = entries[i].slots;
    const slotText = formatSlotLine(slots);
    const label = rangeLabel(start, end);
    lines.push(slotText ? `${label} ${slotText}` : label);
    i = j + 1;
  }

  return lines;
}
