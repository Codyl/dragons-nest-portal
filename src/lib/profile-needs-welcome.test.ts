import { describe, it, expect } from 'vitest';
import { profileNeedsWelcome } from './profile-needs-welcome';

describe('profileNeedsWelcome', () => {
  it('is true when first_logged_in_at is missing', () => {
    expect(profileNeedsWelcome({})).toBe(true);
  });

  it('is true when first_logged_in_at is null', () => {
    expect(profileNeedsWelcome({ first_logged_in_at: null })).toBe(true);
  });

  it('is true when first_logged_in_at is empty string', () => {
    expect(profileNeedsWelcome({ first_logged_in_at: '' })).toBe(true);
  });

  it('is false when first_logged_in_at is set', () => {
    expect(
      profileNeedsWelcome({ first_logged_in_at: '2025-01-01T00:00:00.000Z' }),
    ).toBe(false);
  });
});
