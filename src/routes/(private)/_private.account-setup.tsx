import UserServices from '@/api/services/user.services';
import AccountSetupForm from '@/components/forms/account-setup.form';
import AccountSetupAddStudentsStep from '@/components/steps/account-setup-add-students-step';
import AccountSetupComplianceStep from '@/components/steps/account-setup-compliance-step';
import AccountSetupInterestsStep from '@/components/steps/account-setup-interests-step';
import AccountSetupAvailabilityStep from '@/components/steps/account-setup-availability-step';
import AccountSetupTeachableStep from '@/components/steps/account-setup-teachable-step';
import { resolveAccountSetupFlow } from '@/lib/account-setup-flow';
import { profileNeedsWelcome } from '@/lib/profile-needs-welcome';
import { readSignupBirthFromSession } from '@/utils/constants/signup.constants';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { useMemo, useState } from 'react';

export const Route = createFileRoute('/(private)/_private/account-setup')({
  loader: async () => {
    const res = await UserServices.getUser();

    if (!profileNeedsWelcome(res.data ?? {})) {
      throw redirect({ to: '/', replace: true });
    }

    return {
      accountStatus: res.data?.accountStatus ?? null,
    };
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
  const { accountStatus } = Route.useLoaderData();
  const [step, setStep] = useState(0);

  const sessionBirth = useMemo(() => readSignupBirthFromSession(), []);

  const resolved = useMemo(
    () =>
      resolveAccountSetupFlow({
        accountStatus,
        sessionMonth: sessionBirth.month,
        sessionYear: sessionBirth.year,
      }),
    [accountStatus, sessionBirth.month, sessionBirth.year],
  );

  const { setupFlow, expectedBirthBand, formAccountType } = resolved;
  const totalSteps = setupFlow === 'adult' ? 4 : 3;

  return (
    <AccountSetupForm
      stepIndex={step}
      totalSteps={totalSteps}
      expectedBirthBand={expectedBirthBand}
      initialFormAccountType={formAccountType}
    >
      {step === 0 && <AccountSetupComplianceStep onNext={() => setStep(1)} />}

      {setupFlow === 'teen' && step === 1 && (
        <AccountSetupInterestsStep
          onBack={() => setStep(0)}
          onNext={() => setStep(2)}
        />
      )}

      {setupFlow === 'teen' && step === 2 && (
        <AccountSetupAvailabilityStep
          variant="teen"
          onBack={() => setStep(1)}
          onNext={() => undefined}
          isLastStep
        />
      )}

      {setupFlow === 'adult' && step === 1 && (
        <AccountSetupAddStudentsStep
          onNext={() => setStep(2)}
          onBack={() => setStep(0)}
        />
      )}

      {setupFlow === 'adult' && step === 2 && (
        <AccountSetupAvailabilityStep
          variant="parent"
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
          isLastStep={false}
        />
      )}

      {setupFlow === 'adult' && step === 3 && (
        <AccountSetupTeachableStep onBack={() => setStep(2)} />
      )}
    </AccountSetupForm>
  );
}
