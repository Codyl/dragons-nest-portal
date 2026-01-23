import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)/_layout')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div className="w-full flex items-center justify-center"><Outlet /></div>
}
