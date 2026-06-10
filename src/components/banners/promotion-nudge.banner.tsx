import ProfileServices from '@/api/services/profile.services';
import useLoggedInUser from '@/hooks/use-logged-in-user';
import { homeschoolOrdinalLabel } from '@/lib/homeschool-options';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { X } from 'lucide-react';

/**
 * August (local calendar): nudge adults to confirm grade promotion for stale household drafts.
 */
const PromotionNudgeBanner = () => {
  const queryClient = useQueryClient();
  const { data, isPending } = useLoggedInUser();
  const user = data?.data;
  const [dismissedIds, setDismissedIds] = useState<Record<string, boolean>>(
    {},
  );

  const now = new Date();
  const isAugust = now.getMonth() === 7;
  const calendarYear = now.getFullYear();

  const candidate = useMemo(() => {
    if (!isAugust || user?.accountType !== 'adult') return null;
    const students = user.householdStudents ?? [];
    return (
      students.find(
        (s) =>
          s.lastPromotionYear < calendarYear &&
          s.currentGrade < 13 &&
          !dismissedIds[s.studentId],
      ) ?? null
    );
  }, [isAugust, user, dismissedIds, calendarYear]);

  const promote = useMutation({
    mutationFn: (id: string) => ProfileServices.promoteHouseholdStudent(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    },
  });

  if (isPending || candidate == null) return null;

  const nextLabel = homeschoolOrdinalLabel(candidate.currentGrade + 1);

  return (
    <div
      className="bg-muted/50 border-border mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm shadow-xs"
      role="region"
      aria-label="School year grade promotion"
      data-testid="promotion-nudge-banner"
    >
      <p className="text-foreground min-w-0 flex-1">
        A new school year is here! Is{' '}
        <strong>{candidate.displayName}</strong> moving up to{' '}
        <strong>{nextLabel}</strong>?
      </p>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          type="button"
          size="sm"
          disabled={promote.isPending}
          data-testid="promotion-nudge-confirm"
          onClick={() => promote.mutate(candidate.studentId)}
        >
          Yes, promote
        </Button>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          aria-label="Dismiss promotion reminder"
          data-testid="promotion-nudge-dismiss"
          onClick={() =>
            setDismissedIds((d) => ({
              ...d,
              [candidate.studentId]: true,
            }))
          }
        >
          <X className="size-4" />
        </Button>
      </div>
    </div>
  );
};

export default PromotionNudgeBanner;
