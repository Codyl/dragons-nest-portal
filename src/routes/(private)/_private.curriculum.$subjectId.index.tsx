import { useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import {
  ArrowLeft,
  BadgeCheck,
  Clock,
  Brain,
  Timer,
  Target,
  Trash2,
  Plus,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import CurriculumModal from '@/components/modals/curriculum.modal';
import { useManagedUser } from '@/contexts/managed-user-context';
import useSubjects from '@/hooks/use-subjects';
import useSubjectConcepts from '@/hooks/use-subject-concepts';
import useSubjectStats from '@/hooks/use-subject-stats';
import useSubjectSummary from '@/hooks/use-subject-summary';
import useActivities from '@/hooks/use-activities';
import useCreateActivity from '@/hooks/use-create-activity';
import useDeleteActivity from '@/hooks/use-delete-activity';
import useConcepts from '@/hooks/use-concepts';
import useCreateResource from '@/hooks/use-create-resource';
import useLoggedInUser from '@/hooks/use-logged-in-user';
import AddTeacherSheet from '@/components/sheets/add-teacher-sheet';
import useGetMyResources from '@/hooks/use-get-my-resources';

export const Route = createFileRoute(
  '/(private)/_private/curriculum/$subjectId/',
)({
  component: CurriculumSubjectRoute,
});

function CurriculumSubjectRoute() {
  const { subjectId } = Route.useParams();
  const { activeManagedUser } = useManagedUser();
  const studentId = activeManagedUser?.studentId ?? '';
  const { data: subjects, isLoading, isError } = useSubjects();
  const { data: conceptsRes } = useSubjectConcepts(subjectId, studentId);
  const { data: userRes } = useLoggedInUser();
  const [filesOpen, setFilesOpen] = useState(false);

  const {
    data: statsRes,
    isError: statsError,
  } = useSubjectStats(subjectId, studentId);
  const stats = statsRes?.data ?? null;

  const {
    data: summaryRes,
    isError: summaryError,
  } = useSubjectSummary(subjectId, studentId);
  const summary = summaryRes?.data ?? null;

  const subject = subjects?.find((s) => s._id === subjectId) ?? null;

  const displayName = subject
    ? subject.name.length > 100
      ? subject.name.slice(0, 100) + '…'
      : subject.name
    : null;

  // ponytail: verified/description fields don't exist on Subject yet — conditional rendering is ready for when they do
  const verified = (subject as Record<string, unknown> | null)?.verified === true;
  const description = (subject as Record<string, unknown> | null)?.description as string | undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="space-y-4">
        <Link
          to="/curriculum"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to Curriculum
        </Link>

        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        )}

        {isError && (
          <p className="text-sm text-destructive">
            Subject information could not be loaded.
          </p>
        )}

        {!isLoading && !isError && subject && (
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              {/* Subject avatar */}
              <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                {subject.name.charAt(0).toUpperCase()}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">{displayName}</h1>
                  {verified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                      <BadgeCheck className="size-3.5" aria-label="Verified subject" />
                      Verified
                    </span>
                  )}
                </div>
                {description && (
                  <p className="text-sm text-muted-foreground max-w-xl">{description}</p>
                )}
              </div>
            </div>
            {/* Actions — right side */}
            <div className="flex flex-col items-end gap-2">
              <AddTeacherSheet
                subject={subject?.name ?? ''}
                state={userRes?.data?.address?.state ?? ''}
                grade={String(activeManagedUser?.currentGrade ?? 0)}
                subjectId={subjectId}
                studentName={activeManagedUser?.displayName ?? ''}
              />
              <div className="flex items-center gap-4 text-sm">
                
                <button
                  type="button"
                  onClick={() => setFilesOpen(true)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  View Files
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Stats Bar */}
      <section aria-label="Subject statistics">
        {statsError && (
          <p className="text-sm text-destructive">Statistics could not be loaded.</p>
        )}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 rounded-xl border bg-card p-5 gap-6">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Progress</p>
              <p className="text-2xl font-bold">{stats.progressPercent}%</p>
              <div className="h-1.5 w-full rounded-full bg-muted">
                <div
                  className="h-1.5 rounded-full bg-primary"
                  style={{ width: `${Math.min(stats.progressPercent, 100)}%` }}
                />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Hours Logged</p>
              <p className="text-2xl font-bold">
                {stats.hoursCompleted}
                <span className="text-sm font-normal text-muted-foreground"> / {stats.hoursTarget}</span>
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Standards Met</p>
              <p className="text-2xl font-bold">
                {stats.standardsMet}
                <span className="text-sm font-normal text-muted-foreground"> / {stats.standardsTotal}</span>
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Documents</p>
              <p className="text-2xl font-bold">{stats.documentsCount}</p>
            </div>
          </div>
        )}
      </section>

      {/* Summary Cards */}
      <section aria-label="Subject summary">
        {summaryError && (
          <p className="text-sm text-destructive">Summary data could not be loaded.</p>
        )}
        {summary && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Brain className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">{summary.mostPracticedConcept ?? '—'}</p>
                <p className="text-xs text-muted-foreground">Most practiced concept</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Timer className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">
                  {summary.totalTimeThisWeek.hours}h {summary.totalTimeThisWeek.minutes}m
                </p>
                <p className="text-xs text-muted-foreground">Total time this week</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Target className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">{summary.averageDifficulty ?? '—'}</p>
                <p className="text-xs text-muted-foreground">Average difficulty</p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Concepts */}
      <section aria-label="Concepts" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Concepts</h2>
            <p className="text-sm text-muted-foreground">
              Total time and last recorded difficulty per concept
            </p>
          </div>
        </div>

        {conceptsRes?.data.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No concepts that have been studied are recorded yet.
          </p>
        )}

        {conceptsRes && conceptsRes.data.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {conceptsRes.data.slice(0, 50).map((concept) => {
              const time =
                concept.totalMinutes < 60
                  ? `${concept.totalMinutes}m`
                  : `${Math.floor(concept.totalMinutes / 60)}h ${String(concept.totalMinutes % 60).padStart(2, '0')}m`;

              const lastDate = concept.lastSessionDate
                ? `Last: ${new Date(concept.lastSessionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                : null;

              const badgeColor =
                concept.difficulty === 'Easy'
                  ? 'bg-green-100 text-green-800'
                  : concept.difficulty === 'Medium'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-red-100 text-red-800';

              return (
                <div
                  key={concept._id}
                  className="rounded-xl border bg-card p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{concept.concept.name}</span>
                    <span
                      className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${badgeColor}`}
                    >
                      {concept.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="size-3.5" />
                      Total time
                    </span>
                    <span className="font-medium text-foreground">{time}</span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${Math.min(concept.progressPercent, 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="size-3.5" />
                      {concept.sessionCount}{' '}
                      {concept.sessionCount === 1 ? 'session' : 'sessions'}
                    </span>
                    {lastDate && <span>{lastDate}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Activities — task 7.4 */}
      <ActivitiesSection subjectId={subjectId} studentId={studentId} />

      {/* Add Resource */}
      <AddResourceSection subjectId={subjectId} subjectName={subject?.name ?? ''} />

      {/* View Files Modal */}
      {subject && (
        <CurriculumModal
          subject={subject}
          open={filesOpen}
          onOpenChange={setFilesOpen}
        />
      )}
    </div>
  );
}

// ponytail: inline component to keep file flat — split if it pushes past ~300 lines
// Grade ordinal (0–13) → concept.grade enum string
const GRADE_ORDINALS = [
  'pre_k', 'k', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12',
] as const;

function ActivitiesSection({
  subjectId,
  studentId,
}: {
  subjectId: string;
  studentId: string;
}) {
  const { activeManagedUser } = useManagedUser();
  const gradeOrdinal = activeManagedUser?.currentGrade;
  const grade = gradeOrdinal != null ? GRADE_ORDINALS[gradeOrdinal] : undefined;

  const { data: activitiesRes } = useActivities(subjectId, studentId);
  const { data: conceptsRes } = useConcepts(subjectId, grade);
  const createActivity = useCreateActivity();
  const deleteActivity = useDeleteActivity(subjectId, studentId);

  const concepts = conceptsRes?.data ?? [];

  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [conceptId, setConceptId] = useState('');
  const [difficulty, setDifficulty] = useState<'' | 'Easy' | 'Medium' | 'Hard'>('');
  const [timeSpentMinutes, setTimeSpentMinutes] = useState(30);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const activities = activitiesRes?.data ?? [];
  // ponytail: API returns sorted; if it didn't, we'd sort client-side
  const sorted = [...activities].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  function validate() {
    const e: Record<string, string> = {};
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
        studentId,
        date,
        conceptId,
        difficulty: difficulty as 'Easy' | 'Medium' | 'Hard',
        timeSpentMinutes,
        ...(notes.trim() && { notes: notes.trim() }),
      },
      {
        onSuccess: () => {
          setShowForm(false);
          setDate(new Date().toISOString().slice(0, 10));
          setConceptId('');
          setDifficulty('');
          setTimeSpentMinutes(30);
          setNotes('');
        },
        onError: (err) => {
          toast.error(
            (err as Error).message || 'Failed to save activity. Please try again.',
          );
        },
      },
    );
  }

  function handleDelete(id: string) {
    if (!window.confirm('Delete this activity?')) return;
    deleteActivity.mutate(id, {
      onError: (err) => {
        toast.error(
          (err as Error).message || 'Failed to delete activity. Please try again.',
        );
      },
    });
  }

  return (
    <section aria-label="Activities" className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Completed Activities</h2>
          <p className="text-sm text-muted-foreground">
            Log each session with concept, time, and difficulty
          </p>
        </div>
        <Button size="sm" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : (
            <>
              <Plus className="size-4" />
              Activity
            </>
          )}
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border bg-card p-5"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_1fr_auto] items-end">
            <div>
              <label className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground" htmlFor="activity-date">
                <Calendar className="size-3.5" />
                Date
              </label>
              <input
                id="activity-date"
                type="date"
                className="block w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              {errors.date && (
                <p className="mt-1 text-xs text-destructive">{errors.date}</p>
              )}
            </div>
            <div>
              <label className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground" htmlFor="activity-concept">
                <Brain className="size-3.5" />
                Concept
              </label>
              <select
                id="activity-concept"
                className="block w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={conceptId}
                onChange={(e) => setConceptId(e.target.value)}
              >
                <option value="">Select concept</option>
                {concepts.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.conceptId && (
                <p className="mt-1 text-xs text-destructive">{errors.conceptId}</p>
              )}
            </div>
            <div>
              <label className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground" htmlFor="activity-difficulty">
                <Target className="size-3.5" />
                Difficulty
              </label>
              <select
                id="activity-difficulty"
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
            {/* Spacer for delete icon column alignment */}
            <div className="hidden sm:block w-8" />
          </div>
          <div>
            <label className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground" htmlFor="activity-time">
              <Clock className="size-3.5" />
              Time Spent
            </label>
            <div className="flex items-center gap-3">
              <input
                id="activity-time"
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
            {/* Tick marks */}
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
          <div>
            <label className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground" htmlFor="activity-notes">
              Notes (optional)
            </label>
            <textarea
              id="activity-notes"
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
      )}

      {sorted.length === 0 && !showForm && (
        <p className="text-sm text-muted-foreground">
          No activities logged yet.
        </p>
      )}

      {sorted.length > 0 && (
        <div className="space-y-3">
          {sorted.map((activity) => {
            const actTime = activity.timeSpentMinutes >= 60
              ? `${Math.floor(activity.timeSpentMinutes / 60)}h ${String(activity.timeSpentMinutes % 60).padStart(2, '0')}m`
              : `${activity.timeSpentMinutes}m`;

            const difficultyBg =
              activity.difficulty === 'Easy'
                ? 'bg-green-50 text-green-800'
                : activity.difficulty === 'Medium'
                  ? 'bg-amber-50 text-amber-800'
                  : 'bg-red-50 text-red-800';

            return (
              <div
                key={activity._id}
                className="rounded-xl border bg-card p-5 space-y-3"
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_1fr_auto] items-end">
                  <div>
                    <p className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="size-3.5" />
                      Date
                    </p>
                    <p className="rounded-md border bg-background px-3 py-2 text-sm">
                      {new Date(activity.date).toLocaleDateString('en-US', {
                        month: '2-digit',
                        day: '2-digit',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Brain className="size-3.5" />
                      Concept
                    </p>
                    <p className="rounded-md border bg-background px-3 py-2 text-sm">
                      {activity.conceptId.name}
                    </p>
                  </div>
                  <div>
                    <p className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Target className="size-3.5" />
                      Difficulty
                    </p>
                    <p className={`rounded-md px-3 py-2 text-sm font-medium ${difficultyBg}`}>
                      {activity.difficulty}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(activity._id)}
                    className="self-end p-2 text-muted-foreground hover:text-destructive transition-colors"
                    aria-label={`Delete activity ${activity.conceptId.name}`}
                    disabled={deleteActivity.isPending}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <div>
                  <p className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="size-3.5" />
                    Time Spent
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${Math.min((activity.timeSpentMinutes / 180) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="rounded-md border bg-background px-2 py-1 text-sm font-medium">
                        {activity.timeSpentMinutes}
                      </span>
                      <span className="text-xs text-muted-foreground">min</span>
                      <span className="ml-2 text-sm font-medium">{actTime}</span>
                    </div>
                  </div>
                  <div className="mt-1 flex justify-between text-[10px] text-muted-foreground px-0.5">
                    <span>5m</span>
                    <span>1h</span>
                    <span>2h</span>
                    <span>3h+</span>
                  </div>
                </div>
                {activity.notes && (
                  <p className="text-sm text-muted-foreground italic">{activity.notes}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function AddResourceSection({
  subjectId,
  subjectName,
}: {
  subjectId: string;
  subjectName: string;
}) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createResource = useCreateResource();
  const { data: resourcesRes } = useGetMyResources(subjectId);
  const resources = resourcesRes?.data ?? [];

  function validate() {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = 'Title is required';
    else if (title.length > 200) e.title = 'Title must be 200 characters or less';
    if (!description.trim()) e.description = 'Description is required';
    else if (description.length > 2000) e.description = 'Description must be 2000 characters or less';
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
    createResource.mutate(
      {
        title: title.trim(),
        description: description.trim(),
        subjectId,
        subjectTag: subjectName,
      },
      {
        onSuccess: () => {
          toast.success('Resource added');
          setShowForm(false);
          setTitle('');
          setDescription('');
        },
        onError: (err) => {
          toast.error(
            (err as Error).message || 'Failed to add resource. Please try again.',
          );
        },
      },
    );
  }

  return (
    <section aria-label="Add resource" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Resources</h2>
        <div className="flex justify-end gap-3.5 items-center">
          <Link
            to="/curriculum/$subjectId/resources"
            params={{ subjectId }}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Community Resources
          </Link>
          <Button size="sm" onClick={() => setShowForm((v) => !v)}>
            {showForm ? 'Cancel' : (
              <>
                <Plus className="size-4" />
                Add Resource
              </>
            )}
          </Button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border p-4">
          <div>
            <label className="text-sm font-medium" htmlFor="resource-title">
              Title
            </label>
            <input
              id="resource-title"
              type="text"
              className="mt-1 block w-full rounded-md border px-3 py-2 text-sm"
              placeholder="e.g. Khan Academy — Fractions"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
            />
            {errors.title && (
              <p className="mt-1 text-xs text-destructive">{errors.title}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="resource-description">
              Description
            </label>
            <textarea
              id="resource-description"
              className="mt-1 block w-full rounded-md border px-3 py-2 text-sm"
              placeholder="Brief description of the resource…"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2000}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-destructive">{errors.description}</p>
            )}
          </div>
          <Button type="submit" size="sm" disabled={createResource.isPending}>
            {createResource.isPending ? 'Saving…' : 'Save Resource'}
          </Button>
        </form>
      )}
      {resources.length > 0 && (
        <ul className="space-y-4">
          {resources.map((resource) => (
            <li
              key={resource._id}
              className="flex items-start gap-3 rounded-lg border p-4"
            >

              <div className="flex-1 space-y-1">
                <p className="font-medium">
                  {resource.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  {resource.description}
                </p>
                <span className="inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {resource.subjectTag}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
      {resources.length === 0 && (
        <div className="text-sm text-muted-foreground">No resources have been added yet.</div>
      )}
    </section>
  );
}
