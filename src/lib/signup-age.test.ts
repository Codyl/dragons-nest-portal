import { describe, expect, it } from 'vitest';
import { ageFromBirthMonthYear, isUnder18, isUnder13 } from './signup-age';

describe('ageFromBirthMonthYear', () => {
  it('returns NaN for invalid month', () => {
    expect(ageFromBirthMonthYear(0, 2010)).toBeNaN();
    expect(ageFromBirthMonthYear(13, 2010)).toBeNaN();
  });

  it('computes age for a known birth month/year', () => {
    const y = new Date().getFullYear() - 20;
    expect(ageFromBirthMonthYear(6, y)).toBeGreaterThanOrEqual(19);
    expect(ageFromBirthMonthYear(6, y)).toBeLessThanOrEqual(20);
  });
});

describe('isUnder13', () => {
  it('is true for a recent year', () => {
    const y = new Date().getFullYear() - 8;
    expect(isUnder13(1, y)).toBe(true);
  });

  it('is false for a year 14+ years ago', () => {
    const y = new Date().getFullYear() - 14;
    expect(isUnder13(12, y)).toBe(false);
  });
});

describe('isUnder18', () => {
  it('is true for a mid-teen birth year', () => {
    const y = new Date().getFullYear() - 15;
    expect(isUnder18(6, y)).toBe(true);
  });

  it('is false for a birth year clearly 18+', () => {
    const y = new Date().getFullYear() - 22;
    expect(isUnder18(6, y)).toBe(false);
  });

  it('is true for a birth year clearly under 13 (still under 18)', () => {
    const y = new Date().getFullYear() - 10;
    expect(isUnder18(6, y)).toBe(true);
  });
});
