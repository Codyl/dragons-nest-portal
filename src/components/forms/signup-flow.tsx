import { useMemo, useState } from 'react';
import { isUnder18, isUnder13 } from '@/lib/signup-age';
import SignupAgeGateStep from './signup-age-gate.step';
import SignupAdultManagedUserForm from './signup-adult.form';
import type { SignupAccountType } from './signup-adult.form';
import {
  SIGNUP_BIRTH_MONTH_KEY,
  SIGNUP_BIRTH_YEAR_KEY,
} from '@/utils/constants/signup.constants';

export function resolveSignupAccountType(
  month: number | '',
  year: number | '',
): SignupAccountType {
  if (month === '' || year === '') return 'manageduser';
  if (isUnder13(month, year)) return 'adult';
  if (isUnder18(month, year)) return 'manageduser';
  return 'adult';
}

type Phase = 'age-gate' | 'credentials';

const SignupFlow = () => {
  const [phase, setPhase] = useState<Phase>('age-gate');
  const [birthMonth, setBirthMonth] = useState<number | ''>('');
  const [birthYear, setBirthYear] = useState<number | ''>('');

  const accountType = useMemo(
    () => resolveSignupAccountType(birthMonth, birthYear),
    [birthMonth, birthYear],
  );

  const onAgeContinue = () => {
    if (birthMonth === '' || birthYear === '') return;
    sessionStorage.setItem(SIGNUP_BIRTH_MONTH_KEY, String(birthMonth));
    sessionStorage.setItem(SIGNUP_BIRTH_YEAR_KEY, String(birthYear));
    setPhase('credentials');
  };

  return (
    <div className="w-full">
      {phase === 'age-gate' && (
        <SignupAgeGateStep
          month={birthMonth}
          year={birthYear}
          onMonthChange={setBirthMonth}
          onYearChange={setBirthYear}
          onContinue={onAgeContinue}
        />
      )}

      {phase === 'credentials' && (
        <div className="bg-card rounded-xl border p-6 shadow-xs">
          <SignupAdultManagedUserForm
            accountType={accountType}
            onBack={() => setPhase('age-gate')}
          />
        </div>
      )}
    </div>
  );
};

export default SignupFlow;
