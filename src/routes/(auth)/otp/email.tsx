import CommonCard from '@/components/cards/common-card'
import EmailOTPForm from '@/components/forms/email-otp.form'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)/otp/email')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>
    <CommonCard title="Email OTP" description="Enter the code sent to your email">
      <EmailOTPForm />
    </CommonCard>
  </div>
}
