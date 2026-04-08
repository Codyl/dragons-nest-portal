import { z } from 'zod';
import { signupPasswordFieldSchema } from './signup-password-schema';

/**
 * Mirrors `AccountType` in `nest-app/src/users/enums/account-type.enum.ts`
 * and discriminator `User.accountType` in `user.entity.ts`.
 */
export const accountTypeSchema = z.enum(['adult', 'student']);
export type AccountType = z.infer<typeof accountTypeSchema>;

const emailField = z.email('Please enter a valid email address');

const passwordMismatch = {
  message: 'Passwords do not match',
  path: ['confirmPassword'] as const,
};

const emailPasswordShape = {
  email: emailField,
  password: signupPasswordFieldSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
};

/** Shared adult / student credential fields (email + passwords). */
export const signupEmailPasswordSchema = z
  .object(emailPasswordShape)
  .refine((data) => data.password === data.confirmPassword, passwordMismatch);

/** Household adult: names, email, passwords, COPPA (maps to `AccountType.Adult` / `adult`). */
export const householdAdultAccountSignupSchema = z
  .object({
    accountType: z.literal('adult'),
    firstName: z.string().min(1, 'Please enter your first name'),
    lastName: z.string().min(1, 'Please enter your last name'),
    ...emailPasswordShape,
    coppaConsent: z.boolean(),
  })
  .refine((data) => data.password === data.confirmPassword, passwordMismatch)
  .refine((data) => data.coppaConsent === true, {
    message: 'COPPA consent is required to continue',
    path: ['coppaConsent'],
  });

/** Adult signup via email/password only (no COPPA on this step; same `accountType` as household). */
export const adultEmailSignupSchema = z
  .object({
    accountType: z.literal('adult'),
    ...emailPasswordShape,
  })
  .refine((data) => data.password === data.confirmPassword, passwordMismatch);

export const studentAccountSignupSchema = z
  .object({
    accountType: z.literal('student'),
    ...emailPasswordShape,
  })
  .refine((data) => data.password === data.confirmPassword, passwordMismatch);

/**
 * Union of signup payloads (two adult shapes share `accountType: 'adult'`; Zod picks by field shape).
 * Aligned with Nest `CreateUserDto` (`AccountPayloadDto`) / `User.accountType`.
 */
export const userAccountSignupSchema = z.union([
  householdAdultAccountSignupSchema,
  adultEmailSignupSchema,
  studentAccountSignupSchema,
]);

export type UserAccountSignup = z.infer<typeof userAccountSignupSchema>;
export type HouseholdAdultAccountSignup = z.infer<
  typeof householdAdultAccountSignupSchema
>;
