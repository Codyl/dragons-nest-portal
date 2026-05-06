import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(private)/_private/class-requests')({
  head: () => ({
    meta: [{ title: 'Class Requests | Cody Lillywhite' }],
  }),
  component: ClassRequestsRoute,
});

function ClassRequestsRoute() {
  return (
    <div className="p-2">
      <h2 className="text-2xl font-bold">Class Requests</h2>
      <p className="text-muted-foreground mt-2 text-sm">Coming soon</p>
    </div>
  );
}
