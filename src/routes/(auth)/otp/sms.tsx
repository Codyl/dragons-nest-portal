import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)/otp/sms')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(auth)/sso/sms"!</div>
}
