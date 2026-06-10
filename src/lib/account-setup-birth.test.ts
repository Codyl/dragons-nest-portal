import { describe, expect, it, vi, afterEach } from 'vite-plus/test';
import {
  ageFromLocalDateOfBirth,
  birthDateIsoMatchesExpectedBand,
  parseIsoDateOnlyLocal,
} from './account-setup-birth';

describe('parseIsoDateOnlyLocal', () => {
  it('returns null for invalid patterns', () => {
    expect(parseIsoDateOnlyLocal('')).toBeNull();
    expect(parseIsoDateOnlyLocal('2010-13-01')).toBeNull();
    expect(parseIsoDateOnlyLocal('2010-02-30')).toBeNull();
    expect(parseIsoDateOnlyLocal('10-02-01')).toBeNull();
  });

  it('parses valid YYYY-MM-DD', () => {
    const d = parseIsoDateOnlyLocal('2010-06-15');
    expect(d).not.toBeNull();
    expect(d!.getFullYear()).toBe(2010);
    expect(d!.getMonth()).toBe(5);
    expect(d!.getDate()).toBe(15);
  });
});

describe('birthDateIsoMatchesExpectedBand', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('accepts adult band when ref is 2026-04-08 and DOB is 2000-01-01', () => {
    vi.setSystemTime(new Date(2026, 3, 8));
    expect(birthDateIsoMatchesExpectedBand('2000-01-01', 'adult')).toBe(true);
    expect(birthDateIsoMatchesExpectedBand('2010-01-01', 'adult')).toBe(false);
  });

  it('accepts teen13to17 on ref 2026-04-08', () => {
    vi.setSystemTime(new Date(2026, 3, 8));
    expect(birthDateIsoMatchesExpectedBand('2010-01-01', 'teen13to17')).toBe(
      true,
    );
    expect(birthDateIsoMatchesExpectedBand('2000-01-01', 'teen13to17')).toBe(
      false,
    );
    expect(birthDateIsoMatchesExpectedBand('2015-01-01', 'teen13to17')).toBe(
      false,
    );
  });

  it('accepts under13 on ref 2026-04-08', () => {
    vi.setSystemTime(new Date(2026, 3, 8));
    expect(birthDateIsoMatchesExpectedBand('2015-06-01', 'under13')).toBe(true);
    expect(birthDateIsoMatchesExpectedBand('2010-01-01', 'under13')).toBe(
      false,
    );
  });
});

describe('ageFromLocalDateOfBirth', () => {
  it('matches calendar year rule before birthday', () => {
    const ref = new Date(2026, 3, 8);
    const beforeBirthday = new Date(2010, 5, 10);
    expect(ageFromLocalDateOfBirth(beforeBirthday, ref)).toBe(15);
  });
});
