import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from '../ui/sheet';
import { Button } from '../ui/button';
import { Brain, Calendar, Clock, Plus, Target } from 'lucide-react';
import { toast } from 'sonner';
import useSubjects from '@/hooks/use-subjects';
import useConcepts from '@/hooks/use-concepts';
import useCreateActivity from '@/hooks/use-create-activity';
import useCreateConcept from '@/hooks/use-create-concept';
import { useManagedUser } from '@/contexts/managed-user-context';

const GRADE_ORDINALS = [
  'pre_k', 'k', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12',
] as const;

type Props = {
  enrolledSubjectIds: string[];
};

export default function RecordActivitySheet({ enrolledSubjectIds }: Props) {
  const [open, setOpen] = useState(false);
  const { activeManagedUser } = useManagedUser();
  const managedUserId = activeManagedUser?.managedUserId ?? '';
  const gradeOrdinal = activeManagedUser?.currentGrade;
  const grade = gradeOrdinal != null ? GRADE_ORDINALS[gradeOrdinal] : undefined;

  const { data: subjects } = useSubjects();
  const enrolledSubjects = subjects?.filter((s) => enrolledSubjectIds.includes(s._id)) ?? [];

  const [subjectId, setSubjectId] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [conceptId, setConceptId] = useState('');
  const [difficulty, setDifficulty] = useState<'' | 'Easy' | 'Medium' | 'Hard'>('');
  const [timeSpentMinutes, setTimeSpentMinutes] = useState(30);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showNewConcept, setShowNewConcept] = useState(false);
  const [newConceptName, setNewConceptName] = useState('');

  const { data: conceptsRes } = useConcepts(subjectId, grade);
  const concepts = conceptsRes?.data ?? [];
  const createActivity = useCreateActivity();
  const createConcept = useCreateConcept();

  function reset() {
    setSubjectId('');
    setDate(new Date().toISOString().slice(0, 10));
    setConceptId('');
    setDifficulty('');
    setTimeSpentMinutes(30);
    setNotes('');
    setErrors({});
    setShowNewConcept(false);
    setNewConceptName('');
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!subjectId) e.subjectId = 'Subject is required';
    if (!date) e.date = 'Date is required';
    if (!conceptId) e.conceptId = 'Concept is required';
    if (!difficulty) e.difficulty = 'Difficulty is required';
    if (!timeSpentMinutes || timeSpentMinutes < 5 || timeSpentMinutes > 180)
      e.timeSpentMinutes = 'Time must be between 5 and 180 minutes';
    return e;
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    createActivity.mutate(
      {
        subjectId,
        managedUserId,
        date,
        conceptId,
        difficulty: difficulty as 'Easy' | 'Medium' | 'Hard',
        timeSpentMinutes,
        ...(notes.trim() && { notes: notes.trim() }),
      },
      {
        onSuccess: () => {
          toast.success('Activity recorded');
          reset();
          setOpen(false);
        },
        onError: (err) => {
          toast.error((err as Error).message || 'Failed to save activity.');
        },
      },
    );
  }

  return (
    <Sheet open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <SheetTrigger asChild>
        <button
          type="button"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Record Activity
        </button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Record Activity</SheetTitle>
          <SheetDescription>
            Log a session for any enrolled subject.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 px-4 pb-4">
          {/* Subject */}
          <div>
            <label className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground" htmlFor="ra-subject">
              Subject
            </label>
            <select
              id="ra-subject"
              className="block w-full rounded-md border bg-background px-3 py-2 text-sm"
              value={subjectId}
              onChange={(e) => { setSubjectId(e.target.value); setConceptId(''); }}
            >
              <option value="">Select subject</option>
              {enrolledSubjects.map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
            {errors.subjectId && (
              <p className="mt-1 text-xs text-destructive">{errors.subjectId}</p>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground" htmlFor="ra-date">
              <Calendar className="size-3.5" />
              Date
            </label>
            <input
              id="ra-date"
              type="date"
              className="block w-full rounded-md border bg-background px-3 py-2 text-sm"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            {errors.date && (
              <p className="mt-1 text-xs text-destructive">{errors.date}</p>
            )}
          </div>

          {/* Concept */}
          <div>
            <label className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground" htmlFor="ra-concept">
              <Brain className="size-3.5" />
              Concept
            </label>
            {!showNewConcept ? (
              <div className="flex gap-2">
                <select
                  id="ra-concept"
                  className="block w-full rounded-md border bg-background px-3 py-2 text-sm"
                  value={conceptId}
                  onChange={(e) => setConceptId(e.target.value)}
                  disabled={!subjectId}
                >
                  <option value="">Select concept</option>
                  {concepts.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowNewConcept(true)}
                  disabled={!subjectId}
                  className="shrink-0 rounded-md border px-2 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                  title="Add custom concept"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  id="ra-concept"
                  type="text"
                  className="block w-full rounded-md border bg-background px-3 py-2 text-sm"
                  placeholder="New concept name…"
                  value={newConceptName}
                  onChange={(e) => setNewConceptName(e.target.value)}
                  maxLength={200}
                />
                <button
                  type="button"
                  disabled={!newConceptName.trim() || createConcept.isPending}
                  onClick={() => {
                    if (!newConceptName.trim() || !grade || !subjectId) return;
                    createConcept.mutate(
                      { subjectId, grade, name: newConceptName.trim() },
                      {
                        onSuccess: (res) => {
                          setConceptId(res.data._id);
                          setNewConceptName('');
                          setShowNewConcept(false);
                          toast.success('Custom concept added');
                        },
                        onError: (err) => {
                          toast.error((err as Error).message || 'Failed to create concept');
                        },
                      },
                    );
                  }}
                  className="shrink-0 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground disabled:opacity-50"
                >
                  {createConcept.isPending ? '…' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowNewConcept(false); setNewConceptName(''); }}
                  className="shrink-0 rounded-md border px-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  ✕
                </button>
              </div>
            )}
            {errors.conceptId && (
              <p className="mt-1 text-xs text-destructive">{errors.conceptId}</p>
            )}
          </div>

          {/* Difficulty */}
          <div>
            <label className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground" htmlFor="ra-difficulty">
              <Target className="size-3.5" />
              Difficulty
            </label>
            <select
              id="ra-difficulty"
              className="block w-full rounded-md border bg-background px-3 py-2 text-sm"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}
            >
              <option value="">Select difficulty</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
            {errors.difficulty && (
              <p className="mt-1 text-xs text-destructive">{errors.difficulty}</p>
            )}
          </div>

          {/* Time */}
          <div>
            <label className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground" htmlFor="ra-time">
              <Clock className="size-3.5" />
              Time Spent
            </label>
            <div className="flex items-center gap-3">
              <input
                id="ra-time"
                type="range"
                min={5}
                max={180}
                value={timeSpentMinutes}
                onChange={(e) => setTimeSpentMinutes(Number(e.target.value))}
                className="flex-1"
              />
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={5}
                  max={180}
                  value={timeSpentMinutes}
                  onChange={(e) => setTimeSpentMinutes(Number(e.target.value))}
                  className="w-14 rounded-md border bg-background px-2 py-1 text-sm text-center"
                  aria-label="Time spent in minutes"
                />
                <span className="text-xs text-muted-foreground">min</span>
                <span className="ml-2 text-sm font-medium">
                  {timeSpentMinutes >= 60
                    ? `${Math.floor(timeSpentMinutes / 60)}h ${String(timeSpentMinutes % 60).padStart(2, '0')}m`
                    : `${timeSpentMinutes}m`}
                </span>
              </div>
            </div>
            <div className="mt-1 flex justify-between text-[10px] text-muted-foreground px-0.5">
              <span>5m</span>
              <span>1h</span>
              <span>2h</span>
              <span>3h+</span>
            </div>
            {errors.timeSpentMinutes && (
              <p className="mt-1 text-xs text-destructive">{errors.timeSpentMinutes}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground" htmlFor="ra-notes">
              Notes (optional)
            </label>
            <textarea
              id="ra-notes"
              className="block w-full rounded-md border bg-background px-3 py-2 text-sm"
              rows={2}
              placeholder="Any notes about this session…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <Button type="submit" size="sm" disabled={createActivity.isPending}>
            {createActivity.isPending ? 'Saving…' : 'Save Activity'}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
