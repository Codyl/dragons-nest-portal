import AccountSetupForm from '@/components/forms/account-setup.form'
import AccountSetupGoalsStep from '@/components/steps/account-setup-goals-step'
import AccountSetupInterestsStep from '@/components/steps/account-setup-interests-step'
import AccountSetupProfileStep from '@/components/steps/account-setup-profile-step'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/(private)/_private/account-setup')({
  component: AccountSetup,
})

function AccountSetup() {
  const [step, setStep] = useState(0);
  return (
    <>
      <AccountSetupForm stepIndex={step}>
        {step === 0 && <AccountSetupProfileStep onNext={() => setStep(1)} />}
        {step === 1 && (
          <AccountSetupInterestsStep
            onBack={() => setStep(0)}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && <AccountSetupGoalsStep onBack={() => setStep(1)} />}
      </AccountSetupForm>
    </>
  );
}
