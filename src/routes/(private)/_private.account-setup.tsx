import UserServices from '@/api/services/user.services';
import AccountSetupForm from '@/components/forms/account-setup.form';
import AccountSetupAddStudentsStep from '@/components/steps/account-setup-add-students-step';
import AccountSetupComplianceStep from '@/components/steps/account-setup-compliance-step';
import AccountSetupInterestsStep from '@/components/steps/account-setup-interests-step';
import AccountSetupTeachableStep from '@/components/steps/account-setup-teachable-step';
import { profileNeedsWelcome } from '@/lib/profile-needs-welcome';
import { readSignupAccountTypeFromSession } from '@/utils/constants/signup.constants';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

export const Route = createFileRoute('/(private)/_private/account-setup')({
  loader: async () => {
    const res = await UserServices.getUser();

    if (!profileNeedsWelcome(res.data ?? {})) {
      throw redirect({ to: '/', replace: true });
    }

    return null;
  },
  head: () => ({
    meta: [
      { title: 'Account setup | Cody Lillywhite' },
      {
        name: 'description',
        content:
          'Location, recovery, and preferences before you enter the app.',
      },
    ],
  }),
  component: AccountSetup,
});

function AccountSetup() {
  const [accountType, setAccountType] = useState<'adult' | 'student'>(
    'student',
  );
  const [step, setStep] = useState(0);

  useEffect(() => {
    setAccountType(readSignupAccountTypeFromSession());
  }, []);

  const totalSteps = accountType === 'adult' ? 3 : 2;

  return (
    <AccountSetupForm
      stepIndex={step}
      totalSteps={totalSteps}
    >
      {step === 0 && <AccountSetupComplianceStep onNext={() => setStep(1)} />}

      {accountType === 'student' && step === 1 && (
        <AccountSetupInterestsStep
          isLastStep
          onBack={() => setStep(0)}
          onNext={() => undefined}
        />
      )}

      {accountType === 'adult' && step === 1 && (
        <AccountSetupAddStudentsStep
          onNext={() => setStep(2)}
          onBack={() => setStep(0)}
        />
      )}

      {accountType === 'adult' && step === 2 && (
        <AccountSetupTeachableStep onBack={() => setStep(1)} />
      )}
    </AccountSetupForm>
  );
}
