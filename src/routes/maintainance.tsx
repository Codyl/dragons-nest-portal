import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/maintainance')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Server is down for maintainance</div>
}
