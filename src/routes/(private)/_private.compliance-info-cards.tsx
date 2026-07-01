import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import type { HomeschoolPathway } from '@/api/services/compliance.services';

type ComplianceInfoCardsProps = {
  pathway: HomeschoolPathway;
  completionItems: Record<string, boolean>;
  onToggle: (itemKey: string, completed: boolean) => void;
};

/**
 * Renders compliance info cards conditionally based on the active pathway's flags.
 * Each card includes a checkbox for tracking completion.
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 9.1, 9.2, 9.4, 9.5
 */
export function ComplianceInfoCards({ pathway, completionItems, onToggle }: ComplianceInfoCardsProps) {
  const { instructionRequirements, assessment, requiredSubjects, recordKeeping, notification } = pathway;

  const showHours = instructionRequirements.hoursPerYear != null || instructionRequirements.daysPerYear != null;

  return (
    <div className="flex flex-col gap-4" data-testid="compliance-info-cards">
      {/* Req 4.1: Hours Tracking */}
      {showHours && (
        <ComplianceCard
          title="Hours Tracking"
          itemKey="hoursTracking"
          checked={completionItems.hoursTracking ?? false}
          onToggle={onToggle}
        >
          <ul className="text-sm text-muted-foreground list-disc pl-4">
            {instructionRequirements.hoursPerYear != null && (
              <li>{instructionRequirements.hoursPerYear} hours per year</li>
            )}
            {instructionRequirements.daysPerYear != null && (
              <li>{instructionRequirements.daysPerYear} days per year</li>
            )}
          </ul>
        </ComplianceCard>
      )}

      {/* Req 4.2: Assessment Requirements */}
      {assessment.required && (
        <ComplianceCard
          title="Assessment Requirements"
          itemKey="assessment"
          checked={completionItems.assessment ?? false}
          onToggle={onToggle}
        >
          <ul className="text-sm text-muted-foreground list-disc pl-4">
            <li>Type: {assessment.type}</li>
            <li>Frequency: {assessment.frequency}</li>
          </ul>
        </ComplianceCard>
      )}

      {/* Req 4.3: Required Subjects */}
      {requiredSubjects.required && (
        <ComplianceCard
          title="Required Subjects"
          itemKey="requiredSubjects"
          checked={completionItems.requiredSubjects ?? false}
          onToggle={onToggle}
        >
          <ul className="text-sm text-muted-foreground list-disc pl-4">
            {requiredSubjects.subjects.map((s) => (
              <li key={s.name}>{s.name}</li>
            ))}
          </ul>
        </ComplianceCard>
      )}

      {/* Req 4.4: Record Keeping */}
      {recordKeeping.required && (
        <ComplianceCard
          title="Record Keeping"
          itemKey="recordKeeping"
          checked={completionItems.recordKeeping ?? false}
          onToggle={onToggle}
        >
          <ul className="text-sm text-muted-foreground list-disc pl-4">
            {recordKeeping.details.map((detail) => (
              <li key={detail}>{detail}</li>
            ))}
          </ul>
        </ComplianceCard>
      )}

      {/* Req 4.5: Notification Requirements */}
      {notification.required && (
        <ComplianceCard
          title="Notification Requirements"
          itemKey="notification"
          checked={completionItems.notification ?? false}
          onToggle={onToggle}
        >
          <ul className="text-sm text-muted-foreground list-disc pl-4">
            <li>Frequency: {notification.frequency}</li>
            <li>Recipient: {notification.to}</li>
          </ul>
        </ComplianceCard>
      )}
    </div>
  );
}

/** ponytail: single internal helper — card + checkbox wrapper, not exported */
function ComplianceCard({
  title,
  itemKey,
  checked,
  onToggle,
  children,
}: {
  title: string;
  itemKey: string;
  checked: boolean;
  onToggle: (itemKey: string, completed: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <Card data-testid={`compliance-card-${itemKey}`}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Checkbox
            checked={checked}
            onCheckedChange={(val) => onToggle(itemKey, val)}
            aria-label={`Mark ${title} as complete`}
            data-testid={`checkbox-${itemKey}`}
          />
          <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
