import { createFileRoute } from '@tanstack/react-router'
import { Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)/mfa/_mfa')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="max-w-md mx-auto">
      <Outlet />
    </div>
  )
}
