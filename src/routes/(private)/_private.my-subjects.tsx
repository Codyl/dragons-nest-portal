import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(private)/_private/my-subjects')({
  head: () => ({
    meta: [{ title: 'My Subjects | Cody Lillywhite' }],
  }),
  component: MySubjectsRoute,
});

function MySubjectsRoute() {
  return (
    <div className="p-2">
      <h2 className="text-2xl font-bold">My Subjects</h2>
      <p className="text-muted-foreground mt-2 text-sm">Coming soon</p>
    </div>
  );
}
