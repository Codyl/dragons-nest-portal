import VerifyUsernameForm from '@/components/forms/verify-username.form'
import CommonCard from '@/components/cards/common-card'
import { useAuth } from '@/hooks/use-auth'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)/_auth/verify-username')({
  component: RouteComponent,
})

function RouteComponent() {
  useAuth();

  return (
    <CommonCard title="Verify Username" description="Enter your username to verify your account">
      <VerifyUsernameForm />
    </CommonCard>
  )



}
