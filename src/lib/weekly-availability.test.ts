import { describe, expect, it } from 'vite-plus/test';
import {
  applyAvailabilityPreset,
  buildDefaultWeeklyAvailability,
  buildTimeSelectOptions,
  presetSummaryLabel,
  validateWeeklyAvailabilityDraft,
  weeklyAvailabilityToApiPayload,
  WEEKDAY_KEYS,
} from './weekly-availability';

describe('weekly-availability', () => {
  it('buildDefaultWeeklyAvailability: seven days, one slot each', () => {
    const d = buildDefaultWeeklyAvailability();
    expect(d).toHaveLength(7);
    expect(d.map((x) => x.day)).toEqual([...WEEKDAY_KEYS]);
    expect(d.every((x) => x.slots.length === 1)).toBe(true);
    expect(d[0]!.slots[0]!.start).toBe('08:00');
    expect(d[0]!.slots[0]!.end).toBe('21:00');
  });

  it('applyAvailabilityPreset: school hours use 08:00-16:00', () => {
    const d = applyAvailabilityPreset('school_hours');
    expect(d.every((row) => row.slots[0]!.start === '08:00')).toBe(true);
    expect(d.every((row) => row.slots[0]!.end === '16:00')).toBe(true);
  });

  it('validateWeeklyAvailabilityDraft: rejects end before start', () => {
    const bad = buildDefaultWeeklyAvailability();
    bad[0] = {
      ...bad[0]!,
      slots: [{ id: '1', start: '18:00', end: '08:00' }],
    };
    expect(validateWeeklyAvailabilityDraft(bad)).toContain('after start');
  });

  it('validateWeeklyAvailabilityDraft: accepts defaults', () => {
    expect(validateWeeklyAvailabilityDraft(buildDefaultWeeklyAvailability())).toBe(
      null,
    );
  });

  it('weeklyAvailabilityToApiPayload strips ids', () => {
    const d = buildDefaultWeeklyAvailability();
    const api = weeklyAvailabilityToApiPayload(d);
    expect(api[0]!.slots[0]).toEqual({ start: '08:00', end: '21:00' });
    expect(Object.keys(api[0]!.slots[0]!)).toEqual(['start', 'end']);
  });

  it('buildTimeSelectOptions: values are HH:mm', () => {
    const opts = buildTimeSelectOptions();
    expect(opts[0]!.value).toBe('06:00');
    expect(opts.some((o) => o.value === '21:30')).toBe(true);
  });

  it('presetSummaryLabel', () => {
    expect(presetSummaryLabel('anytime')).toContain('8am');
    expect(presetSummaryLabel('after_school')).toContain('4pm');
  });
});
