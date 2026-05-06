import { createFileRoute } from '@tanstack/react-router';
import { useStudent } from '@/contexts/student-context';

export const Route = createFileRoute('/(private)/_private/curriculum')({
  head: () => ({
    meta: [{ title: 'Curriculum | Cody Lillywhite' }],
  }),
  component: CurriculumRoute,
});

function CurriculumRoute() {
  const { activeStudent } = useStudent();

  // Re-renders automatically when activeStudent changes (React context)
  return (
    <div className="p-2">
      <h2 className="text-2xl font-bold">Curriculum</h2>
      {activeStudent && (
        <p className="text-muted-foreground">
          Viewing curriculum for {activeStudent.displayName}
        </p>
      )}
      {/* Future: fetch curriculum data using query key:
          ['student', activeStudent.studentDraftId, 'curriculum'] */}
    </div>
  );
}
