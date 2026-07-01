import * as fc from 'fast-check';
import { describe, expect, it } from 'vite-plus/test';
import { findManagedUserById, resolveActiveManagedUser } from './managed-user-storage';
import type { ManagedUserProfile } from '@/api/services/profile.services';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeManagedUser(
  managedUserId: string,
  displayName = 'Test ManagedUser',
): ManagedUserProfile {
  return {
    managedUserId,
    displayName,
    currentGrade: 5,
    lastPromotionYear: 2023,
  };
}

// ---------------------------------------------------------------------------
// Unit tests — findManagedUserById
// ---------------------------------------------------------------------------

describe('findManagedUserById', () => {
  it('returns null for an empty list', () => {
    expect(findManagedUserById([], 'abc')).toBeNull();
  });

  it('returns null when id is null', () => {
    const managedusers = [makeManagedUser('abc')];
    expect(findManagedUserById(managedusers, null)).toBeNull();
  });

  it('returns null when id is an empty string', () => {
    const managedusers = [makeManagedUser('abc')];
    expect(findManagedUserById(managedusers, '')).toBeNull();
  });

  it('returns null when id is whitespace', () => {
    const managedusers = [makeManagedUser('abc')];
    expect(findManagedUserById(managedusers, '   ')).toBeNull();
  });

  it('returns the matching manageduser from a single-element list', () => {
    const manageduser = makeManagedUser('abc');
    expect(findManagedUserById([manageduser], 'abc')).toBe(manageduser);
  });

  it('returns the matching manageduser from a multi-element list', () => {
    const a = makeManagedUser('aaa');
    const b = makeManagedUser('bbb');
    const c = makeManagedUser('ccc');
    expect(findManagedUserById([a, b, c], 'bbb')).toBe(b);
  });

  it('returns null when id is not in the list', () => {
    const managedusers = [makeManagedUser('aaa'), makeManagedUser('bbb')];
    expect(findManagedUserById(managedusers, 'zzz')).toBeNull();
  });

  it('returns the first match when duplicate ids exist', () => {
    const first = makeManagedUser('dup', 'First');
    const second = makeManagedUser('dup', 'Second');
    expect(findManagedUserById([first, second], 'dup')).toBe(first);
  });
});

// ---------------------------------------------------------------------------
// Unit tests — resolveActiveManagedUser
// ---------------------------------------------------------------------------

describe('resolveActiveManagedUser', () => {
  it('returns null for an empty list', () => {
    expect(resolveActiveManagedUser([], 'abc')).toBeNull();
  });

  it('returns null when storedId is null', () => {
    const managedusers = [makeManagedUser('abc')];
    expect(resolveActiveManagedUser(managedusers, null)).toBeNull();
  });

  it('returns null when storedId is an empty string', () => {
    const managedusers = [makeManagedUser('abc')];
    expect(resolveActiveManagedUser(managedusers, '')).toBeNull();
  });

  it('returns null when storedId is whitespace', () => {
    const managedusers = [makeManagedUser('abc')];
    expect(resolveActiveManagedUser(managedusers, '   ')).toBeNull();
  });

  it('returns the matching manageduser when storedId is valid', () => {
    const manageduser = makeManagedUser('abc');
    expect(resolveActiveManagedUser([manageduser], 'abc')).toBe(manageduser);
  });

  it('returns null when storedId does not match any manageduser', () => {
    const managedusers = [makeManagedUser('aaa'), makeManagedUser('bbb')];
    expect(resolveActiveManagedUser(managedusers, 'zzz')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

const arbitrarymanagedUserId = fc.string({ minLength: 1, maxLength: 36 });

const arbitraryManagedUser: fc.Arbitrary<ManagedUserProfile> = fc.record({
  managedUserId: arbitrarymanagedUserId,
  displayName: fc.string({ minLength: 1, maxLength: 50 }),
  currentGrade: fc.integer({ min: 0, max: 12 }),
  lastPromotionYear: fc.integer({ min: 2000, max: 2030 }),
});

/** Generates a non-empty list of managedusers with unique managedUserIds. */
const arbitraryUniqueManagedUserList: fc.Arbitrary<ManagedUserProfile[]> =
  fc.uniqueArray(arbitraryManagedUser, {
    selector: (s) => s.managedUserId,
    minLength: 1,
    maxLength: 10,
  });

// ---------------------------------------------------------------------------
// Property 1: localStorage persistence round-trip
// Validates: Requirements 1.6, 7.1, 7.3
// ---------------------------------------------------------------------------

describe('Property 1: localStorage persistence round-trip', () => {
  it('findManagedUserById returns the manageduser when its own id is used', () => {
    fc.assert(
      fc.property(
        arbitraryUniqueManagedUserList,
        fc.integer({ min: 0, max: 9 }),
        (managedusers, rawIndex) => {
          const index = rawIndex % managedusers.length;
          const manageduser = managedusers[index]!;
          const result = findManagedUserById(managedusers, manageduser.managedUserId);
          return result?.managedUserId === manageduser.managedUserId;
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
  it('resolveActiveManagedUser returns null for an id not present in the list', () => {
    fc.assert(
      fc.property(
        arbitraryUniqueManagedUserList,
        fc.string({ minLength: 1, maxLength: 36 }),
        (managedusers, staleId) => {
          // Only test ids that are genuinely absent from the list
          fc.pre(!managedusers.some((s) => s.managedUserId === staleId));
          return resolveActiveManagedUser(managedusers, staleId) === null;
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 12: managedusers array mirrors managedUsers from query
// Validates: Requirements 1.2
// ---------------------------------------------------------------------------

describe('Property 12: managedusers array mirrors managedUsers from query', () => {
  it("resolveActiveManagedUser applied to each element's own id returns that element", () => {
    fc.assert(
      fc.property(arbitraryUniqueManagedUserList, (managedusers) => {
        return managedusers.every((manageduser) => {
          const result = resolveActiveManagedUser(managedusers, manageduser.managedUserId);
          return result?.managedUserId === manageduser.managedUserId;
        });
      }),
      { numRuns: 100 },
    );
  });
});
