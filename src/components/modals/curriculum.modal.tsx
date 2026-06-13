import type { Subject } from '@/api/services/subjects.services';
import CurriculumFileUploader from '@/components/fields/curriculum-file-uploader';
import CurriculumList from '@/components/lists/curriculum-list';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useStudent } from '@/contexts/student-context';
import useLoggedInUser from '@/hooks/use-logged-in-user';

type CurriculumModalProps = {
  subject: Subject;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const CurriculumModal = ({
  subject,
  open,
  onOpenChange,
}: CurriculumModalProps) => {
  const { data: profileData } = useLoggedInUser();
  const { activeStudent } = useStudent();

  const studentId = activeStudent?.studentId ?? null;
  const householdId = profileData?.data?._id ?? '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{subject.name} — Curriculum</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto min-h-0">
          <CurriculumList
            subjectId={subject._id}
            studentId={studentId}
            householdId={householdId}
          />
        </div>
        <CurriculumFileUploader
          subjectId={subject._id}
          studentId={studentId}
          householdId={householdId}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CurriculumModal;
