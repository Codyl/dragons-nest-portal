import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PromotionNudgeBanner from './promotion-nudge.banner';

const meta = {
  title: 'Banners/PromotionNudgeBanner',
  component: PromotionNudgeBanner,
  parameters: {
    docs: {
      description: {
        component:
          'Visible only in **August** (local) when `lastPromotionYear` is before the current year. Prefill `/profile` query data via decorator; set your system date to August to see the banner in Storybook.',
      },
    },
  },
  decorators: [
    (Story) => {
      const client = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });
      client.setQueryData(['user', 'me'], {
        message: 'ok',
        data: {
          accountType: 'adult',
          householdStudents: [
            {
              studentDraftId: '00000000-0000-4000-8000-000000000001',
              displayName: 'Jamie',
              currentGrade: 5,
              lastPromotionYear: 2024,
            },
          ],
        },
      });
      return (
        <QueryClientProvider client={client}>
          <div className="max-w-xl p-4">
            <Story />
          </div>
        </QueryClientProvider>
      );
    },
  ],
} satisfies Meta<typeof PromotionNudgeBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
