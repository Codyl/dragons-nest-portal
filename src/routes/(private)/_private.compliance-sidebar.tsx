import { Card, CardContent } from '@/components/ui/card';
import type { HomeschoolPathway } from '@/api/services/compliance.services';

type ComplianceSidebarProps = {
  stateName: string;
  abbreviation: string;
  compulsoryAttendance: { startAge: number; endAge: number; notes?: string };
  pathway: HomeschoolPathway;
  completionItems: Record<string, boolean>;
  totalItems: number;
};

function getDeadlineLabel(frequency: string, kind: string): string | null {
  if (frequency === 'annual') return `Annual ${kind} required`;
  if (frequency === 'once') return `One-time ${kind} required`;
  if (frequency === 'periodic') return `Periodic ${kind} required`;
  return null;
}

export default function ComplianceSidebar({
  stateName,
  abbreviation,
  compulsoryAttendance,
  pathway,
  completionItems,
  totalItems,
}: ComplianceSidebarProps) {
  const checked = Object.values(completionItems).filter(Boolean).length;
  const percentage = totalItems > 0 ? Math.round((checked / totalItems) * 100) : 0;

  const deadlines: string[] = [];
  const notifDeadline = getDeadlineLabel(pathway.notification.frequency, 'notification');
  if (notifDeadline) deadlines.push(notifDeadline);
  const assessDeadline = getDeadlineLabel(pathway.assessment.frequency, 'assessment');
  if (assessDeadline) deadlines.push(assessDeadline);

  return (
    <aside className="flex flex-col gap-4" data-testid="compliance-sidebar">
      {/* Req 6.1: Completion percentage */}
      <Card>
        <CardContent>
          <p className="text-sm text-muted-foreground">Compliance Progress</p>
          <p className="text-3xl font-bold" data-testid="completion-percentage">
            {percentage}%
          </p>
        </CardContent>
      </Card>

      {/* Req 6.2: State info */}
      <Card>
        <CardContent>
          <p className="text-sm text-muted-foreground">State</p>
          <p className="font-medium">
            {stateName} ({abbreviation})
          </p>
        </CardContent>
      </Card>

      {/* Req 6.3: Compulsory attendance */}
      <Card>
        <CardContent>
          <p className="text-sm text-muted-foreground">Compulsory Attendance</p>
          <p className="font-medium">
            Ages {compulsoryAttendance.startAge}–{compulsoryAttendance.endAge}
          </p>
          {compulsoryAttendance.notes && (
            <p className="text-xs text-muted-foreground mt-1">{compulsoryAttendance.notes}</p>
          )}
        </CardContent>
      </Card>

      {/* Req 6.4: Upcoming deadlines */}
      {deadlines.length > 0 && (
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Upcoming Deadlines</p>
            <ul className="mt-1 space-y-1">
              {deadlines.map((d) => (
                <li key={d} className="text-sm font-medium">
                  {d}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </aside>
  );
}
