import { describe, expect, it } from 'vitest';
import {
  ANY_GRADE_VALUE,
  draftGradesToApiPayload,
  gradesSelectionIsValid,
  newCourseRow,
  reconcileGradesAfterMultiSelect,
  rowHasAnyFieldStarted,
  rowIsComplete,
  teachableCoursesFormIsSubmittable,
  type TeachableCourseDraftLike,
} from './teachable-course-validation';

const empty = (): TeachableCourseDraftLike => ({
  className: '',
  subjectId: '',
  grades: [],
  curriculum: '',
});

const complete = (
  patch: Partial<TeachableCourseDraftLike> = {},
): TeachableCourseDraftLike => ({
  className: 'Algebra I',
  subjectId: '507f1f77bcf86cd799439011',
  grades: ['9'],
  curriculum: 'saxon',
  ...patch,
});

describe('teachable-course-validation', () => {
  it('rowHasAnyFieldStarted: empty row is not started', () => {
    expect(rowHasAnyFieldStarted(empty())).toBe(false);
  });

  it('rowHasAnyFieldStarted: detects each field', () => {
    expect(rowHasAnyFieldStarted({ ...empty(), className: ' x ' })).toBe(true);
    expect(rowHasAnyFieldStarted({ ...empty(), subjectId: 'id' })).toBe(true);
    expect(rowHasAnyFieldStarted({ ...empty(), grades: ['k'] })).toBe(true);
    expect(rowHasAnyFieldStarted({ ...empty(), curriculum: 'x' })).toBe(true);
  });

  it('gradesSelectionIsValid: empty invalid', () => {
    expect(gradesSelectionIsValid([])).toBe(false);
  });

  it('gradesSelectionIsValid: ANY alone is valid', () => {
    expect(gradesSelectionIsValid([ANY_GRADE_VALUE])).toBe(true);
  });

  it('gradesSelectionIsValid: one or more homeschool values', () => {
    expect(gradesSelectionIsValid(['k'])).toBe(true);
    expect(gradesSelectionIsValid(['1', '2'])).toBe(true);
  });

  it('gradesSelectionIsValid: ANY mixed with grades invalid', () => {
    expect(gradesSelectionIsValid([ANY_GRADE_VALUE, '1'])).toBe(false);
  });

  it('gradesSelectionIsValid: unknown grade invalid', () => {
    expect(gradesSelectionIsValid(['nope'])).toBe(false);
  });

  it('rowIsComplete: empty row not complete', () => {
    expect(rowIsComplete(empty())).toBe(false);
  });

  it('rowIsComplete: full row with grades', () => {
    expect(rowIsComplete(complete())).toBe(true);
    expect(rowIsComplete(complete({ grades: [ANY_GRADE_VALUE] }))).toBe(true);
  });

  it('rowIsComplete: partial row false', () => {
    expect(rowIsComplete({ ...complete(), className: '' })).toBe(false);
    expect(rowIsComplete({ ...complete(), grades: [] })).toBe(false);
  });

  it('teachableCoursesFormIsSubmittable: needs one complete row', () => {
    expect(teachableCoursesFormIsSubmittable([empty()])).toBe(false);
    expect(
      teachableCoursesFormIsSubmittable([empty(), complete()]),
    ).toBe(true);
  });

  it('teachableCoursesFormIsSubmittable: rejects partial alongside complete', () => {
    expect(
      teachableCoursesFormIsSubmittable([
        complete(),
        { ...empty(), className: 'Half' },
      ]),
    ).toBe(false);
  });

  it('teachableCoursesFormIsSubmittable: multiple empty rows ok with one complete', () => {
    const row = newCourseRow();
    Object.assign(row, complete());
    const blank = newCourseRow();
    expect(teachableCoursesFormIsSubmittable([row, blank, newCourseRow()])).toBe(
      true,
    );
  });

  it('reconcileGradesAfterMultiSelect', () => {
    expect(reconcileGradesAfterMultiSelect([], [ANY_GRADE_VALUE])).toEqual([
      ANY_GRADE_VALUE,
    ]);
    expect(reconcileGradesAfterMultiSelect(['1'], ['1', '2'])).toEqual(['1', '2']);
    expect(reconcileGradesAfterMultiSelect(['1'], [ANY_GRADE_VALUE, '1'])).toEqual([
      ANY_GRADE_VALUE,
    ]);
    expect(
      reconcileGradesAfterMultiSelect([ANY_GRADE_VALUE], [ANY_GRADE_VALUE, '1']),
    ).toEqual(['1']);
  });

  it('draftGradesToApiPayload', () => {
    expect(draftGradesToApiPayload([ANY_GRADE_VALUE])).toEqual({
      matchesAllGrades: true,
      grades: [],
    });
    expect(draftGradesToApiPayload(['9', '10'])).toEqual({
      matchesAllGrades: false,
      grades: ['9', '10'],
    });
  });
});
