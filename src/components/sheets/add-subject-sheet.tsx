import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from '../ui/sheet';
import { Button } from '../ui/button';
import useSubjects from '@/hooks/use-subjects';
import useAddSubject from '@/hooks/use-add-subject';
import { Loader2 } from 'lucide-react';

type AddSubjectSheetProps = {
  studentId: string;
  studentName: string;
  enrolledSubjectIds: string[];
};

const AddSubjectSheet = ({
  studentId,
  studentName,
  enrolledSubjectIds,
}: AddSubjectSheetProps) => {
  const [open, setOpen] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const { data: subjects, isLoading, isError } = useSubjects();
  const addSubject = useAddSubject(studentId);

  const displayName = studentName || 'this student';
  const isEnrolled = (id: string) => enrolledSubjectIds.includes(id);

  const handleSelect = (id: string) => {
    setSelectedSubjectId((prev) => (prev === id ? null : id));
    setError(null);
  };

  const handleSubmit = () => {
    if (!selectedSubjectId) return;
    setError(null);
    addSubject.mutate(selectedSubjectId, {
      onSuccess: () => {
        setOpen(false);
        setSelectedSubjectId(null);
      },
      onError: (err: unknown) => {
        const message =
          err instanceof Error ? err.message : 'Failed to add subject';
        setError(message);
      },
    });
  };

  return (
    <Sheet open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setSelectedSubjectId(null); setError(null); } }}>
      <SheetTrigger asChild>
        <Button>New Subject</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add New Subject</SheetTitle>
          <SheetDescription>
            Select a subject area to add to {displayName}'s curriculum.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {isError && (
            <p className="text-sm text-destructive py-4">
              Could not load subjects. Please try again later.
            </p>
          )}

          {subjects && (
            <>
              <div
                role="listbox"
                className="grid grid-cols-2 gap-3"
                aria-label="Subject catalog"
              >
                {subjects.map((subject) => {
                  const enrolled = isEnrolled(subject._id);
                  const selected = selectedSubjectId === subject._id;

                  return (
                    <button
                      key={subject._id}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onClick={() => handleSelect(subject._id)}
                      className={`relative flex flex-col items-center gap-2 rounded-lg border p-4 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        selected
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-muted-foreground/50'
                      }`}
                    >
                      <span className="text-2xl">{subject.icon}</span>
                      <span className="text-sm font-medium">
                        {subject.name}
                      </span>
                      {enrolled && (
                        <span className="absolute top-1 right-1 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                          Already added
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {selectedSubjectId && isEnrolled(selectedSubjectId) && (
                <p className="mt-3 text-sm text-muted-foreground">
                  This subject is already part of {displayName}'s curriculum.
                </p>
              )}
            </>
          )}

          {error && (
            <p className="mt-3 text-sm text-destructive">{error}</p>
          )}
        </div>

        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Cancel</Button>
          </SheetClose>
          <Button
            onClick={handleSubmit}
            disabled={!selectedSubjectId}
            isPending={addSubject.isPending}
          >
            Add Subject
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default AddSubjectSheet;
