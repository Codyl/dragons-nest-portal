import VerifyUsernameForm from '@/components/forms/verify-username.form'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)/_auth/verify-username')({
  component: RouteComponent,
})

function RouteComponent() {
  useAuth();

  return (
    < Card className="w-full max-w-md" >
      <CardContent>
        <VerifyUsernameForm />
      </CardContent>
    </Card >
  )



}
