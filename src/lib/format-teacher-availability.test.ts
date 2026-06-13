import { describe, expect, it } from 'vite-plus/test';

import {
  formatSlotLine,
  formatTeacherAvailabilitySummary,
  slotsKey,
} from './format-teacher-availability';

describe('formatTeacherAvailabilitySummary', () => {
  it('collapses Mon–Fri with identical slots to M–F start–end', () => {
    const slot = { start: '9:00am', end: '3:00pm' };
    const days = [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
    ] as const;
    const availability = days.map((day) => ({ day, slots: [slot] }));
    expect(formatTeacherAvailabilitySummary(availability)).toEqual([
      'M–F 9:00am–3:00pm',
    ]);
  });

  it('is case-insensitive on day names', () => {
    const slot = { start: '1:00pm', end: '2:00pm' };
    const availability = [
      { day: 'Monday', slots: [slot] },
      { day: 'TUESDAY', slots: [slot] },
      { day: 'Wednesday', slots: [slot] },
      { day: 'Thursday', slots: [slot] },
      { day: 'Friday', slots: [slot] },
    ];
    expect(formatTeacherAvailabilitySummary(availability)).toEqual([
      'M–F 1:00pm–2:00pm',
    ]);
  });

  it('does not collapse weekdays when any day differs', () => {
    const availability = [
      {
        day: 'monday',
        slots: [{ start: '8:00', end: '12:00' }],
      },
      {
        day: 'tuesday',
        slots: [{ start: '8:00', end: '12:00' }],
      },
      {
        day: 'wednesday',
        slots: [{ start: '13:00', end: '17:00' }],
      },
    ];
    expect(formatTeacherAvailabilitySummary(availability)).toEqual([
      'Mon–Tue 8:00–12:00',
      'Wed 13:00–17:00',
    ]);
  });

  it('groups Sat–Sun with identical slots as Sa–Su', () => {
    const slot = { start: '10:00', end: '14:00' };
    const availability = [
      { day: 'saturday', slots: [slot] },
      { day: 'sunday', slots: [slot] },
    ];
    expect(formatTeacherAvailabilitySummary(availability)).toEqual([
      'Sa–Su 10:00–14:00',
    ]);
  });

  it('returns empty array for undefined or empty input', () => {
    expect(formatTeacherAvailabilitySummary(undefined)).toEqual([]);
    expect(formatTeacherAvailabilitySummary([])).toEqual([]);
  });

  it('ignores unknown day strings', () => {
    const availability = [
      { day: 'notaday', slots: [{ start: '1', end: '2' }] },
      { day: 'monday', slots: [{ start: '9:00', end: '10:00' }] },
    ];
    expect(formatTeacherAvailabilitySummary(availability)).toEqual([
      'Mon 9:00–10:00',
    ]);
  });
});

describe('slotsKey', () => {
  it('treats slot order as irrelevant', () => {
    const a = [{ start: '9:00', end: '12:00' }];
    const b = [
      { start: '9:00', end: '12:00' },
      { start: '13:00', end: '17:00' },
    ];
    const bRev = [...b].reverse();
    expect(slotsKey(a)).toBe(slotsKey(a));
    expect(slotsKey(b)).toBe(slotsKey(bRev));
  });
});

describe('formatSlotLine', () => {
  it('joins multiple slots with semicolons', () => {
    expect(
      formatSlotLine([
        { start: '9:00am', end: '12:00pm' },
        { start: '1:00pm', end: '4:00pm' },
      ]),
    ).toBe('9:00am–12:00pm; 1:00pm–4:00pm');
  });
});
