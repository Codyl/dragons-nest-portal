import { describe, expect, it } from 'vitest';
import {
  ANY_GRADE_VALUE,
  draftGradesToApiPayload,
  getMaxConsecutiveGradesForSubject,
  gradesSelectionIsValid,
  homeschoolGradeOptionsWithinSpanLimit,
  newCourseRow,
  reconcileGradesAfterMultiSelect,
  rowGradeSpanViolationMessage,
  rowHasAnyFieldStarted,
  rowIsComplete,
  selectedGradesConsecutiveSpan,
  teachableCoursesFormIsSubmittable,
  type GetTeachableSubject,
  type TeachableCourseDraftLike,
  type TeachableSubjectLookup,
} from './teachable-course-validation';

const math = { slug: 'math', name: 'Math', isEnrichment: false };
const science = { slug: 'science', name: 'Science', isEnrichment: false };
const music = { slug: 'music', name: 'Music', isEnrichment: true };

const getSubjectFixture = (
  map: Record<string, TeachableSubjectLookup | undefined>,
): GetTeachableSubject => (id: string) => map[id];

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
  subjectId: 'topic-math',
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
    expect(gradesSelectionIsValid([], false)).toBe(false);
    expect(gradesSelectionIsValid([], true)).toBe(false);
  });

  it('gradesSelectionIsValid: ANY alone only when allowAny', () => {
    expect(gradesSelectionIsValid([ANY_GRADE_VALUE], true)).toBe(true);
    expect(gradesSelectionIsValid([ANY_GRADE_VALUE], false)).toBe(false);
  });

  it('gradesSelectionIsValid: one or more homeschool values', () => {
    expect(gradesSelectionIsValid(['k'], false)).toBe(true);
    expect(gradesSelectionIsValid(['1', '2'], true)).toBe(true);
  });

  it('gradesSelectionIsValid: ANY mixed with grades invalid', () => {
    expect(gradesSelectionIsValid([ANY_GRADE_VALUE, '1'], true)).toBe(false);
  });

  it('gradesSelectionIsValid: unknown grade invalid', () => {
    expect(gradesSelectionIsValid(['nope'], true)).toBe(false);
  });

  it('selectedGradesConsecutiveSpan', () => {
    expect(selectedGradesConsecutiveSpan([])).toBe(null);
    expect(selectedGradesConsecutiveSpan([ANY_GRADE_VALUE])).toBe(null);
    expect(selectedGradesConsecutiveSpan(['9'])).toBe(1);
    expect(selectedGradesConsecutiveSpan(['9', '10'])).toBe(2);
    expect(selectedGradesConsecutiveSpan(['9', '10', '11'])).toBe(3);
    expect(selectedGradesConsecutiveSpan(['8', '10'])).toBe(3);
  });

  it('homeschoolGradeOptionsWithinSpanLimit: null maxSpan is full catalog', () => {
    const all = homeschoolGradeOptionsWithinSpanLimit(['9'], null);
    expect(all.length).toBeGreaterThan(10);
  });

  it('homeschoolGradeOptionsWithinSpanLimit: empty selection is full catalog', () => {
    const opts = homeschoolGradeOptionsWithinSpanLimit([], 2);
    expect(opts.map((o) => o.value)).toContain('12');
    expect(opts.map((o) => o.value)).toContain('pre_k');
  });

  it('homeschoolGradeOptionsWithinSpanLimit: math-like limit 2 from one grade', () => {
    const opts = homeschoolGradeOptionsWithinSpanLimit(['9'], 2);
    const values = opts.map((o) => o.value);
    expect(values).toEqual(expect.arrayContaining(['8', '9', '10']));
    expect(values).not.toContain('7');
    expect(values).not.toContain('11');
  });

  it('homeschoolGradeOptionsWithinSpanLimit: keeps selected outside narrowed band for display', () => {
    const opts = homeschoolGradeOptionsWithinSpanLimit(['9', '10'], 2);
    const values = opts.map((o) => o.value);
    expect(values).toContain('9');
    expect(values).toContain('10');
    expect(values).not.toContain('11');
    expect(values).not.toContain('8');
  });

  it('getMaxConsecutiveGradesForSubject', () => {
    expect(getMaxConsecutiveGradesForSubject(undefined)).toBe(null);
    expect(getMaxConsecutiveGradesForSubject(music)).toBe(null);
    expect(getMaxConsecutiveGradesForSubject(math)).toBe(2);
    expect(getMaxConsecutiveGradesForSubject(science)).toBe(4);
    expect(
      getMaxConsecutiveGradesForSubject({
        slug: 'life_skills',
        name: 'Life Skills',
        isEnrichment: false,
      }),
    ).toBe(6);
    expect(
      getMaxConsecutiveGradesForSubject({
        slug: 'unknown_core',
        name: 'Unknown',
        isEnrichment: false,
      }),
    ).toBe(2);
  });

  it('rowGradeSpanViolationMessage: exact copy with limit and name', () => {
    const getS = getSubjectFixture({
      'topic-math': math,
    });
    const row: TeachableCourseDraftLike = {
      ...complete(),
      grades: ['9', '10', '11'],
    };
    expect(rowGradeSpanViolationMessage(row, getS)).toBe(
      'No more than 2 consecutive grades can be covered for Math under one course. If desired create a separate course for the additional grade levels.',
    );
  });

  it('rowGradeSpanViolationMessage: null when within limit or enrichment', () => {
    const getS = getSubjectFixture({ 'topic-math': math, 'topic-music': music });
    expect(
      rowGradeSpanViolationMessage(
        { ...complete(), grades: ['9', '10'] },
        getS,
      ),
    ).toBe(null);
    expect(
      rowGradeSpanViolationMessage(
        { ...complete(), subjectId: 'topic-music', grades: ['k', '12'] },
        getS,
      ),
    ).toBe(null);
  });

  it('rowIsComplete: empty row not complete', () => {
    const getS = getSubjectFixture({ 'topic-math': math });
    expect(rowIsComplete(empty(), getS)).toBe(false);
  });

  it('rowIsComplete: full row with grades', () => {
    const getS = getSubjectFixture({ 'topic-math': math });
    expect(rowIsComplete(complete(), getS)).toBe(true);
  });

  it('rowIsComplete: ANY only for enrichment', () => {
    const getS = getSubjectFixture({ 'topic-math': math, 'topic-music': music });
    expect(
      rowIsComplete(
        { ...complete(), subjectId: 'topic-music', grades: [ANY_GRADE_VALUE] },
        getS,
      ),
    ).toBe(true);
    expect(
      rowIsComplete(
        { ...complete(), grades: [ANY_GRADE_VALUE] },
        getS,
      ),
    ).toBe(false);
  });

  it('rowIsComplete: rejects unknown subjectId', () => {
    const getS = getSubjectFixture({ 'topic-math': math });
    expect(rowIsComplete({ ...complete(), subjectId: 'missing' }, getS)).toBe(
      false,
    );
  });

  it('rowIsComplete: rejects grade span over limit for math', () => {
    const getS = getSubjectFixture({ 'topic-math': math });
    expect(
      rowIsComplete({ ...complete(), grades: ['9', '10', '11'] }, getS),
    ).toBe(false);
  });

  it('rowIsComplete: accepts science span of 4', () => {
    const getS = getSubjectFixture({ 'topic-science': science });
    expect(
      rowIsComplete(
        {
          ...complete(),
          subjectId: 'topic-science',
          grades: ['9', '10', '11', '12'],
        },
        getS,
      ),
    ).toBe(true);
  });

  it('rowIsComplete: rejects science span of 5', () => {
    const getS = getSubjectFixture({ 'topic-science': science });
    expect(
      rowIsComplete(
        {
          ...complete(),
          subjectId: 'topic-science',
          grades: ['8', '9', '10', '11', '12'],
        },
        getS,
      ),
    ).toBe(false);
  });

  it('rowIsComplete: partial row false', () => {
    const getS = getSubjectFixture({ 'topic-math': math });
    expect(rowIsComplete({ ...complete(), className: '' }, getS)).toBe(false);
    expect(rowIsComplete({ ...complete(), grades: [] }, getS)).toBe(false);
  });

  it('teachableCoursesFormIsSubmittable: all empty rows is submittable', () => {
    const getS = getSubjectFixture({ 'topic-math': math });
    expect(teachableCoursesFormIsSubmittable([empty()], getS)).toBe(true);
    const a = newCourseRow();
    const b = newCourseRow();
    expect(teachableCoursesFormIsSubmittable([a, b], getS)).toBe(true);
  });

  it('teachableCoursesFormIsSubmittable: needs one complete row when any row started', () => {
    const getS = getSubjectFixture({ 'topic-math': math });
    expect(
      teachableCoursesFormIsSubmittable([empty(), complete()], getS),
    ).toBe(true);
    expect(
      teachableCoursesFormIsSubmittable([{ ...empty(), className: 'X' }], getS),
    ).toBe(false);
  });

  it('teachableCoursesFormIsSubmittable: rejects partial alongside complete', () => {
    const getS = getSubjectFixture({ 'topic-math': math });
    expect(
      teachableCoursesFormIsSubmittable(
        [complete(), { ...empty(), className: 'Half' }],
        getS,
      ),
    ).toBe(false);
  });

  it('teachableCoursesFormIsSubmittable: multiple empty rows ok with one complete', () => {
    const getS = getSubjectFixture({ 'topic-math': math });
    const row = newCourseRow();
    Object.assign(row, complete());
    const blank = newCourseRow();
    expect(
      teachableCoursesFormIsSubmittable([row, blank, newCourseRow()], getS),
    ).toBe(true);
  });

  it('reconcileGradesAfterMultiSelect', () => {
    expect(
      reconcileGradesAfterMultiSelect([], [ANY_GRADE_VALUE], true),
    ).toEqual([ANY_GRADE_VALUE]);
    expect(
      reconcileGradesAfterMultiSelect([], [ANY_GRADE_VALUE], false),
    ).toEqual([]);
    expect(reconcileGradesAfterMultiSelect(['1'], ['1', '2'], true)).toEqual([
      '1',
      '2',
    ]);
    expect(
      reconcileGradesAfterMultiSelect(['1'], [ANY_GRADE_VALUE, '1'], true),
    ).toEqual([ANY_GRADE_VALUE]);
    expect(
      reconcileGradesAfterMultiSelect([ANY_GRADE_VALUE], [ANY_GRADE_VALUE, '1'], true),
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
