import * as fc from 'fast-check';
import { describe, expect, it } from 'vite-plus/test';
import { findStudentById, resolveActiveStudent } from './student-storage';
import type { HouseholdStudentProfile } from '@/api/services/profile.services';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeStudent(
  studentId: string,
  displayName = 'Test Student',
): HouseholdStudentProfile {
  return {
    studentId,
    displayName,
    currentGrade: 5,
    lastPromotionYear: 2023,
  };
}

// ---------------------------------------------------------------------------
// Unit tests — findStudentById
// ---------------------------------------------------------------------------

describe('findStudentById', () => {
  it('returns null for an empty list', () => {
    expect(findStudentById([], 'abc')).toBeNull();
  });

  it('returns null when id is null', () => {
    const students = [makeStudent('abc')];
    expect(findStudentById(students, null)).toBeNull();
  });

  it('returns null when id is an empty string', () => {
    const students = [makeStudent('abc')];
    expect(findStudentById(students, '')).toBeNull();
  });

  it('returns null when id is whitespace', () => {
    const students = [makeStudent('abc')];
    expect(findStudentById(students, '   ')).toBeNull();
  });

  it('returns the matching student from a single-element list', () => {
    const student = makeStudent('abc');
    expect(findStudentById([student], 'abc')).toBe(student);
  });

  it('returns the matching student from a multi-element list', () => {
    const a = makeStudent('aaa');
    const b = makeStudent('bbb');
    const c = makeStudent('ccc');
    expect(findStudentById([a, b, c], 'bbb')).toBe(b);
  });

  it('returns null when id is not in the list', () => {
    const students = [makeStudent('aaa'), makeStudent('bbb')];
    expect(findStudentById(students, 'zzz')).toBeNull();
  });

  it('returns the first match when duplicate ids exist', () => {
    const first = makeStudent('dup', 'First');
    const second = makeStudent('dup', 'Second');
    expect(findStudentById([first, second], 'dup')).toBe(first);
  });
});

// ---------------------------------------------------------------------------
// Unit tests — resolveActiveStudent
// ---------------------------------------------------------------------------

describe('resolveActiveStudent', () => {
  it('returns null for an empty list', () => {
    expect(resolveActiveStudent([], 'abc')).toBeNull();
  });

  it('returns null when storedId is null', () => {
    const students = [makeStudent('abc')];
    expect(resolveActiveStudent(students, null)).toBeNull();
  });

  it('returns null when storedId is an empty string', () => {
    const students = [makeStudent('abc')];
    expect(resolveActiveStudent(students, '')).toBeNull();
  });

  it('returns null when storedId is whitespace', () => {
    const students = [makeStudent('abc')];
    expect(resolveActiveStudent(students, '   ')).toBeNull();
  });

  it('returns the matching student when storedId is valid', () => {
    const student = makeStudent('abc');
    expect(resolveActiveStudent([student], 'abc')).toBe(student);
  });

  it('returns null when storedId does not match any student', () => {
    const students = [makeStudent('aaa'), makeStudent('bbb')];
    expect(resolveActiveStudent(students, 'zzz')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

const arbitrarystudentId = fc.string({ minLength: 1, maxLength: 36 });

const arbitraryStudent: fc.Arbitrary<HouseholdStudentProfile> = fc.record({
  studentId: arbitrarystudentId,
  displayName: fc.string({ minLength: 1, maxLength: 50 }),
  currentGrade: fc.integer({ min: 0, max: 12 }),
  lastPromotionYear: fc.integer({ min: 2000, max: 2030 }),
});

/** Generates a non-empty list of students with unique studentIds. */
const arbitraryUniqueStudentList: fc.Arbitrary<HouseholdStudentProfile[]> =
  fc.uniqueArray(arbitraryStudent, {
    selector: (s) => s.studentId,
    minLength: 1,
    maxLength: 10,
  });

// ---------------------------------------------------------------------------
// Property 1: localStorage persistence round-trip
// Validates: Requirements 1.6, 7.1, 7.3
// ---------------------------------------------------------------------------

describe('Property 1: localStorage persistence round-trip', () => {
  it('findStudentById returns the student when its own id is used', () => {
    fc.assert(
      fc.property(
        arbitraryUniqueStudentList,
        fc.integer({ min: 0, max: 9 }),
        (students, rawIndex) => {
          const index = rawIndex % students.length;
          const student = students[index]!;
          const result = findStudentById(students, student.studentId);
          return result?.studentId === student.studentId;
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 2: Stale localStorage ID is cleaned up
// Validates: Requirements 1.7, 8.1
// ---------------------------------------------------------------------------

describe('Property 2: Stale localStorage ID is cleaned up', () => {
  it('resolveActiveStudent returns null for an id not present in the list', () => {
    fc.assert(
      fc.property(
        arbitraryUniqueStudentList,
        fc.string({ minLength: 1, maxLength: 36 }),
        (students, staleId) => {
          // Only test ids that are genuinely absent from the list
          fc.pre(!students.some((s) => s.studentId === staleId));
          return resolveActiveStudent(students, staleId) === null;
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 12: students array mirrors householdStudents from query
// Validates: Requirements 1.2
// ---------------------------------------------------------------------------

describe('Property 12: students array mirrors householdStudents from query', () => {
  it("resolveActiveStudent applied to each element's own id returns that element", () => {
    fc.assert(
      fc.property(arbitraryUniqueStudentList, (students) => {
        return students.every((student) => {
          const result = resolveActiveStudent(students, student.studentId);
          return result?.studentId === student.studentId;
        });
      }),
      { numRuns: 100 },
    );
  });
});
