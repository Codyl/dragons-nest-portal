import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import useCurriculumItems from '@/hooks/use-curriculum-items';
import useCurriculumSelection from '@/hooks/use-curriculum-selection';
import useSetCurriculumSelection from '@/hooks/use-set-curriculum-selection';
import { cn } from '@/lib/utils';

type CurriculumListProps = {
  subjectId: string;
  managedUserId: string | null;
  householdId: string;
};

const CurriculumList = ({
  subjectId,
  managedUserId,
  householdId,
}: CurriculumListProps) => {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useCurriculumItems({
    subjectId,
    managedUserId,
    householdId,
  });

  const { data: selectionData } = useCurriculumSelection({
    subjectId,
    managedUserId,
  });

  const selectMutation = useSetCurriculumSelection({ subjectId, managedUserId });

  // Initialize selectedItemId from persisted value on mount
  useEffect(() => {
    const persistedId = selectionData?.data?.curriculumItemId ?? null;
    if (persistedId) {
      setSelectedItemId(persistedId);
    }
  }, [selectionData]);

  const handleSelect = (itemId: string) => {
    setSelectedItemId(itemId);
    if (managedUserId) {
      selectMutation.mutate({ curriculumItemId: itemId });
    }
  };

  const handlePreview = (itemId: string) => {
    handleSelect(itemId);
    const baseUrl = import.meta.env.VITE_API_URL;
    window.open(`${baseUrl}/curriculum/download/${itemId}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 p-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 p-4 text-center">
        <p className="text-sm text-destructive">
          Failed to load curriculum materials.
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  const items = data?.data ?? [];

  if (items.length === 0) {
    return (
      <p className="p-4 text-center text-sm text-muted-foreground">
        No curriculum materials have been uploaded yet.
      </p>
    );
  }

  return (
    <ul className="flex flex-col divide-y">
      {items.map((item) => (
        <li
          key={item._id}
          className={cn(
            'flex items-center justify-between gap-4 px-4 py-3 cursor-pointer rounded-md transition-colors',
            selectedItemId === item._id
              ? 'ring-2 ring-accent bg-accent/10'
              : 'hover:bg-muted/50',
          )}
          onClick={() => handleSelect(item._id)}
          onDoubleClick={() => handlePreview(item._id)}
        >
          <span className="min-w-0 flex-1 truncate text-sm font-medium">
            {item.fileName}
          </span>
          <span className="shrink-0 text-xs text-muted-foreground">
            {new Date(item.uploadedAt).toLocaleDateString()}
          </span>
        </li>
      ))}
    </ul>
  );
};

export default CurriculumList;
