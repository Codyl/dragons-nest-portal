export const SIGNUP_MONTHS: { value: number; label: string }[] = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

/** Fifteen interest options; UI shows them in a scrollable pill area (~10 visible). */
export const SIGNUP_MANAGEDUSER_INTEREST_TAGS: string[] = [
  'STEM',
  'Arts',
  'Music',
  'Sports',
  'Reading',
  'Coding',
  'Science',
  'Math',
  'History',
  'Languages',
  'Nature',
  'Gaming',
  'Cooking',
  'Drama',
  'Geography',
];

export const COPPA_CONSENT_TEXT =
  'I certify that I am the parent or legal guardian of the child(ren) who will use this account, ' +
  'that I consent to the collection, use, and disclosure of personal information from my child ' +
  "as described in the Children's Online Privacy Protection Act (COPPA) and this service's " +
  'privacy policy, and that I may review or delete my child’s information and refuse further ' +
  'collection by contacting support. I understand that manageduser profiles I add are managed ' +
  'under my household account and that I am responsible for their accuracy.';

export const SIGNUP_PENDING_MANAGEDUSERS_KEY = 'signupPendingManagedUsers';
/** Birth month (1–12) and year from the signup age gate; used to prefill onboarding. */
export const SIGNUP_BIRTH_MONTH_KEY = 'signupBirthMonth';
export const SIGNUP_BIRTH_YEAR_KEY = 'signupBirthYear';
export const SIGNUP_ROLE_KEY = 'signupRole';
/** Set to `'1'` when household adult completed COPPA; sent on confirm-signup as `coppaConsent`. */
export const SIGNUP_COPPA_CONSENT_KEY = 'signupCoppaConsent';
/** Aligns with `User.givenName` (household adult first name at signup). */
export const SIGNUP_GIVEN_NAME_KEY = 'signupGivenName';
/** Aligns with `User.familyName` (household adult last name at signup). */
export const SIGNUP_FAMILY_NAME_KEY = 'signupFamilyName';

/** Birth month/year from the signup age gate, if present. */
export function readSignupBirthFromSession(): {
  month: number | null;
  year: number | null;
} {
  if (typeof window === 'undefined') {
    return { month: null, year: null };
  }
  const m = sessionStorage.getItem(SIGNUP_BIRTH_MONTH_KEY);
  const y = sessionStorage.getItem(SIGNUP_BIRTH_YEAR_KEY);
  return {
    month: m ? Number.parseInt(m, 10) : null,
    year: y ? Number.parseInt(y, 10) : null,
  };
}

/** Reads `signupRole`; coerces older stored values to `adult` where applicable. */
export function readSignupAccountTypeFromSession(): 'adult' | 'manageduser' {
  const raw = sessionStorage.getItem(SIGNUP_ROLE_KEY);
  if (raw === 'adult' || raw === 'manageduser') return raw;
  if (raw === 'parent' || raw === 'mentor') return 'adult';
  return 'manageduser';
}
