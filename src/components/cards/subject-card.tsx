import { Link } from '@tanstack/react-router';

type SubjectCardProps = {
  subjectId: string;
  subjectName: string;
  mascotUrl?: string;
  teacherName: string;
};

const SubjectCard = ({
  subjectId,
  subjectName,
  mascotUrl,
  teacherName,
}: SubjectCardProps) => {
  return (
    <Link
      to="/curriculum/$subjectId"
      params={{ subjectId }}
      className="bg-card text-card-foreground flex flex-col items-center gap-4 rounded-xl border p-6 shadow-sm cursor-pointer hover:shadow-md transition-shadow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      aria-label={`${subjectName} curriculum`}
      data-testid="subject-card"
    >
      {mascotUrl ? (
        <img
          src={mascotUrl}
          alt={`${subjectName} mascot`}
          className="h-24 w-24 object-contain"
        />
      ) : (
        <div
          className="flex h-24 w-24 items-center justify-center rounded-full bg-muted"
          aria-hidden="true"
        >
          <span className="text-3xl text-muted-foreground">📚</span>
        </div>
      )}

      <div className="text-center">
        <h3 className="font-semibold leading-none">{subjectName}</h3>
        <p className="mt-2 text-sm text-muted-foreground">Teacher: {teacherName}</p>
      </div>
    </Link>
  );
};

export default SubjectCard;
