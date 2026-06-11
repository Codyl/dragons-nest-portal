import { describe, expect, it } from 'vite-plus/test';
import * as fc from 'fast-check';
import { GRADE_OPTIONS, gradeLabel } from './grade-label';

describe('GRADE_OPTIONS', () => {
  it('includes fourteen grades (Kindergarten through Grade 13 / Post-Secondary)', () => {
    expect(GRADE_OPTIONS).toHaveLength(14);
  });
});

describe('gradeLabel', () => {
  it('maps 0 to Kindergarten', () => {
    expect(gradeLabel(0)).toBe('Kindergarten');
  });

  it('maps 1 and 12 to ordinal Grade', () => {
    expect(gradeLabel(1)).toBe('1st Grade');
    expect(gradeLabel(12)).toBe('12th Grade');
  });

  it('maps 13 to post-secondary label', () => {
    expect(gradeLabel(13)).toBe('Post-Secondary');
  });

  // Feature: child-accounts-settings, Property 3: gradeLabel round-trip
  it('property: labels non-empty and GRADE_OPTIONS round-trips 0–13', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 13 }), (n) => {
        const label = gradeLabel(n);
        expect(label.length).toBeGreaterThan(0);
        const opt = GRADE_OPTIONS.find((o) => o.value === n);
        expect(opt).toBeDefined();
        expect(opt!.label).toBe(label);
      }),
      { numRuns: 100 },
    );
  });
});
