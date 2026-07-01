import type { ComplianceSource } from '@/api/services/compliance.services';

type ComplianceSourceLinksProps = {
  sources: ComplianceSource[];
};

/** Renders external law reference links. Requirements 5.1, 5.2 */
export default function ComplianceSourceLinks({ sources }: ComplianceSourceLinksProps) {
  if (sources.length === 0) return null;

  return (
    <section data-testid="compliance-source-links" className="space-y-2">
      <h3 className="text-lg font-semibold">External Resources</h3>
      <ul className="space-y-1">
        {sources.map((source) => (
          <li key={source.url}>
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline hover:text-primary/80"
            >
              {source.name}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
