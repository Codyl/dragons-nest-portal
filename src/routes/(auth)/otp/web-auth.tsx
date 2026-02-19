import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)/otp/web-auth')({
  head: () => ({
    meta: [
      { title: "Sign In with Passkey | Cody Lillywhite" },
      { name: "description", content: "Use your passkey or security key to sign in." },
    ],
  }),
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(auth)/sso/web-auth"!</div>
}
