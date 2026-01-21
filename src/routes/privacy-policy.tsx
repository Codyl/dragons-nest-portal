import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/privacy-policy')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>
    <h1 className="text-2xl font-bold">Privacy Policy</h1>
    <p>No Mobile information will be shared with third parties/affiliates for marketing/promotional purposes.</p>
  </div>
}
