import {
  Sheet,
  SheetHeader,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from '../ui/sheet';
import { Button } from '../ui/button';
import TeacherList from '@/components/lists/teacher-list';
import { gradeLabel } from '@/lib/grade-label';

const AddTeacherSheet = ({
  subject,
  state,
  grade,
  subjectId,
  studentName,
}: {
  subject: string;
  state: string;
  grade: string;
  subjectId: string;
  studentName: string;
}) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="flex-1">Find A Teacher</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Find A Teacher</SheetTitle>
          <SheetDescription>
            Locate a {gradeLabel(parseInt(grade))} {subject} teacher to help
            teach {studentName}
          </SheetDescription>
        </SheetHeader>
        <div className="max-h-full overflow-y-auto mx-4">
          <TeacherList state={state} grade={grade} subjectId={subjectId} />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AddTeacherSheet;
