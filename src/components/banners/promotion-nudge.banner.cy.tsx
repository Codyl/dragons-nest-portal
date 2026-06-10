import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PromotionNudgeBanner from './promotion-nudge.banner';

const staleQuery = {
  message: 'ok',
  data: {
    accountType: 'adult' as const,
    householdStudents: [
      {
        studentId: '00000000-0000-4000-8000-000000000001',
        displayName: 'Jamie',
        currentGrade: 5,
        lastPromotionYear: 2024,
      },
    ],
  },
};

describe('PromotionNudgeBanner', () => {
  it('renders in August when promotion is stale', () => {
    cy.clock(new Date(2026, 7, 15).getTime(), ['Date']);
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    client.setQueryData(['user', 'me'], staleQuery);
    cy.mount(
      <QueryClientProvider client={client}>
        <PromotionNudgeBanner />
      </QueryClientProvider>,
    );
    cy.get('[data-testid="promotion-nudge-banner"]').should('be.visible');
    cy.contains('Jamie').should('be.visible');
    cy.contains('6th').should('be.visible');
  });

  it('does not render outside August', () => {
    cy.clock(new Date(2026, 3, 15).getTime(), ['Date']);
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    client.setQueryData(['user', 'me'], staleQuery);
    cy.mount(
      <QueryClientProvider client={client}>
        <PromotionNudgeBanner />
      </QueryClientProvider>,
    );
    cy.get('[data-testid="promotion-nudge-banner"]').should('not.exist');
  });
});
