import { createFileRoute } from '@tanstack/react-router';
import { useManagedUser } from '@/contexts/managed-user-context';

export const Route = createFileRoute('/(private)/_private/compliance')({
  head: () => ({
    meta: [{ title: 'Compliance | Cody Lillywhite' }],
  }),
  component: ComplianceRoute,
});

function ComplianceRoute() {
  const { activeManagedUser } = useManagedUser();

  return (
    <div className="p-2">
      <h2 className="text-2xl font-bold">Compliance</h2>
      {activeManagedUser && (
        <p className="text-muted-foreground">
          Viewing compliance for {activeManagedUser.displayName}
        </p>
      )}
      {/* Future: fetch compliance data using query key:
          ['student', activeManagedUser.studentId, 'compliance'] */}
      <div className="mt-6 grid gap-4">
        <section>
          <h3 className="font-semibold">Hours Tracking</h3>
          <p className="text-muted-foreground text-sm">Coming soon</p>
        </section>
        <section>
          <h3 className="font-semibold">Progress Reports</h3>
          <p className="text-muted-foreground text-sm">Coming soon</p>
        </section>
        <section>
          <h3 className="font-semibold">State Requirement Tracking</h3>
          <p className="text-muted-foreground text-sm">Coming soon</p>
        </section>
      </div>
    </div>
  );
}
