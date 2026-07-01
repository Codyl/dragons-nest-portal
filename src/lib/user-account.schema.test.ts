import { describe, expect, it } from 'vite-plus/test';
import {
  accountTypeSchema,
  userAccountSignupSchema,
  householdAdultAccountSignupSchema,
  adultEmailSignupSchema,
  manageduserAccountSignupSchema,
} from './user-account.schema';

describe('accountTypeSchema', () => {
  it('accepts valid literals', () => {
    expect(accountTypeSchema.safeParse('adult').success).toBe(true);
    expect(accountTypeSchema.safeParse('manageduser').success).toBe(true);
    expect(accountTypeSchema.safeParse('parent').success).toBe(false);
    expect(accountTypeSchema.safeParse('admin').success).toBe(false);
  });
});

describe('userAccountSignupSchema', () => {
  it('parses household adult branch', () => {
    const r = userAccountSignupSchema.safeParse({
      accountType: 'adult',
      firstName: 'A',
      lastName: 'B',
      email: 'a@b.co',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      coppaConsent: true,
    });
    expect(r.success).toBe(true);
  });

  it('rejects household adult without COPPA', () => {
    const r = householdAdultAccountSignupSchema.safeParse({
      accountType: 'adult',
      firstName: 'A',
      lastName: 'B',
      email: 'a@b.co',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      coppaConsent: false,
    });
    expect(r.success).toBe(false);
  });

  it('parses adult email-only branch', () => {
    const payload = {
      accountType: 'adult' as const,
      email: 'm@b.co',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    };
    expect(userAccountSignupSchema.safeParse(payload).success).toBe(true);
    expect(adultEmailSignupSchema.safeParse(payload).success).toBe(true);
  });

  it('parses manageduser branch', () => {
    const payload = {
      accountType: 'manageduser' as const,
      email: 's@b.co',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    };
    expect(userAccountSignupSchema.safeParse(payload).success).toBe(true);
    expect(manageduserAccountSignupSchema.safeParse(payload).success).toBe(true);
  });
});
