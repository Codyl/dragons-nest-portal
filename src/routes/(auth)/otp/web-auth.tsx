import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)/otp/web-auth')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(auth)/sso/web-auth"!</div>
}
