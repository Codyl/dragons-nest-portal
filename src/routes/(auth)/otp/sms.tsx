import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)/otp/sms')({
  head: () => ({
    meta: [
      { title: "SMS Verification | Cody Lillywhite" },
      { name: "description", content: "Enter the verification code sent to your phone." },
    ],
  }),
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(auth)/sso/sms"!</div>
}
