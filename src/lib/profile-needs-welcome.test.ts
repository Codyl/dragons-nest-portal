import { describe, it, expect } from 'vite-plus/test';
import { profileNeedsWelcome } from './profile-needs-welcome';

describe('profileNeedsWelcome', () => {
  it('is true when firstLoggedInAt is missing', () => {
    expect(profileNeedsWelcome({})).toBe(true);
  });

  it('is true when firstLoggedInAt is null', () => {
    expect(profileNeedsWelcome({ firstLoggedInAt: null })).toBe(true);
  });

  it('is true when firstLoggedInAt is empty string', () => {
    expect(profileNeedsWelcome({ firstLoggedInAt: '' })).toBe(true);
  });

  it('is false when firstLoggedInAt is set', () => {
    expect(
      profileNeedsWelcome({ firstLoggedInAt: '2025-01-01T00:00:00.000Z' }),
    ).toBe(false);
  });
});
