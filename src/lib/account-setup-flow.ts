import { isUnder13, isUnder18 } from '@/lib/signup-age';

/** Same rules as `resolveSignupAccountType` in signup-flow (session fallback). */
function resolveSignupAccountTypeFromSession(
  month: number | '',
  year: number | '',
): 'adult' | 'student' {
  if (month === '' || year === '') return 'student';

  if (isUnder13(month, year)) return 'adult';

  if (isUnder18(month, year)) return 'student';

  return 'adult';
}

export type AccountSetupSetupFlow = 'teen' | 'adult';

/** Age band the birth date must satisfy for the resolved onboarding path. */
export type ExpectedBirthBand = 'adult' | 'teen13to17' | 'under13';

export type ResolvedAccountSetup = {
  setupFlow: AccountSetupSetupFlow;
  expectedBirthBand: ExpectedBirthBand;
  /** Value sent as `accountType` on account-setup submit. */
  formAccountType: 'adult' | 'student';
};

/**
 * Chooses teen vs adult wizard steps from GET /profile `accountStatus` when set,
 * otherwise from signup age-gate session (same rules as `resolveSignupAccountType`).
 */
export function resolveAccountSetupFlow(params: {
  accountStatus: 'MANAGED' | 'INDEPENDENT' | 'ADULT' | null | undefined;
  sessionMonth: number | null;
  sessionYear: number | null;
}): ResolvedAccountSetup {
  const { accountStatus, sessionMonth, sessionYear } = params;

  if (accountStatus === 'INDEPENDENT') {
    return {
      setupFlow: 'teen',
      expectedBirthBand: 'teen13to17',
      formAccountType: 'student',
    };
  }

  if (accountStatus === 'MANAGED') {
    return {
      setupFlow: 'teen',
      expectedBirthBand: 'under13',
      formAccountType: 'student',
    };
  }

  if (accountStatus === 'ADULT') {
    return {
      setupFlow: 'adult',
      expectedBirthBand: 'adult',
      formAccountType: 'adult',
    };
  }

  const m = sessionMonth ?? null;
  const y = sessionYear ?? null;
  const role = resolveSignupAccountTypeFromSession(
    m === null ? '' : m,
    y === null ? '' : y,
  );
  if (role === 'student') {
    return {
      setupFlow: 'teen',
      expectedBirthBand: 'teen13to17',
      formAccountType: 'student',
    };
  }

  return {
    setupFlow: 'adult',
    expectedBirthBand: 'adult',
    formAccountType: 'adult',
  };
}
