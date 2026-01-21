import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/terms-of-service')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>
    <h1 className="text-2xl font-bold">Terms of Service</h1>
    <p>Users can expect to receive text messages from Mobile for account verification, security alerts, and other important updates. Message and data rates may apply. Message frequency varies. Text HELP for help or STOP to cancel. Email codylillywhite@gmail.com for support.</p>
  </div>
}
