import type { ManagedUserDraftAll } from '@/api/services/profile.services';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { gradeLabel } from '@/lib/grade-label';

export type ManagedUserDraftCardProps = {
  draft: ManagedUserDraftAll;
  onArchive?: (managedUserId: string) => void;
  onRestore?: (managedUserId: string) => void;
  isArchiving?: boolean;
  isRestoring?: boolean;
};

export function ManagedUserDraftCard({
  draft,
  onArchive,
  onRestore,
  isArchiving = false,
  isRestoring = false,
}: ManagedUserDraftCardProps) {
  const archived = Boolean(draft.archivedAt);

  return (
    <Card data-testid="manageduser-card">
      <CardHeader>
        <CardTitle>{draft.displayName}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {gradeLabel(draft.currentGrade)}
        </p>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <dt className="font-medium text-muted-foreground">
            Last promotion year
          </dt>
          <dd>{draft.lastPromotionYear}</dd>
          {archived && draft.archivedAt && (
            <>
              <dt className="font-medium text-muted-foreground">Archived</dt>
              <dd>{new Date(draft.archivedAt).toLocaleDateString()}</dd>
            </>
          )}
        </dl>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        {!archived && onArchive && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isArchiving}
            data-testid="manageduser-draft-archive"
            onClick={() => onArchive(draft.managedUserId)}
          >
            Archive
          </Button>
        )}
        {archived && onRestore && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={isRestoring}
            data-testid="manageduser-draft-restore"
            onClick={() => onRestore(draft.managedUserId)}
          >
            Restore
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default ManagedUserDraftCard;
