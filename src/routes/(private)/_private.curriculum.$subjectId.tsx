import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/(private)/_private/curriculum/$subjectId',
)({
  component: CurriculumSubjectRoute,
});

function CurriculumSubjectRoute() {
  const { subjectId } = Route.useParams();
  return (
    <div className="p-2">
      <h2 className="text-2xl font-bold">Course Tasks</h2>
      <p className="text-muted-foreground">Subject: {subjectId}</p>
      <p className="text-sm text-muted-foreground">
        Course tasks page coming soon.
      </p>
    </div>
  );
}
