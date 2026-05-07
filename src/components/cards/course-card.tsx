import type { Subject } from '@/api/services/subjects.services';
import type { TeachableCourseWithEnrollment } from '@/api/services/profile.services';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { HOMESCHOOL_CURRICULUM_OPTIONS } from '@/lib/homeschool-options';

type CourseCardProps = {
  course: TeachableCourseWithEnrollment;
  index: number;
  subjects: Subject[];
  onRemove: (index: number) => void;
  isRemoving: boolean;
};

function resolveCurriculumLabel(curriculum: string): string {
  return (
    HOMESCHOOL_CURRICULUM_OPTIONS.find((o) => o.value === curriculum)?.label ??
    curriculum
  );
}

const CourseCard = ({
  course,
  index,
  subjects,
  onRemove,
  isRemoving,
}: CourseCardProps) => {
  const subject = subjects.find((s) => s._id === course.subjectId);
  const subjectName = subject?.name ?? course.subjectId;
  const gradeDisplay = course.matchesAllGrades
    ? 'All grades'
    : course.grades.join(', ');
  const curriculumLabel = resolveCurriculumLabel(course.curriculum);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{course.className}</CardTitle>
        <p className="text-sm text-muted-foreground">{subjectName}</p>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <dt className="font-medium text-muted-foreground">Grades</dt>
          <dd>{gradeDisplay}</dd>
          <dt className="font-medium text-muted-foreground">Curriculum</dt>
          <dd>{curriculumLabel}</dd>
          <dt className="font-medium text-muted-foreground">Max students</dt>
          <dd>{course.maxStudents}</dd>
        </dl>
        <p className="mt-4 text-xs text-muted-foreground italic">
          To change this course, remove it and add a new one.
        </p>
      </CardContent>
      <CardFooter>
        <Button
          variant="destructive"
          size="sm"
          disabled={isRemoving}
          onClick={() => onRemove(index)}
        >
          Remove
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CourseCard;
