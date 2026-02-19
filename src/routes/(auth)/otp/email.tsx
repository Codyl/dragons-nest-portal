import CommonCard from '@/components/cards/common-card'
import EmailOTPForm from '@/components/forms/email-otp.form'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)/otp/email')({
  head: () => ({
    meta: [
      { title: "Email Verification | Cody Lillywhite" },
      { name: "description", content: "Enter the verification code sent to your email." },
    ],
  }),
  component: RouteComponent,
})

function RouteComponent() {
  return <div>
    <CommonCard title="Email OTP" description="Enter the code sent to your email">
      <EmailOTPForm />
    </CommonCard>
  </div>
}
