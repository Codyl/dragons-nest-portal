import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useManagedUser } from '@/contexts/managed-user-context';
import useLoggedInUser from '@/hooks/use-logged-in-user';
import useComplianceLaws from '@/hooks/use-compliance-laws';
import { useComplianceCompletion, useToggleComplianceItem } from '@/hooks/use-compliance-completion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import type { HomeschoolPathway } from '@/api/services/compliance.services';
import { ComplianceInfoCards } from './_private.compliance-info-cards';
import ComplianceSidebar from './_private.compliance-sidebar';
import ComplianceSourceLinks from './_private.compliance-links';

export const Route = createFileRoute('/(private)/_private/compliance')({
  head: () => ({
    meta: [{ title: 'Compliance | Cody Lillywhite' }],
  }),
  component: ComplianceRoute,
});

/** Renders a pathway dropdown when there are multiple pathways. Requirements 8.1, 8.2, 8.3 */
export function PathwaySelector({
  pathways,
  selectedIndex,
  onSelect,
}: {
  pathways: HomeschoolPathway[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}) {
  // ponytail: only render when multiple pathways exist (Req 8.1)
  if (pathways.length <= 1) return null;

  return (
    <div className="w-64" data-testid="pathway-selector">
      <Select
        value={String(selectedIndex)}
        onValueChange={(val) => onSelect(Number(val))}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a pathway" />
        </SelectTrigger>
        <SelectContent>
          {pathways.map((pathway, i) => (
            <SelectItem key={pathway.name} value={String(i)}>
              {pathway.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function NoRegulationMessage({ stateName }: { stateName: string }) {
  return (
    <p data-testid="no-regulation-message">
      {stateName} does not have requirements for homeschooling. You are good to
      go!
    </p>
  );
}

const ASSESSMENT_TYPE_LABELS: Record<string, string> = {
  test: 'Standardized Testing Info',
  portfolio: 'Portfolio Template',
  evaluation: 'Evaluation Guide',
  hybrid: 'Assessment Requirements',
};

/** Renders download cards for required documents based on the active pathway. Requirements 3.1–3.4 */
export function DocumentDownloadsSection({ pathway }: { pathway: HomeschoolPathway }) {
  const cards: { title: string; description: string }[] = [];

  if (pathway.notification.required) {
    cards.push({ title: 'Notice of Intent', description: 'Formal notification to your school district of intent to homeschool.' });
  }
  if (pathway.assessment.required) {
    const label = ASSESSMENT_TYPE_LABELS[pathway.assessment.type] ?? 'Assessment Document';
    cards.push({ title: label, description: 'Template for meeting your state assessment requirements.' });
  }
  if (pathway.recordKeeping.required) {
    cards.push({ title: 'IHIP', description: 'Individualized Home Instruction Plan template.' });
  }

  if (cards.length === 0) return null;

  return (
    <section data-testid="document-downloads-section" className="space-y-3">
      <h3 className="text-lg font-semibold">Document Downloads</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardContent className="flex flex-col gap-2 pt-4">
              <p className="font-medium">{card.title}</p>
              <p className="text-muted-foreground text-sm">{card.description}</p>
              <Button size="sm" className="mt-2 w-fit">Download</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

/** ponytail: count visible compliance sections for sidebar totalItems */
function countVisibleSections(pathway: HomeschoolPathway): number {
  let count = 0;
  if (pathway.instructionRequirements.hoursPerYear != null || pathway.instructionRequirements.daysPerYear != null) count++;
  if (pathway.assessment.required) count++;
  if (pathway.requiredSubjects.required) count++;
  if (pathway.recordKeeping.required) count++;
  if (pathway.notification.required) count++;
  return count;
}

function ComplianceRoute() {
  const { activeManagedUser } = useManagedUser();
  const { data: userRes } = useLoggedInUser();

  const state = userRes?.data?.address?.state ?? null;

  const {
    data: complianceLaws,
    isLoading,
    error,
    refetch,
  } = useComplianceLaws(state);

  const [pathwayIndex, setPathwayIndex] = useState(0);
  // Req 8.3: default to pathways[0]; Req 8.2: activePathway drives downstream rendering
  const activePathway = complianceLaws?.pathways[pathwayIndex] ?? null;

  const { data: completionData } = useComplianceCompletion(state, activeManagedUser?.managedUserId);
  const completionItems = completionData?.items ?? {};
  const toggleMutation = useToggleComplianceItem();

  const handleToggle = (itemKey: string, completed: boolean) => {
    toggleMutation.mutate({ state: state!, managedUserId: activeManagedUser!.managedUserId, itemKey, completed });
  };

  const totalItems = activePathway ? countVisibleSections(activePathway) : 0;

  return (
    <div className="space-y-4 p-2">
      <h2 className="text-2xl font-bold">Compliance</h2>
      {activeManagedUser && (
        <p className="text-muted-foreground">
          Viewing compliance for {activeManagedUser.displayName}
        </p>
      )}

      {isLoading && (
        <div className="flex items-center gap-2" data-testid="compliance-loading">
          <Loader2 className="size-6 animate-spin" />
          <span>Loading compliance data...</span>
        </div>
      )}

      {!isLoading && error && (
        <div
          className="rounded-md border border-destructive/40 bg-destructive/5 p-3"
          data-testid="compliance-error"
          role="alert"
        >
          <p className="text-sm text-destructive">
            Unable to load compliance data right now.
          </p>
          <Button
            className="mt-2"
            onClick={() => void refetch()}
            size="sm"
            type="button"
          >
            Retry
          </Button>
        </div>
      )}

      {!isLoading && complianceLaws && (
        <>
          {complianceLaws.regulationProfile.level === 'none' ? (
            <NoRegulationMessage stateName={complianceLaws.state} />
          ) : (
            <div className="flex flex-col gap-6 lg:flex-row">
              {/* Main content area */}
              <div className="flex flex-1 flex-col gap-4">
                <PathwaySelector
                  pathways={complianceLaws.pathways}
                  selectedIndex={pathwayIndex}
                  onSelect={setPathwayIndex}
                />
                {activePathway && (
                  <>
                    <DocumentDownloadsSection pathway={activePathway} />
                    <ComplianceInfoCards
                      pathway={activePathway}
                      completionItems={completionItems}
                      onToggle={handleToggle}
                    />
                    <ComplianceSourceLinks sources={complianceLaws.sources} />
                  </>
                )}
              </div>
              {/* Sidebar */}
              {activePathway && (
                <div className="w-full lg:w-72">
                  <ComplianceSidebar
                    stateName={complianceLaws.state}
                    abbreviation={complianceLaws.abbreviation}
                    compulsoryAttendance={complianceLaws.compulsoryAttendance}
                    pathway={activePathway}
                    completionItems={completionItems}
                    totalItems={totalItems}
                  />
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
