import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(private)/_private/schedule')({
  head: () => ({
    meta: [{ title: 'Schedule | Cody Lillywhite' }],
  }),
  component: ScheduleRoute,
});

function ScheduleRoute() {
  return (
    <div className="p-2">
      <h2 className="text-2xl font-bold">Schedule</h2>
      <p className="text-muted-foreground mt-2 text-sm">Coming soon</p>
    </div>
  );
}
